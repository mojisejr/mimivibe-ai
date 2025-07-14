import { auth } from '@clerk/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateTarotReading } from '@/lib/langgraph/workflow'
import { createReadingStream, createSSEHeaders, WORKFLOW_STEPS } from '@/lib/utils/streaming'

export async function POST(request: NextRequest) {
  let streamController: any = null

  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
          path: '/api/readings/ask'
        }, 
        { status: 401 }
      )
    }

    const body = await request.json()
    const { question, useStream = false } = body

    // Validate question
    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad request',
          message: 'Question is required',
          timestamp: new Date().toISOString(),
          path: '/api/readings/ask'
        },
        { status: 400 }
      )
    }

    if (question.length < 10 || question.length > 500) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad request',
          message: 'Question must be between 10-500 characters',
          timestamp: new Date().toISOString(),
          path: '/api/readings/ask'
        },
        { status: 400 }
      )
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
      return NextResponse.json(
        {
          success: false,
          error: 'Not found',
          message: 'User not found',
          timestamp: new Date().toISOString(),
          path: '/api/readings/ask'
        },
        { status: 404 }
      )
    }

    // Check if user has enough credits (freePoint or stars)
    const totalCredits = user.freePoint + user.stars
    if (totalCredits < 1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient credits',
          message: 'Not enough credits for reading',
          timestamp: new Date().toISOString(),
          path: '/api/readings/ask'
        },
        { status: 400 }
      )
    }

    // If streaming is requested, create SSE stream
    if (useStream) {
      const { stream, controller } = createReadingStream()
      streamController = controller

      // Start async processing
      processReadingWithStream(userId, question, streamController)
        .catch(error => {
          console.error('Stream processing error:', error)
          streamController?.sendError('Failed to generate reading')
          streamController?.close()
        })

      return new Response(stream, {
        headers: createSSEHeaders()
      })
    }

    // Non-streaming response
    const result = await processReading(userId, question)
    
    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Reading generation error:', error)
    
    if (streamController) {
      streamController.sendError('Internal server error')
      streamController.close()
      return new Response('', { status: 200 })
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Failed to generate reading',
        timestamp: new Date().toISOString(),
        path: '/api/readings/ask'
      },
      { status: 500 }
    )
  }
}

async function processReadingWithStream(userId: string, question: string, controller: any) {
  try {
    // Send progress updates
    controller.sendProgress(
      WORKFLOW_STEPS.VALIDATING.step,
      WORKFLOW_STEPS.VALIDATING.message,
      WORKFLOW_STEPS.VALIDATING.progress
    )

    controller.sendProgress(
      WORKFLOW_STEPS.SELECTING_CARDS.step,
      WORKFLOW_STEPS.SELECTING_CARDS.message,
      WORKFLOW_STEPS.SELECTING_CARDS.progress
    )

    controller.sendProgress(
      WORKFLOW_STEPS.ANALYZING.step,
      WORKFLOW_STEPS.ANALYZING.message,
      WORKFLOW_STEPS.ANALYZING.progress
    )

    controller.sendProgress(
      WORKFLOW_STEPS.GENERATING.step,
      WORKFLOW_STEPS.GENERATING.message,
      WORKFLOW_STEPS.GENERATING.progress
    )

    // Generate reading
    const result = await processReading(userId, question)

    controller.sendProgress(
      WORKFLOW_STEPS.FINALIZING.step,
      WORKFLOW_STEPS.FINALIZING.message,
      WORKFLOW_STEPS.FINALIZING.progress
    )

    // Send final result
    controller.sendReading(result)

    controller.sendProgress(
      WORKFLOW_STEPS.COMPLETED.step,
      WORKFLOW_STEPS.COMPLETED.message,
      WORKFLOW_STEPS.COMPLETED.progress
    )

    controller.sendComplete()
    controller.close()

  } catch (error) {
    console.error('Stream processing error:', error)
    controller.sendError(error instanceof Error ? error.message : 'Unknown error')
    controller.close()
  }
}

async function processReading(userId: string, question: string) {
  // Generate reading using LangGraph workflow
  const workflowResult = await generateTarotReading(question)

  // Process in database transaction
  const result = await prisma.$transaction(async (tx) => {
    // Get current user state
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { 
        stars: true, 
        coins: true, 
        exp: true, 
        level: true,
        freePoint: true 
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Determine credit deduction (freePoint first, then stars)
    let deltaFreePoint = 0
    let deltaStars = 0

    if (user.freePoint > 0) {
      deltaFreePoint = -1
    } else if (user.stars > 0) {
      deltaStars = -1
    } else {
      throw new Error('Insufficient credits')
    }

    // Create reading record
    const readingId = `reading_${Date.now()}_${userId.slice(-8)}`
    
    const reading = await tx.reading.create({
      data: {
        id: readingId,
        userId,
        question,
        answer: JSON.stringify({
          questionAnalysis: workflowResult.questionAnalysis,
          reading: workflowResult.reading
        }),
        type: 'TAROT_READING'
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
        deltaCoins: 0,
        deltaExp: 25, // Reward EXP for reading
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
    const newExp = user.exp + 25
    const newLevel = Math.floor(newExp / 100) + 1

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        freePoint: user.freePoint + deltaFreePoint,
        stars: user.stars + deltaStars,
        coins: user.coins + 5, // Reward coins
        exp: newExp,
        level: Math.max(user.level, newLevel)
      }
    })

    return {
      readingId: reading.id,
      questionAnalysis: workflowResult.questionAnalysis,
      cards: workflowResult.selectedCards,
      reading: workflowResult.reading,
      rewards: {
        exp: 25,
        coins: 5
      },
      newBalances: {
        freePoint: updatedUser.freePoint,
        stars: updatedUser.stars,
        coins: updatedUser.coins,
        exp: updatedUser.exp,
        level: updatedUser.level
      },
      createdAt: reading.createdAt.toISOString()
    }
  })

  return result
}