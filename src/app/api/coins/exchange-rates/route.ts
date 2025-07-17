import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { GAMIFICATION_CONFIG } from '@/lib/gamification/levels'

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { rate, dailyLimit, minExchange } = GAMIFICATION_CONFIG.coinExchange

    // Check daily usage
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayExchanges = await prisma.pointTransaction.aggregate({
      where: {
        userId,
        eventType: 'COIN_TO_STAR',
        createdAt: { gte: today }
      },
      _sum: { deltaPoint: true }
    })

    const todayStarsExchanged = todayExchanges._sum.deltaPoint || 0

    // Calculate reset time for tomorrow
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return NextResponse.json({
      success: true,
      data: {
        rates: [{
          fromCurrency: "COINS",
          toCurrency: "STARS",
          rate, // coins per star
          minAmount: minExchange,
          maxAmount: rate * dailyLimit // max coins that can be exchanged
        }],
        userLimits: {
          dailyMax: dailyLimit,
          used: todayStarsExchanged,
          resetAt: tomorrow.toISOString()
        }
      }
    })

  } catch (error) {
    console.error('Exchange rates error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}