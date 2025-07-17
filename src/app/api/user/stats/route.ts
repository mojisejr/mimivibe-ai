import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
          path: '/api/user/stats'
        }, 
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        Reading: {
          where: { isDeleted: false },
          select: { 
            id: true,
            isReviewed: true,
            createdAt: true
          }
        },
        Review: {
          select: { accurateLevel: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Not found',
          message: 'User not found',
          timestamp: new Date().toISOString(),
          path: '/api/user/stats'
        }, 
        { status: 404 }
      )
    }

    // Calculate level progression (simple formula: level * 100 exp required)
    const expRequired = user.level * 100
    const expToNext = Math.max(0, expRequired - user.exp)

    // Calculate accuracy from reviews
    const reviewedReadings = user.Review.filter(r => r.accurateLevel !== null && r.accurateLevel !== undefined)
    const avgAccuracy = reviewedReadings.length > 0 
      ? Math.round(reviewedReadings.reduce((sum, r) => sum + (r.accurateLevel || 0), 0) / reviewedReadings.length)
      : 0

    // Calculate login streak (simplified - would need proper implementation)
    // For now, return 0 as placeholder
    const loginStreak = 0

    return NextResponse.json({
      success: true,
      data: {
        level: user.level,
        exp: user.exp,
        expRequired,
        expToNext,
        coins: user.coins,
        stars: user.stars,
        freePoint: user.freePoint,
        totalReadings: user.Reading.length,
        avgAccuracy,
        loginStreak,
        role: user.role,
        prestigeLevel: user.prestigeLevel || 0,
        prestigePoints: user.prestigePoints || 0
      }
    })
  } catch (error) {
    console.error('Stats fetch error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch user statistics',
        timestamp: new Date().toISOString(),
        path: '/api/user/stats'
      },
      { status: 500 }
    )
  }
}