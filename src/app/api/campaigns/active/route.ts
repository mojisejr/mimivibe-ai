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

    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1

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
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()

    // Generate daily rewards for the month
    const rewards = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1
      const baseExp = 10
      const baseCoins = 5
      
      // Special rewards for certain days
      let multiplier = 1
      if (day % 7 === 0) multiplier = 2 // Weekly bonus
      if (day === daysInMonth) multiplier = 3 // Month completion bonus

      return {
        day,
        exp: Math.floor(baseExp * multiplier),
        coins: Math.floor(baseCoins * multiplier),
        description: day % 7 === 0 ? "สัปดาห์โบนัส!" : 
                    day === daysInMonth ? "โบนัสจบเดือน!" : 
                    "เข้าสู่ระบบประจำวัน"
      }
    })

    // Build campaign response
    const campaignData = {
      id: campaign.id,
      title: `Daily Login ${currentMonth}/${currentYear}`,
      type: "DAILY_LOGIN" as const,
      startDate: new Date(currentYear, currentMonth - 1, 1).toISOString(),
      endDate: new Date(currentYear, currentMonth - 1, daysInMonth).toISOString(),
      progress: {
        current: claimedDays.length,
        total: daysInMonth,
        claimed: Array.from({ length: daysInMonth }, (_, i) => claimedDays.includes(i + 1))
      },
      rewards
    }

    return NextResponse.json({
      success: true,
      data: {
        campaigns: [campaignData]
      }
    })

  } catch (error) {
    console.error('Get active campaigns error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}