// Round 7A: New API format without SSE streaming
import { auth } from '@clerk/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateTarotReading } from '@/lib/langgraph/workflow-with-db'
import type { ReadingResponse, ReadingError } from '@/types/reading'
import { getSafeExpValue, getSafeLevelValue } from '@/lib/feature-flags'
import { getReferralRewards, toLegacyRewardFormat } from '@/lib/utils/rewards'
import { analyzeUserInput, validateTarotQuestion, calculateUserSuspicionLevel } from '@/lib/security/ai-protection'
import { aiRateLimit, securityAiRateLimit } from '@/lib/rate-limiter'
import { sanitizeString } from '@/lib/validations'
import { 
  handleAPIError, 
  createValidationError, 
  createDatabaseError,
  createAIError,
  validateQuestion,
  validateCredits,
  shouldUseLegacyFormat 
} from '@/lib/error-handler'
import { ErrorCode } from '@/types/error'

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      const useLegacy = shouldUseLegacyFormat(request.headers.get('user-agent') || undefined);
      return handleAPIError(
        new Error('Unauthorized access'),
        '/api/readings/ask',
        useLegacy
      );
    }

    // Get client information for security checks
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Apply AI-specific rate limiting
    const aiRateLimitResult = await aiRateLimit(request)
    if (aiRateLimitResult) {
      return aiRateLimitResult
    }

    const body = await request.json()
    const { question, language = 'th' } = body

    // Validate question using standardized validation
     const questionValidationError = validateQuestion(question, '/api/readings/ask');
     if (questionValidationError) {
       const useLegacy = shouldUseLegacyFormat(request.headers.get('user-agent') || undefined);
       const statusCode = questionValidationError.error.code === ErrorCode.INVALID_INPUT ? 400 : 422;
       
       if (useLegacy) {
         return NextResponse.json(
           {
             success: false,
             error: questionValidationError.error.code,
             message: questionValidationError.error.message,
             timestamp: questionValidationError.error.timestamp,
             path: questionValidationError.error.path
           },
           { status: statusCode }
         );
       }
       
       return NextResponse.json(questionValidationError, { status: statusCode });
     }

    // Perform AI security analysis
    const securityAnalysis = analyzeUserInput(question, userAgent, clientIP)
    
    // Block high-risk or critical content
     if (securityAnalysis.isBlocked) {
       // Apply stricter rate limiting for suspicious users
       const securityRateLimitResult = await securityAiRateLimit(request)
       if (securityRateLimitResult) {
         return securityRateLimitResult
       }
       
       return NextResponse.json({
         success: false,
         error: 'Content blocked',
         message: 'Your question contains inappropriate content. Please rephrase and try again.',
         timestamp: new Date().toISOString(),
         path: '/api/readings/ask'
       } as ReadingError, { status: 400 })
     }
 
     // Validate tarot-specific content
     const tarotValidation = validateTarotQuestion(question)
     if (!tarotValidation.isValid) {
       const issueMessage = tarotValidation.issues.length > 0 ? tarotValidation.issues[0] : 'Please ask a question suitable for tarot reading.'
       return NextResponse.json({
         success: false,
         error: 'Invalid question',
         message: issueMessage,
         timestamp: new Date().toISOString(),
         path: '/api/readings/ask'
       } as ReadingError, { status: 400 })
     }

    // Sanitize the question
    const sanitizedQuestion = sanitizeString(securityAnalysis.sanitizedContent, 500)

    // Get user and check credits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true,
        stars: true, 
        coins: true, 
        exp: true, 
        level: true,
        freePoint: true 
      }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Not found',
        message: 'User not found',
        timestamp: new Date().toISOString(),
        path: '/api/readings/ask'
      } as ReadingError, { status: 404 })
    }

    // Check user credits using standardized validation
    const creditsValidationError = validateCredits(
      { stars: user.stars, freePoint: user.freePoint },
      '/api/readings/ask'
    );
    if (creditsValidationError) {
      const useLegacy = shouldUseLegacyFormat(request.headers.get('user-agent') || undefined);
      const statusCode = 402; // Payment Required
      
      if (useLegacy) {
        return NextResponse.json(
          {
            success: false,
            error: creditsValidationError.error.code,
            message: creditsValidationError.error.message,
            timestamp: creditsValidationError.error.timestamp,
            path: creditsValidationError.error.path
          },
          { status: statusCode }
        );
      }
      
      return NextResponse.json(creditsValidationError, { status: statusCode });
    }

    // Generate reading using LangGraph workflow
    let workflowResult
    try {
      workflowResult = await generateTarotReading(sanitizedQuestion, userId)
      
      // Check if workflow returned an error
      if (workflowResult.error) {
        throw new Error(workflowResult.error)
      }
      
      // Validate that we have the required reading data
      if (!workflowResult.reading) {
        throw new Error('Failed to generate reading - no reading data returned')
      }
    } catch (error) {
      const useLegacy = shouldUseLegacyFormat(request.headers.get('user-agent') || undefined);
      
      // Handle timeout error - don't deduct credits
      if (error instanceof Error && error.message.includes('Reading timeout')) {
        return handleAPIError(
          createAIError('timeout', '/api/readings/ask', error.message),
          '/api/readings/ask',
          useLegacy
        );
      }
      
      // Handle other AI errors
      return handleAPIError(
        createAIError('generation', '/api/readings/ask', error instanceof Error ? error.message : String(error)),
        '/api/readings/ask',
        useLegacy
      );
    }

    // Deduct credits only after successful reading generation
    const result = await prisma.$transaction(async (tx) => {
      // Get current user state again within transaction
      const currentUser = await tx.user.findUnique({
        where: { id: userId },
        select: { 
          stars: true, 
          coins: true, 
          exp: true, 
          level: true,
          freePoint: true 
        }
      })

      if (!currentUser) {
        throw new Error('User not found')
      }

      // Determine credit deduction (freePoint first, then stars)
      let deltaFreePoint = 0
      let deltaStars = 0

      if (currentUser.freePoint > 0) {
        deltaFreePoint = -1
      } else if (currentUser.stars > 0) {
        deltaStars = -1
      } else {
        throw new Error('Insufficient credits')
      }

      // Create transaction record for credit deduction (reading generation)
      const transactionId = `txn_${Date.now()}_${userId.slice(-8)}`
      await tx.pointTransaction.create({
        data: {
          id: transactionId,
          userId,
          eventType: 'READING_SPEND',
          deltaPoint: deltaStars,
          deltaCoins: 5, // Reward coins
          deltaExp: 25, // Reward EXP
          metadata: {
            reason: 'Tarot reading generation',
            freePointUsed: -deltaFreePoint,
            starsUsed: -deltaStars,
            questionLength: sanitizedQuestion.length,
            securityAnalysis: {
              riskLevel: securityAnalysis.riskLevel,
              confidence: securityAnalysis.confidence,
              detectedPatterns: securityAnalysis.detectedPatterns
            }
          }
        }
      })

      // Update user credits and stats
      // TEMP_DISABLED: EXP system disabled via feature flags
      const newExp = getSafeExpValue(currentUser.exp + 25)
      const newLevel = getSafeLevelValue(Math.floor(newExp / 100) + 1)

      await tx.user.update({
        where: { id: userId },
        data: {
          freePoint: currentUser.freePoint + deltaFreePoint,
          stars: currentUser.stars + deltaStars,
          coins: currentUser.coins + 5, // Reward coins
          exp: newExp, // Will be 0 when EXP system disabled
          level: Math.max(currentUser.level, newLevel) // Will remain current level when disabled
        }
      })

      return {
        transactionId,
        creditsUsed: {
          freePoint: -deltaFreePoint,
          stars: -deltaStars
        },
        rewards: {
          exp: 25,
          coins: 5
        }
      }
    })

    // Generate temporary reading ID for frontend (not saved to database yet)
    const temporaryReadingId = `temp_reading_${Date.now()}_${userId.slice(-8)}`
    
    // Return reading data without saving to database
    const readingResult = {
      readingId: temporaryReadingId,
      question: sanitizedQuestion,
      questionAnalysis: workflowResult.questionAnalysis,
      cards: workflowResult.reading.cards_reading, // Full card objects for display
      reading: workflowResult.reading, // Complete reading structure
      rewards: result.rewards,
      transactionId: result.transactionId,
      selectedCards: workflowResult.selectedCards, // Store for later saving
      createdAt: new Date().toISOString(),
      isSaved: false // Indicate this reading is not saved yet
    }

    // Try to claim referral reward for first reading (async, don't wait for result)
    try {
      // Check if this is the user's first reading and claim referral reward
      const userReadingCount = await prisma.reading.count({
        where: { userId, isDeleted: false }
      })
      
      if (userReadingCount === 0) { // Changed from === 1 to === 0 since we haven't saved the reading yet
        // This is first reading, try to claim referral reward
        const referralCode = await prisma.referralCode.findFirst({
          where: { 
            userId, 
            referredBy: { not: null },
            isUsed: true 
          }
        })
        
        if (referralCode?.referredBy) {
          // Fetch dynamic referral rewards from RewardConfiguration
          const rewardConfig = await getReferralRewards()
          const referrerReward = toLegacyRewardFormat(rewardConfig.inviter)
          
          await prisma.$transaction(async (tx) => {
            await tx.user.update({
              where: { id: referralCode.referredBy! },
              data: {
                exp: { increment: referrerReward.exp },
                coins: { increment: referrerReward.coins },
                stars: { increment: referrerReward.stars },
                freePoint: { increment: referrerReward.freePoint || 0 }
              }
            })
            
            await tx.pointTransaction.create({
              data: {
                id: `referral_first_reading_${referralCode.referredBy!}_${Date.now()}`,
                userId: referralCode.referredBy!,
                eventType: 'REFERRAL_FIRST_READING',
                deltaPoint: referrerReward.stars,
                deltaCoins: referrerReward.coins,
                deltaExp: referrerReward.exp,
                metadata: { 
                  referredUserId: userId,
                  readingId: readingResult.readingId,
                  rewardType: 'first_reading_completion',
                  freePointAwarded: referrerReward.freePoint || 0
                }
              }
            })
          })
        }
      }
    } catch (referralError) {
      // Log but don't fail the reading request
      // Referral reward claim failed (optional) - non-critical
    }

    return NextResponse.json({
      success: true,
      data: readingResult
    } as ReadingResponse)

  } catch (error) {
    console.error('Database transaction error:', error)
    const useLegacy = shouldUseLegacyFormat(request.headers.get('user-agent') || undefined);
    return handleAPIError(
      createDatabaseError('/api/readings/ask', error instanceof Error ? error.message : String(error), true),
      '/api/readings/ask',
      useLegacy
    );
  }
}