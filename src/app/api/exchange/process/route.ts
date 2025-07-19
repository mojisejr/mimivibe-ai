import { auth } from '@clerk/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for authentication and database access
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { exchangeType, coinAmount } = body

    if (!exchangeType || !coinAmount || typeof coinAmount !== 'number' || coinAmount <= 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid parameters' 
      }, { status: 400 })
    }

    // Validate exchange type
    if (!['COIN_TO_STAR', 'COIN_TO_CREDIT'].includes(exchangeType)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid exchange type' 
      }, { status: 400 })
    }

    // Get exchange settings
    const exchangeSetting = await prisma.exchangeSetting.findFirst({
      where: { 
        exchangeType,
        isActive: true 
      }
    })

    // Default rates if not configured
    const defaultRates = {
      'COIN_TO_STAR': 10,  // 10 coins = 1 star
      'COIN_TO_CREDIT': 15  // 15 coins = 1 credit
    }

    const exchangeRate = exchangeSetting?.coinPerUnit || defaultRates[exchangeType as keyof typeof defaultRates]
    
    if (coinAmount < exchangeRate) {
      return NextResponse.json({ 
        success: false, 
        error: `Minimum ${exchangeRate} coins required` 
      }, { status: 400 })
    }

    // Calculate received amount
    const receivedAmount = Math.floor(coinAmount / exchangeRate)
    const actualCoinsUsed = receivedAmount * exchangeRate

    if (receivedAmount <= 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Insufficient coins for exchange' 
      }, { status: 400 })
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 })
    }

    if (user.coins < actualCoinsUsed) {
      return NextResponse.json({ 
        success: false, 
        error: 'Insufficient coins' 
      }, { status: 400 })
    }

    // Process exchange in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create exchange record
      const exchange = await tx.coinExchange.create({
        data: {
          userId,
          exchangeType,
          coinAmount: actualCoinsUsed,
          receivedItem: exchangeType === 'COIN_TO_STAR' ? 'star' : 'freePoint',
          receivedAmount,
          status: 'completed',
          metadata: {
            exchangeRate,
            originalCoinAmount: coinAmount,
            processedAt: new Date().toISOString()
          }
        }
      })

      // Update user balances
      const userUpdateData: any = {
        coins: { decrement: actualCoinsUsed }
      }

      if (exchangeType === 'COIN_TO_STAR') {
        userUpdateData.stars = { increment: receivedAmount }
      } else if (exchangeType === 'COIN_TO_CREDIT') {
        userUpdateData.freePoint = { increment: receivedAmount }
      }

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: userUpdateData
      })

      // Create point transaction record
      await tx.pointTransaction.create({
        data: {
          id: `exchange_${exchange.id}`,
          userId,
          eventType: 'EXCHANGE',
          deltaCoins: -actualCoinsUsed,
          deltaPoint: exchangeType === 'COIN_TO_CREDIT' ? receivedAmount : 0,
          metadata: {
            exchangeId: exchange.id,
            exchangeType,
            receivedItem: exchangeType === 'COIN_TO_STAR' ? 'star' : 'freePoint',
            receivedAmount,
            exchangeRate
          }
        }
      })

      return { exchange, updatedUser }
    })

    return NextResponse.json({
      success: true,
      data: {
        exchangeId: result.exchange.id,
        coinAmount: actualCoinsUsed,
        receivedAmount,
        receivedItem: exchangeType === 'COIN_TO_STAR' ? 'star' : 'freePoint',
        newBalances: {
          coins: result.updatedUser.coins,
          stars: result.updatedUser.stars,
          freePoint: result.updatedUser.freePoint
        }
      }
    })

  } catch (error) {
    console.error('Process exchange error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}