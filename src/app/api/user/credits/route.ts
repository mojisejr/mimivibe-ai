import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic'

export async function GET() {
  const requestTimestamp = new Date().toISOString()
  console.log(`🔍 [${requestTimestamp}] Credits API called - Starting authentication check`)

  try {
    const { userId } = auth()
    console.log(`🔑 [${requestTimestamp}] Clerk auth result - userId: ${userId ? userId : 'null/undefined'}`)

    if (!userId) {
      console.log(`❌ [${requestTimestamp}] Authentication failed - no userId from Clerk auth()`)
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
          timestamp: requestTimestamp,
          path: '/api/user/credits',
          debug: {
            clerkAuth: 'no_user_id',
            step: 'authentication_check'
          }
        },
        { status: 401 }
      )
    }

    console.log(`✅ [${requestTimestamp}] Authentication successful for userId: ${userId}`)

    console.log(`🔍 [${requestTimestamp}] Querying database for userId: ${userId}`)

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        stars: true,
        coins: true,
        freePoint: true,
        level: true,
        exp: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      console.log(`❌ [${requestTimestamp}] User NOT FOUND in database for userId: ${userId}`)
      console.log(`🔍 [${requestTimestamp}] Debugging: This suggests Clerk userId doesn't match any User record`)
      console.log(`💡 [${requestTimestamp}] Possible causes:`)
      console.log(`   - User record creation via webhook is still pending`)
      console.log(`   - Clerk userId format mismatch with database User.id`)
      console.log(`   - Database transaction rollback occurred`)

      // Check if any similar User records exist (for debugging)
      try {
        const recentUsers = await prisma.user.findMany({
          select: { id: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 3
        })
        console.log(`📊 [${requestTimestamp}] Recent users in database:`, recentUsers.map(u => `${u.id} (${u.createdAt})`).join(', '))
      } catch (debugError) {
        console.log(`⚠️ [${requestTimestamp}] Could not fetch debug user info:`, debugError)
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Not found',
          message: 'User not found',
          timestamp: requestTimestamp,
          path: '/api/user/credits',
          debug: {
            clerkUserId: userId,
            step: 'database_lookup',
            possibleCauses: [
              'webhook_pending',
              'userid_mismatch',
              'transaction_rollback'
            ]
          }
        },
        { status: 404 }
      )
    }

    console.log(`✅ [${requestTimestamp}] User found in database:`, {
      id: user.id,
      stars: user.stars,
      coins: user.coins,
      freePoint: user.freePoint,
      level: user.level,
      exp: user.exp,
      createdAt: user.createdAt,
      accountAge: Math.round((Date.now() - user.createdAt.getTime()) / 1000) + 's'
    })

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
    console.error(`❌ [${requestTimestamp}] Credits fetch error:`, error)
    console.error(`🔍 [${requestTimestamp}] Error details:`, {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: typeof error
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch user credits',
        timestamp: requestTimestamp,
        path: '/api/user/credits',
        debug: {
          errorType: error instanceof Error ? error.constructor.name : typeof error,
          step: 'exception_handler'
        }
      },
      { status: 500 }
    )
  }
}