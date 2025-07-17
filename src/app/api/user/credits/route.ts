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
          path: '/api/user/credits'
        }, 
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        stars: true,
        coins: true,
        freePoint: true,
        level: true,
        exp: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Not found',
          message: 'User not found',
          timestamp: new Date().toISOString(),
          path: '/api/user/credits'
        }, 
        { status: 404 }
      )
    }

    // Calculate daily/monthly limits
    const now = new Date()
    const startOfDay = new Date(now.setHours(0, 0, 0, 0))
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get today's usage
    const todayUsage = await prisma.pointTransaction.count({
      where: {
        userId,
        eventType: 'READING_SPEND',
        createdAt: { gte: startOfDay }
      }
    })

    // Get this month's usage
    const monthUsage = await prisma.pointTransaction.count({
      where: {
        userId,
        eventType: 'READING_SPEND', 
        createdAt: { gte: startOfMonth }
      }
    })

    const dailyFreeLimit = 3
    const monthlyFreeLimit = 50

    return NextResponse.json({
      success: true,
      data: {
        stars: user.stars,
        coins: user.coins,
        freePoint: user.freePoint,
        level: user.level,
        exp: user.exp,
        total: user.stars + user.freePoint, // Total available credits for readings
        limits: {
          dailyFree: {
            used: Math.min(todayUsage, dailyFreeLimit),
            max: dailyFreeLimit,
            resetAt: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000).toISOString()
          },
          monthlyFree: {
            used: Math.min(monthUsage, monthlyFreeLimit),
            max: monthlyFreeLimit,
            resetAt: new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 1).toISOString()
          }
        }
      }
    })
  } catch (error) {
    console.error('Credits fetch error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch user credits',
        timestamp: new Date().toISOString(),
        path: '/api/user/credits'
      },
      { status: 500 }
    )
  }
}