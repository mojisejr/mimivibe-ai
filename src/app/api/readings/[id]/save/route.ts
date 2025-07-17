import { auth } from '@clerk/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
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

    // Update reading as saved (or create a saved reading record if needed)
    // For now, we'll just mark it as reviewed
    await prisma.reading.update({
      where: { id: readingId },
      data: { isReviewed: true }
    })

    return NextResponse.json({
      success: true,
      saved: true,
      message: 'Reading saved successfully'
    })

  } catch (error) {
    console.error('Save reading error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}