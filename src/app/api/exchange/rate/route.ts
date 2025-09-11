import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get current exchange settings
    const settings = await prisma.exchangeSetting.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        exchangeType: true,
        receivedItem: true,
        coinPerUnit: true,
        metadata: true
      }
    })

    if (settings.length === 0) {
      // Default exchange rates if none configured
      return NextResponse.json({
        success: true,
        data: {
          rates: [{
            id: 'default',
            exchangeType: 'COIN_TO_CREDIT',
            receivedItem: 'FREE_POINTS',
            coinPerUnit: 15,
            displayText: '15 Coins = 1 Free Point'
          }],
          meta: {
            defaultRates: true,
            message: 'Using default exchange rates'
          }
        }
      })
    }

    // Format settings into rates
    const rates = settings.map(setting => ({
      id: setting.id.toString(),
      exchangeType: setting.exchangeType,
      receivedItem: setting.receivedItem,
      coinPerUnit: setting.coinPerUnit,
      displayText: `${setting.coinPerUnit} Coins = 1 ${setting.receivedItem.replace('_', ' ')}`,
      metadata: setting.metadata
    }))

    return NextResponse.json({
      success: true,
      data: {
        rates,
        meta: {
          defaultRates: false,
          timestamp: new Date().toISOString()
        }
      }
    })

  } catch (error) {
    console.error('Exchange rate fetch error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch exchange rates',
        timestamp: new Date().toISOString(),
        path: '/api/exchange/rate'
      },
      { status: 500 }
    )
  }
}

// POST endpoint to calculate exchange amounts
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { coinAmount, exchangeType = 'COIN_TO_CREDIT' } = body

    if (!coinAmount || typeof coinAmount !== 'number' || coinAmount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad request',
          message: 'Coin amount must be a positive number',
          timestamp: new Date().toISOString(),
          path: '/api/exchange/rate'
        },
        { status: 400 }
      )
    }

    // Get exchange setting
    const setting = await prisma.exchangeSetting.findFirst({
      where: { 
        exchangeType,
        isActive: true 
      },
      select: {
        coinPerUnit: true,
        receivedItem: true
      }
    })

    const coinPerUnit = setting?.coinPerUnit || 15 // Default rate
    const receivedItem = setting?.receivedItem || 'FREE_POINTS'

    // Calculate exchange amounts
    const receivedAmount = Math.floor(coinAmount / coinPerUnit)
    const requiredCoins = receivedAmount * coinPerUnit
    const remainingCoins = coinAmount - requiredCoins

    return NextResponse.json({
      success: true,
      data: {
        input: {
          coinAmount,
          exchangeType
        },
        calculation: {
          coinPerUnit,
          receivedAmount,
          requiredCoins,
          remainingCoins
        },
        exchange: {
          canExchange: receivedAmount > 0,
          receivedItem: receivedItem.toLowerCase().replace('_', 'Point'),
          summary: `${requiredCoins} coins → ${receivedAmount} ${receivedItem.toLowerCase().replace('_', ' ')}`
        }
      }
    })

  } catch (error) {
    console.error('Exchange calculation error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Failed to calculate exchange rates',
        timestamp: new Date().toISOString(),
        path: '/api/exchange/rate'
      },
      { status: 500 }
    )
  }
}