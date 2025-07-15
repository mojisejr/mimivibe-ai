// Round 7A: New API format without SSE streaming
import { auth } from '@clerk/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateTarotReading } from '@/lib/langgraph/workflow'
import type { ReadingResponse, ReadingError } from '@/types/reading'

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
    const workflowResult = await generateTarotReading(question)

    // Process in database transaction
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

      // Create reading record with new JSON structure
      const readingId = `reading_${Date.now()}_${userId.slice(-8)}`
      
      const reading = await tx.reading.create({
        data: {
          id: readingId,
          userId,
          question: question.trim(),
          answer: workflowResult.reading as any, // Store as JSON object
          type: 'tarot'
        }
      })

      // Create reading-card relationships
      await tx.readingCard.createMany({
        data: workflowResult.selectedCards.map(card => ({
          readingId: reading.id,
          cardId: card.id,
          position: card.position
        }))
      })

      // Create transaction record for credit deduction
      await tx.pointTransaction.create({
        data: {
          id: `txn_${Date.now()}_${userId.slice(-8)}`,
          userId,
          eventType: 'READING_SPEND',
          deltaPoint: deltaStars,
          deltaCoins: 5, // Reward coins
          deltaExp: 25, // Reward EXP
          metadata: {
            reason: 'Tarot reading generation',
            readingId: reading.id,
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
        readingId: reading.id,
        question: question.trim(),
        questionAnalysis: workflowResult.questionAnalysis,
        cards: workflowResult.reading.cards_reading, // Full card objects for display
        reading: workflowResult.reading, // Complete reading structure
        rewards: {
          exp: 25,
          coins: 5
        },
        createdAt: reading.createdAt.toISOString()
      }
    })

    return NextResponse.json({
      success: true,
      data: result
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