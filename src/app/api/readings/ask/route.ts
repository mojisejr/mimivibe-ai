// Round 7A: New API format without SSE streaming
import { auth } from '@clerk/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateTarotReading } from '@/lib/langgraph/workflow-with-db'
import type { ReadingResponse, ReadingError } from '@/types/reading'
import { getSafeExpValue, getSafeLevelValue } from '@/lib/feature-flags'
import { getReferralRewards, toLegacyRewardFormat } from '@/lib/utils/rewards'
import { rateLimit, aiReadingRateLimitConfig, aiAbuseRateLimitConfig } from '@/lib/rate-limiter'
import { 
  validateTarotQuestion, 
  logSecurityEvent, 
  SecurityEventType, 
  checkAIAbusePattern 
} from '@/lib/security/ai-protection'

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
        path: '/api/readings/ask'
      } as ReadingError, { status: 401 })
    }

    // Check for AI abuse patterns
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                    request.headers.get('x-real-ip') || 'unknown'
    const abuseCheck = checkAIAbusePattern(userId, clientIP)
    
    if (abuseCheck.isAbuser) {
      // Log security event
      logSecurityEvent(
        SecurityEventType.AI_ABUSE_DETECTED,
        abuseCheck.riskLevel === 'high' ? 'critical' : 'high',
        request,
        {
          endpoint: '/api/readings/ask',
          metadata: {
            userId,
            riskLevel: abuseCheck.riskLevel,
            reason: abuseCheck.reason
          }
        },
        true
      )
      
      // Apply abuse rate limiting
      const abuseRateLimit = await rateLimit(request, aiAbuseRateLimitConfig)
      if (abuseRateLimit) {
        return abuseRateLimit
      }
    } else {
      // Apply normal AI reading rate limiting
      const readingRateLimit = await rateLimit(request, aiReadingRateLimitConfig)
      if (readingRateLimit) {
        // Log rate limit exceeded event
        logSecurityEvent(
          SecurityEventType.RATE_LIMIT_EXCEEDED,
          'medium',
          request,
          {
            endpoint: '/api/readings/ask',
            metadata: {
              userId,
              rateLimitType: 'ai_reading'
            }
          },
          true
        )
        return readingRateLimit
      }
    }

    const body = await request.json()
    const { question, language = 'th' } = body

    // Validate question
    if (!question || typeof question !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Invalid question',
        message: 'Question is required and must be a string',
        timestamp: new Date().toISOString(),
        path: '/api/readings/ask'
      } as ReadingError, { status: 400 })
    }

    // Enhanced security validation for tarot question
    const questionValidation = validateTarotQuestion(question)
    
    if (questionValidation.blocked) {
      // Log security event for blocked question
      logSecurityEvent(
        SecurityEventType.MALICIOUS_INPUT,
        'high',
        request,
        {
          input: question.substring(0, 100), // Log first 100 chars only
          endpoint: '/api/readings/ask',
          metadata: {
            userId,
            issues: questionValidation.issues,
            blocked: true
          }
        },
        true
      )
      
      return NextResponse.json({
        success: false,
        error: 'Invalid question content',
        message: 'Question contains inappropriate or potentially harmful content',
        timestamp: new Date().toISOString(),
        path: '/api/readings/ask'
      } as ReadingError, { status: 400 })
    }
    
    if (!questionValidation.isValid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid question',
        message: questionValidation.issues.join(', '),
        timestamp: new Date().toISOString(),
        path: '/api/readings/ask'
      } as ReadingError, { status: 400 })
    }
    
    // Log suspicious patterns (non-blocking)
    if (questionValidation.issues.length > 0) {
      logSecurityEvent(
        SecurityEventType.SUSPICIOUS_PATTERN,
        'low',
        request,
        {
          input: question.substring(0, 100),
          endpoint: '/api/readings/ask',
          metadata: {
            userId,
            issues: questionValidation.issues,
            blocked: false
          }
        },
        false
      )
    }
    
    // Use sanitized question for processing
    const sanitizedQuestion = questionValidation.sanitized
    
    if (sanitizedQuestion.length < 10 || sanitizedQuestion.length > 500) {
      return NextResponse.json({
        success: false,
        error: 'Invalid question length',
        message: 'Question must be between 10 and 500 characters',
        timestamp: new Date().toISOString(),
        path: '/api/readings/ask'
      } as ReadingError, { status: 400 })
    }

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

    // Check if user has enough credits (freePoint or stars)
    const totalCredits = user.freePoint + user.stars
    if (totalCredits < 1) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient credits',
        message: 'Not enough credits for reading',
        timestamp: new Date().toISOString(),
        path: '/api/readings/ask'
      } as ReadingError, { status: 400 })
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
      // Handle timeout error - don't deduct credits
      if (error instanceof Error && error.message.includes('Reading timeout')) {
        return NextResponse.json({
          success: false,
          error: 'Reading timeout',
          message: error.message,
          timestamp: new Date().toISOString(),
          path: '/api/readings/ask'
        } as ReadingError, { status: 408 }) // 408 Request Timeout
      }
      // Re-throw other errors
      throw error
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
            questionLength: question.length
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
      question: sanitizedQuestion.trim(),
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
    console.error('Reading generation error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to generate reading',
      timestamp: new Date().toISOString(),
      path: '/api/readings/ask'
    } as ReadingError, { status: 500 })
  }
}