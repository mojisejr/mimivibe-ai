import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    const currentDay = now.getDate()

    // Get current month's campaign
    const campaign = await prisma.dailyLoginCampaign.findUnique({
      where: {
        userId_year_month: {
          userId,
          year: currentYear,
          month: currentMonth
        }
      }
    })

    const claimedDays = (campaign?.claimedDays as number[]) || []
    const streak = campaign?.streak || 0
    const lastLogin = campaign?.lastClaim?.toISOString() || null
    
    // Check if can claim today
    const canClaim = !claimedDays.includes(currentDay)
    
    // Calculate next claim time
    let nextClaimAt: string
    if (canClaim) {
      nextClaimAt = new Date().toISOString() // Can claim now
    } else {
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      nextClaimAt = tomorrow.toISOString()
    }

    // Calculate monthly progress
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()
    const daysCompleted = claimedDays.length
    
    // Monthly bonus calculation
    const monthlyBonusExp = daysInMonth * 5 // 5 exp per day if all completed
    const monthlyBonusCoins = daysInMonth * 2 // 2 coins per day if all completed

    return NextResponse.json({
      success: true,
      data: {
        streak,
        lastLogin,
        canClaim,
        nextClaimAt,
        monthlyProgress: {
          daysCompleted,
          totalDays: daysInMonth,
          monthlyBonus: {
            exp: monthlyBonusExp,
            coins: monthlyBonusCoins
          }
        }
      }
    })

  } catch (error) {
    console.error('Daily login status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}