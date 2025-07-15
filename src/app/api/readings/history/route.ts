import { auth } from '@clerk/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { ReadingStructure } from '@/types/reading'

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
          path: '/api/readings/history'
        }, 
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50) // Max 50 per page
    const offset = (page - 1) * limit

    // Get readings with their associated cards
    const [readings, total] = await Promise.all([
      prisma.reading.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          question: true,
          answer: true,
          type: true,
          createdAt: true,
          cards: {
            select: {
              position: true,
              Card: {
                select: {
                  id: true,
                  name: true,
                  displayName: true,
                  arcana: true,
                  shortMeaning: true,
                  keywords: true,
                  imageUrl: true
                }
              }
            },
            orderBy: { position: 'asc' }
          }
        }
      }),
      prisma.reading.count({
        where: { userId }
      })
    ])

    // Format readings for response
    const formattedReadings = readings.map(reading => {
      // Handle new JSON structure (answer is ReadingStructure)
      const readingAnswer = reading.answer as unknown as ReadingStructure
      return {
        id: reading.id,
        question: reading.question,
        answer: readingAnswer, // Now JSON object instead of string
        type: reading.type,
        cards: reading.cards.map(rc => ({
          id: rc.Card.id,
          name: rc.Card.name,
          displayName: rc.Card.displayName,
          imageUrl: rc.Card.imageUrl,
          position: rc.position
        })),
        createdAt: reading.createdAt.toISOString(),
        isReviewed: false // Add for compatibility
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        readings: formattedReadings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasMore: offset + readings.length < total
        }
      }
    })
  } catch (error) {
    console.error('Reading history fetch error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch reading history',
        timestamp: new Date().toISOString(),
        path: '/api/readings/history'
      },
      { status: 500 }
    )
  }
}

// Get a specific reading by ID
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
          path: '/api/readings/history'
        }, 
        { status: 401 }
      )
    }

    const body = await request.json()
    const { readingId } = body

    if (!readingId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad request',
          message: 'Reading ID is required',
          timestamp: new Date().toISOString(),
          path: '/api/readings/history'
        },
        { status: 400 }
      )
    }

    const reading = await prisma.reading.findFirst({
      where: { 
        id: readingId,
        userId // Ensure user can only access their own readings
      },
      select: {
        id: true,
        question: true,
        answer: true,
        type: true,
        createdAt: true,
        cards: {
          select: {
            position: true,
            Card: {
              select: {
                id: true,
                name: true,
                displayName: true,
                arcana: true,
                shortMeaning: true,
                keywords: true,
                imageUrl: true
              }
            }
          },
          orderBy: { position: 'asc' }
        }
      }
    })

    if (!reading) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not found',
          message: 'Reading not found',
          timestamp: new Date().toISOString(),
          path: '/api/readings/history'
        },
        { status: 404 }
      )
    }

    // Format reading for response
    const readingAnswer = reading.answer as unknown as ReadingStructure
    const formattedReading = {
      id: reading.id,
      question: reading.question,
      answer: readingAnswer, // Now JSON object instead of string
      type: reading.type,
      cards: reading.cards.map(rc => ({
        id: rc.Card.id,
        name: rc.Card.name,
        displayName: rc.Card.displayName,
        imageUrl: rc.Card.imageUrl,
        position: rc.position
      })),
      createdAt: reading.createdAt.toISOString(),
      isReviewed: false // Add for compatibility
    }

    return NextResponse.json({
      success: true,
      data: formattedReading
    })
  } catch (error) {
    console.error('Reading fetch error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch reading',
        timestamp: new Date().toISOString(),
        path: '/api/readings/history'
      },
      { status: 500 }
    )
  }
}