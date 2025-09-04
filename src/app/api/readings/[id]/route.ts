import { auth } from '@clerk/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const readingId = params.id

    // Get reading with cards
    const reading = await prisma.reading.findFirst({
      where: {
        id: readingId,
        userId: userId,
        isDeleted: false
      },
      include: {
        cards: {
          include: {
            Card: true
          },
          orderBy: { position: 'asc' }
        }
      }
    })

    if (!reading) {
      return NextResponse.json(
        { success: false, error: 'Reading not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: reading.id,
        question: reading.question,
        answer: reading.answer,
        type: reading.type,
        cards: reading.cards.map(rc => ({
          id: rc.Card.id,
          name: rc.Card.name,
          displayName: rc.Card.displayName,
          imageUrl: rc.Card.imageUrl,
          position: rc.position,
          shortMeaning: rc.Card.shortMeaning,
          arcana: rc.Card.arcana,
          keywords: rc.Card.keywords
        })),
        createdAt: reading.createdAt.toISOString(),
        updatedAt: reading.updatedAt.toISOString(),
        isReviewed: reading.isReviewed,
        isDeleted: reading.isDeleted
      }
    })

  } catch (error) {
    console.error('Get reading error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const readingId = params.id

    // Check if reading exists and belongs to user
    const reading = await prisma.reading.findFirst({
      where: {
        id: readingId,
        userId: userId,
        isDeleted: false
      }
    })

    if (!reading) {
      return NextResponse.json(
        { success: false, error: 'Reading not found' },
        { status: 404 }
      )
    }

    // Soft delete the reading
    await prisma.reading.update({
      where: { id: readingId },
      data: { 
        isDeleted: true,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      deleted: true,
      message: 'Reading deleted successfully'
    })

  } catch (error) {
    console.error('Delete reading error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}