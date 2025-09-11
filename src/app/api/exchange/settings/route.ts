import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for authentication and database access
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get exchange settings from database
    const exchangeSettings = await prisma.exchangeSetting.findMany({
      where: { isActive: true },
      orderBy: { exchangeType: 'asc' }
    })

    // Get user's exchange history (last 20 transactions)
    const exchangeHistory = await prisma.coinExchange.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    // Default exchange rates if not configured in database
    const defaultSettings = {
      coinToStar: { rate: 100, available: true } // 100 coins = 1 star
    }

    // Process settings from database
    const settings = exchangeSettings.reduce((acc, setting) => {
      if (setting.exchangeType === 'COIN_TO_STAR') {
        acc.coinToStar = {
          rate: setting.coinPerUnit,
          available: setting.isActive
        }
      }
      return acc
    }, defaultSettings)

    return NextResponse.json({
      success: true,
      data: {
        settings,
        history: exchangeHistory.map(exchange => ({
          id: exchange.id,
          exchangeType: exchange.exchangeType,
          coinAmount: exchange.coinAmount,
          receivedItem: exchange.receivedItem,
          receivedAmount: exchange.receivedAmount,
          createdAt: exchange.createdAt.toISOString(),
          status: exchange.status
        }))
      }
    })

  } catch (error) {
    console.error('Get exchange settings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}