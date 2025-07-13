import { auth } from '@clerk/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
          path: '/api/credits/transactions'
        }, 
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100) // Max 100 per page
    const offset = (page - 1) * limit

    const [transactions, total] = await Promise.all([
      prisma.pointTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          eventType: true,
          deltaPoint: true,
          deltaCoins: true,
          deltaExp: true,
          createdAt: true
        }
      }),
      prisma.pointTransaction.count({
        where: { userId }
      })
    ])

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasMore: offset + transactions.length < total
        }
      }
    })
  } catch (error) {
    console.error('Transaction history fetch error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch transaction history',
        timestamp: new Date().toISOString(),
        path: '/api/credits/transactions'
      },
      { status: 500 }
    )
  }
}

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
          path: '/api/credits/transactions'
        }, 
        { status: 401 }
      )
    }

    const body = await request.json()
    const { eventType, deltaPoint = 0, deltaCoins = 0, deltaExp = 0, metadata } = body

    // Validate required fields
    if (!eventType) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad request',
          message: 'eventType is required',
          timestamp: new Date().toISOString(),
          path: '/api/credits/transactions'
        },
        { status: 400 }
      )
    }

    // Validate event types
    const validEventTypes = ['READING_SPEND', 'STRIPE_TOPUP', 'REWARD', 'COIN_TO_STAR', 'DAILY_LOGIN', 'REFERRAL']
    if (!validEventTypes.includes(eventType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad request',
          message: 'Invalid eventType',
          timestamp: new Date().toISOString(),
          path: '/api/credits/transactions'
        },
        { status: 400 }
      )
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get current user
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { stars: true, coins: true, exp: true, level: true }
      })

      if (!user) {
        throw new Error('User not found')
      }

      // Validate sufficient credits for spending
      if (deltaPoint < 0 && (user.stars + deltaPoint) < 0) {
        throw new Error('Insufficient credits')
      }

      if (deltaCoins < 0 && (user.coins + deltaCoins) < 0) {
        throw new Error('Insufficient coins')
      }

      // Create transaction record
      const transaction = await tx.pointTransaction.create({
        data: {
          id: `txn_${Date.now()}_${userId.slice(-8)}`, // Generate unique ID
          userId,
          eventType,
          deltaPoint,
          deltaCoins,
          deltaExp
        }
      })

      // Update user credits
      const newExp = user.exp + deltaExp
      const newLevel = Math.floor(newExp / 100) + 1 // Simple leveling: every 100 exp = 1 level

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          stars: user.stars + deltaPoint,
          coins: user.coins + deltaCoins,
          exp: newExp,
          level: Math.max(user.level, newLevel) // Never decrease level
        }
      })

      return { transaction, updatedUser }
    })

    return NextResponse.json({
      success: true,
      data: {
        transaction: result.transaction,
        newBalances: {
          stars: result.updatedUser.stars,
          coins: result.updatedUser.coins,
          exp: result.updatedUser.exp,
          level: result.updatedUser.level
        }
      }
    })

  } catch (error) {
    console.error('Transaction creation error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    if (errorMessage === 'User not found') {
      return NextResponse.json(
        {
          success: false,
          error: 'Not found',
          message: 'User not found',
          timestamp: new Date().toISOString(),
          path: '/api/credits/transactions'
        },
        { status: 404 }
      )
    }

    if (errorMessage === 'Insufficient credits' || errorMessage === 'Insufficient coins') {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad request',
          message: errorMessage,
          timestamp: new Date().toISOString(),
          path: '/api/credits/transactions'
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Failed to create transaction',
        timestamp: new Date().toISOString(),
        path: '/api/credits/transactions'
      },
      { status: 500 }
    )
  }
}