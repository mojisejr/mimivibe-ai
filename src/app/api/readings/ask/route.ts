// Round 7A: New API format without SSE streaming
import { auth } from '@clerk/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateTarotReading } from '@/lib/langgraph/workflow'
import type { ReadingResponse, ReadingError } from '@/types/reading'

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

    const body = await request.json()
    const { question, language = 'th' } = body

    // Validate question
    if (!question || typeof question !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Bad request',
        message: 'Question is required',
        timestamp: new Date().toISOString(),
        path: '/api/readings/ask'
      } as ReadingError, { status: 400 })
    }

    if (question.length < 10 || question.length > 500) {
      return NextResponse.json({
        success: false,
        error: 'Bad request',
        message: 'Question must be between 10-500 characters',
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
      workflowResult = await generateTarotReading(question)
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
      const newExp = currentUser.exp + 25
      const newLevel = Math.floor(newExp / 100) + 1

      await tx.user.update({
        where: { id: userId },
        data: {
          freePoint: currentUser.freePoint + deltaFreePoint,
          stars: currentUser.stars + deltaStars,
          coins: currentUser.coins + 5, // Reward coins
          exp: newExp,
          level: Math.max(currentUser.level, newLevel)
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
      question: question.trim(),
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
          // Give referrer reward
          const { referrerReward } = await import('@/lib/gamification/levels').then(m => m.GAMIFICATION_CONFIG.referral)
          
          await prisma.$transaction(async (tx) => {
            await tx.user.update({
              where: { id: referralCode.referredBy! },
              data: {
                exp: { increment: referrerReward.exp },
                coins: { increment: referrerReward.coins },
                stars: { increment: referrerReward.stars }
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
                  rewardType: 'first_reading_completion'
                }
              }
            })
          })
        }
      }
    } catch (referralError) {
      // Log but don't fail the reading request
      console.log('Referral reward claim failed (optional):', referralError)
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