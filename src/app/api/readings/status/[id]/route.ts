import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getReadingById } from '@/lib/database/reading-status'
import { ReadingStatus, ReadingStatusResponse } from '@/types/reading'

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const readingId = params.id
    if (!readingId) {
      return NextResponse.json(
        { error: 'Reading ID is required' },
        { status: 400 }
      )
    }

    // Get reading from database
    const reading = await getReadingById(readingId)
    if (!reading) {
      return NextResponse.json(
        { error: 'Reading not found' },
        { status: 404 }
      )
    }

    // Check ownership
    if (reading.userId !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Prepare response based on status
    const response: ReadingStatusResponse = {
      success: true,
      data: {
        readingId: reading.id,
        status: reading.status as ReadingStatus,
        processingStartedAt: reading.processingStartedAt?.toISOString() || null,
        processingCompletedAt: reading.processingCompletedAt?.toISOString() || null,
        errorMessage: reading.errorMessage
      }
    }

    // Add reading data if completed
    if (reading.status === ReadingStatus.COMPLETED && reading.answer) {
      // Transform database reading to API format
      response.data.reading = {
        readingId: reading.id,
        question: reading.question,
        questionAnalysis: {
          mood: 'general', // Default values since we don't store these separately
          topic: 'general',
          period: 'present'
        },
        cards: [], // Will be populated from reading structure
        reading: reading.answer as any, // Cast to ReadingStructure
        rewards: {
          exp: 10, // Default reward values
          coins: 5
        },
        transactionId: reading.id, // Use reading ID as transaction ID
        selectedCards: [], // Will be populated from reading structure
        createdAt: reading.createdAt.toISOString(),
        isSaved: true
      }
    }

    // Add estimated time remaining if processing
    if (reading.status === ReadingStatus.PROCESSING && reading.processingStartedAt) {
      const processingTime = Date.now() - reading.processingStartedAt.getTime()
      const estimatedTotal = 60000 // 60 seconds estimated processing time
      const remaining = Math.max(0, estimatedTotal - processingTime)
      response.data.estimatedTimeRemaining = Math.ceil(remaining / 1000)
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error checking reading status:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to check reading status'
      },
      { status: 500 }
    )
  }
}