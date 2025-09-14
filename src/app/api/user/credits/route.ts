import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateUser } from '@/lib/utils/jit-user'

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

    console.log(`🔧 [${requestTimestamp}] Using JIT provisioning to ensure user exists for userId: ${userId}`)

    let user
    try {
      user = await getOrCreateUser(userId)
      console.log(`✅ [${requestTimestamp}] JIT: User ready for credits query:`, {
        id: user.id,
        stars: user.stars,
        coins: user.coins,
        freePoint: user.freePoint,
        wasJitProvisioned: !user.createdAt || (Date.now() - user.createdAt.getTime()) < 5000 // Created within last 5 seconds
      })

    } catch (jitError) {
      console.error(`❌ [${requestTimestamp}] JIT provisioning failed for userId: ${userId}`, jitError)

      return NextResponse.json(
        {
          success: false,
          error: 'User provisioning failed',
          message: 'Could not create or retrieve user account',
          timestamp: requestTimestamp,
          path: '/api/user/credits',
          debug: {
            clerkUserId: userId,
            step: 'jit_provisioning',
            error: jitError instanceof Error ? jitError.message : 'Unknown JIT error'
          }
        },
        { status: 500 }
      )
    }

    console.log(`✅ [${requestTimestamp}] JIT: User ready for credits calculation:`, {
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