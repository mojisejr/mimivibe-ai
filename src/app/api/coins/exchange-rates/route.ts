import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
// Gamification config removed during refactor

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Exchange config removed during gamification refactor
    const rate = 15 // 15 coins = 1 free point
    const dailyLimit = 100 // max 100 free points per day
    const minExchange = 15 // minimum 15 coins

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