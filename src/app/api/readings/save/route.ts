import { auth } from '@clerk/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { ReadingError } from '@/types/reading'

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
        path: '/api/readings/save'
      } as ReadingError, { status: 401 })
    }

    const body = await request.json()
    const { readingId, question, answer, selectedCards, transactionId } = body

    // Validate required fields
    if (!readingId || !question || !answer || !selectedCards || !transactionId) {
      return NextResponse.json({
        success: false,
        error: 'Bad request',
        message: 'Missing required fields',
        timestamp: new Date().toISOString(),
        path: '/api/readings/save'
      } as ReadingError, { status: 400 })
    }

    // Generate permanent reading ID
    const permanentReadingId = `reading_${Date.now()}_${userId.slice(-8)}`

    // Save reading to database
    const result = await prisma.$transaction(async (tx) => {
      // Create reading record
      const reading = await tx.reading.create({
        data: {
          id: permanentReadingId,
          userId,
          question: question.trim(),
          answer: answer, // Store as JSON object (Prisma handles JSON type)
          type: 'tarot',
          isDeleted: false,
          isReviewed: false
        }
      })

      // Create reading-card relationships
      if (selectedCards && selectedCards.length > 0) {
        await tx.readingCard.createMany({
          data: selectedCards.map((card: any) => ({
            readingId: reading.id,
            cardId: card.id,
            position: card.position
          }))
        })
      }

      // Update the transaction record to include the permanent reading ID
      const existingTransaction = await tx.pointTransaction.findUnique({ 
        where: { id: transactionId } 
      });
      
      if (existingTransaction) {
        await tx.pointTransaction.update({
          where: { id: transactionId },
          data: {
            metadata: {
              ...(existingTransaction?.metadata as any || {}),
              readingId: reading.id,
              permanentReadingId: reading.id
            }
          }
        })
      }

      return {
        readingId: reading.id,
        createdAt: reading.createdAt.toISOString()
      }
    })

    // Check for achievements after successful reading save
    try {
      const { AchievementService } = await import('@/lib/services/AchievementService');
      await AchievementService.checkAndTriggerAchievements(userId, 'READING');
    } catch (error) {
      console.error('Achievement check failed (non-critical):', error);
      // Don't fail the reading save if achievement check fails
    }

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Reading save error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to save reading',
      timestamp: new Date().toISOString(),
      path: '/api/readings/save'
    } as ReadingError, { status: 500 })
  }
}