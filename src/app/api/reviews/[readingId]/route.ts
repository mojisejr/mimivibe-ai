import { auth } from '@clerk/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface ReviewRequestBody {
  accurateLevel: number
  comment?: string
}

// Submit a review for a reading
export async function POST(
  request: NextRequest,
  { params }: { params: { readingId: string } }
) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { readingId } = params
    const body: ReviewRequestBody = await request.json()
    const { accurateLevel, comment } = body

    // Validate input
    if (typeof accurateLevel !== 'number' || accurateLevel < 0 || accurateLevel > 100) {
      return NextResponse.json(
        { error: 'accurateLevel must be a number between 0 and 100' },
        { status: 400 }
      )
    }

    // Validate comment length if provided
    if (comment && comment.length > 500) {
      return NextResponse.json(
        { error: 'Comment must be 500 characters or less' },
        { status: 400 }
      )
    }

    // Check if reading exists and belongs to user
    const reading = await prisma.reading.findFirst({
      where: {
        id: readingId,
        userId,
        isDeleted: false
      }
    })

    if (!reading) {
      return NextResponse.json(
        { error: 'Reading not found or access denied' },
        { status: 404 }
      )
    }

    // Check if already reviewed
    const existingReview = await prisma.review.findFirst({
      where: {
        readingId,
        userId
      }
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'Reading already reviewed' },
        { status: 409 }
      )
    }

    // Review rewards
    const reviewRewards = {
      exp: 10,
      coins: 2
    }

    // Create review and distribute rewards
    const result = await prisma.$transaction(async (tx) => {
      // Create review
      const review = await tx.review.create({
        data: {
          readingId,
          userId,
          accurateLevel,
          // Note: 'liked' field in schema, but we're using accurateLevel for rating
          liked: accurateLevel >= 50, // Convert to boolean for existing schema
          reviewPeriod: Math.floor(
            (new Date().getTime() - new Date(reading.createdAt).getTime()) / (1000 * 60 * 60 * 24)
          ) // Days since reading
        }
      })

      // Update reading as reviewed
      await tx.reading.update({
        where: { id: readingId },
        data: { isReviewed: true }
      })

      // Update user with rewards
      await tx.user.update({
        where: { id: userId },
        data: {
          exp: { increment: reviewRewards.exp },
          coins: { increment: reviewRewards.coins }
        }
      })

      // Record reward transaction
      await tx.pointTransaction.create({
        data: {
          id: `review_${readingId}_${userId}_${Date.now()}`,
          userId,
          eventType: 'REVIEW_REWARD',
          deltaPoint: 0,
          deltaCoins: reviewRewards.coins,
          deltaExp: reviewRewards.exp,
          metadata: {
            readingId,
            accurateLevel,
            reviewId: review.id,
            comment: comment || null
          }
        }
      })

      return { review, rewards: reviewRewards }
    })

    return NextResponse.json({
      success: true,
      data: {
        reviewId: result.review.id,
        rewards: result.rewards,
        message: 'Review submitted successfully'
      }
    })

  } catch (error) {
    console.error('Review submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get review for a reading
export async function GET(
  request: NextRequest,
  { params }: { params: { readingId: string } }
) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { readingId } = params

    // Get review if exists
    const review = await prisma.review.findFirst({
      where: {
        readingId,
        userId
      },
      select: {
        id: true,
        accurateLevel: true,
        createdAt: true,
        reviewPeriod: true,
        liked: true
      }
    })

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: review
    })

  } catch (error) {
    console.error('Review fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}