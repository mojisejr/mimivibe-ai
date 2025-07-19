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
    const { day } = body

    if (!day || typeof day !== 'number' || day < 1 || day > 31) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid day parameter' 
      }, { status: 400 })
    }

    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    const currentDay = now.getDate()

    // Only allow claiming today's reward
    if (day !== currentDay) {
      return NextResponse.json({ 
        success: false, 
        error: 'Can only claim today\'s reward' 
      }, { status: 400 })
    }

    // Get or create current month's campaign
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

    // Check if already claimed
    if (claimedDays.includes(day)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Reward already claimed for this day' 
      }, { status: 400 })
    }

    // Calculate rewards based on day
    const baseExp = 10
    const baseCoins = 5
    
    let multiplier = 1
    if (day % 7 === 0) multiplier = 2 // Weekly bonus
    
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()
    if (day === daysInMonth) multiplier = 3 // Month completion bonus

    const expReward = Math.floor(baseExp * multiplier)
    const coinReward = Math.floor(baseCoins * multiplier)

    // Update campaign and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update campaign
      const updatedCampaign = await tx.dailyLoginCampaign.update({
        where: {
          userId_year_month: {
            userId,
            year: currentYear,
            month: currentMonth
          }
        },
        data: {
          claimedDays: [...claimedDays, day],
          streak: claimedDays.length + 1,
          lastClaim: now
        }
      })

      // Update user stats
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          exp: { increment: expReward },
          coins: { increment: coinReward }
        }
      })

      // Create point transaction record
      await tx.pointTransaction.create({
        data: {
          id: `daily_login_${userId}_${currentYear}_${currentMonth}_${day}`,
          userId,
          eventType: 'DAILY_LOGIN',
          deltaExp: expReward,
          deltaCoins: coinReward,
          metadata: {
            day,
            month: currentMonth,
            year: currentYear,
            multiplier,
            description: day % 7 === 0 ? "สัปดาห์โบนัส!" : 
                        day === daysInMonth ? "โบนัสจบเดือน!" : 
                        "เข้าสู่ระบบประจำวัน"
          }
        }
      })

      return { updatedCampaign, updatedUser }
    })

    return NextResponse.json({
      success: true,
      data: {
        day,
        rewards: {
          exp: expReward,
          coins: coinReward
        },
        newTotals: {
          exp: result.updatedUser.exp,
          coins: result.updatedUser.coins
        },
        campaign: {
          claimedDays: result.updatedCampaign.claimedDays,
          streak: result.updatedCampaign.streak
        }
      }
    })

  } catch (error) {
    console.error('Claim daily login reward error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}