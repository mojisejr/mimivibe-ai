import { auth } from '@clerk/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
          path: '/api/credits/spend'
        }, 
        { status: 401 }
      )
    }

    const body = await request.json()
    const { amount, reason, metadata } = body

    // Validate required fields
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad request',
          message: 'Amount must be a positive number',
          timestamp: new Date().toISOString(),
          path: '/api/credits/spend'
        },
        { status: 400 }
      )
    }

    if (!reason || typeof reason !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad request',
          message: 'Reason is required',
          timestamp: new Date().toISOString(),
          path: '/api/credits/spend'
        },
        { status: 400 }
      )
    }

    // Process spending in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get current user state
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { 
          stars: true, 
          coins: true, 
          exp: true, 
          level: true,
          freePoint: true 
        }
      })

      if (!user) {
        throw new Error('User not found')
      }

      // Determine credit deduction (freePoint first, then stars)
      let deltaFreePoint = 0
      let deltaStars = 0
      let remainingAmount = amount

      if (user.freePoint > 0) {
        const freePointToUse = Math.min(user.freePoint, remainingAmount)
        deltaFreePoint = -freePointToUse
        remainingAmount -= freePointToUse
      }

      if (remainingAmount > 0) {
        if (user.stars >= remainingAmount) {
          deltaStars = -remainingAmount
        } else {
          throw new Error('Insufficient credits')
        }
      }

      // Create transaction record
      const transaction = await tx.pointTransaction.create({
        data: {
          id: `txn_${Date.now()}_${userId.slice(-8)}`,
          userId,
          eventType: 'READING_SPEND',
          deltaPoint: deltaStars,
          deltaCoins: 0,
          deltaExp: 0,
          metadata: {
            reason,
            amount,
            freePointUsed: -deltaFreePoint,
            starsUsed: -deltaStars,
            ...metadata
          }
        }
      })

      // Update user credits
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          freePoint: user.freePoint + deltaFreePoint,
          stars: user.stars + deltaStars
        },
        select: {
          freePoint: true,
          stars: true,
          coins: true
        }
      })

      return {
        transaction,
        newBalance: updatedUser.freePoint + updatedUser.stars,
        updatedUser
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        newBalance: result.newBalance,
        transaction: {
          id: result.transaction.id,
          amount,
          reason
        },
        balances: {
          freePoint: result.updatedUser.freePoint,
          stars: result.updatedUser.stars,
          coins: result.updatedUser.coins
        }
      }
    })

  } catch (error) {
    console.error('Credit spending error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    if (errorMessage === 'User not found') {
      return NextResponse.json(
        {
          success: false,
          error: 'Not found',
          message: 'User not found',
          timestamp: new Date().toISOString(),
          path: '/api/credits/spend'
        },
        { status: 404 }
      )
    }

    if (errorMessage === 'Insufficient credits') {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad request',
          message: 'Insufficient credits for this transaction',
          timestamp: new Date().toISOString(),
          path: '/api/credits/spend'
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Failed to process credit spending',
        timestamp: new Date().toISOString(),
        path: '/api/credits/spend'
      },
      { status: 500 }
    )
  }
}