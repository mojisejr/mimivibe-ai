import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { GAMIFICATION_CONFIG } from '@/lib/gamification/levels'

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    const currentDay = now.getDate()

    // Get or create campaign record
    let campaign = await prisma.dailyLoginCampaign.findUnique({
      where: {
        userId_year_month: {
          userId,
          year: currentYear,
          month: currentMonth
        }
      }
    })

    if (!campaign) {
      campaign = await prisma.dailyLoginCampaign.create({
        data: {
          userId,
          year: currentYear,
          month: currentMonth,
          claimedDays: [],
          streak: 0
        }
      })
    }

    const claimedDays = campaign.claimedDays as number[]
    
    // Check if already claimed today
    if (claimedDays.includes(currentDay)) {
      return NextResponse.json({
        success: false,
        alreadyClaimed: true,
        message: "วันนี้เคลมรางวัลแล้ว"
      })
    }

    // Calculate streak
    let newStreak = campaign.streak
    const yesterday = currentDay - 1
    
    if (yesterday > 0 && claimedDays.includes(yesterday)) {
      newStreak += 1
    } else if (claimedDays.length === 0 || !claimedDays.includes(yesterday)) {
      newStreak = 1 // Reset streak
    }

    // Calculate rewards based on streak and special days
    const { baseExp, baseCoins, maxStreakMultiplier, streakBonusRate } = GAMIFICATION_CONFIG.dailyLogin
    
    let dayMultiplier = 1
    if (currentDay % 7 === 0) dayMultiplier = 2 // Weekly bonus
    if (currentDay === new Date(currentYear, currentMonth, 0).getDate()) dayMultiplier = 3 // Month end bonus
    
    const streakMultiplier = Math.min(newStreak * streakBonusRate, maxStreakMultiplier)
    
    const expReward = Math.floor(baseExp * dayMultiplier * (1 + streakMultiplier))
    const coinReward = Math.floor(baseCoins * dayMultiplier * (1 + streakMultiplier))

    // Update campaign and user
    await prisma.$transaction(async (tx) => {
      // Update campaign
      await tx.dailyLoginCampaign.update({
        where: { id: campaign.id },
        data: {
          claimedDays: [...claimedDays, currentDay],
          streak: newStreak,
          lastClaim: now
        }
      })

      // Update user
      await tx.user.update({
        where: { id: userId },
        data: {
          exp: { increment: expReward },
          coins: { increment: coinReward }
        }
      })

      // Record transaction
      await tx.pointTransaction.create({
        data: {
          id: `daily_login_${userId}_${currentYear}_${currentMonth}_${currentDay}`,
          userId,
          eventType: 'DAILY_LOGIN_REWARD',
          deltaPoint: 0,
          deltaCoins: coinReward,
          deltaExp: expReward,
          metadata: {
            day: currentDay,
            streak: newStreak,
            year: currentYear,
            month: currentMonth,
            dayMultiplier,
            streakMultiplier
          }
        }
      })
    })

    // Calculate next claim time (tomorrow)
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    return NextResponse.json({
      success: true,
      alreadyClaimed: false,
      data: {
        rewards: {
          exp: expReward,
          coins: coinReward,
          streak: newStreak
        },
        nextClaimAt: tomorrow.toISOString()
      }
    })

  } catch (error) {
    console.error('Daily login claim error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}