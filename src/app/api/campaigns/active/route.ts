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

    // Get active campaign template
    const activeTemplate = await prisma.campaignTemplate.findFirst({
      where: {
        type: 'DAILY_LOGIN',
        isActive: true
      }
    })

    if (!activeTemplate) {
      return NextResponse.json({
        success: false,
        error: 'No active daily login campaign template found'
      }, { status: 404 })
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
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()

    // Generate daily rewards using the template
    const templateRewards = activeTemplate.rewards as any[]
    const templateMetadata = activeTemplate.metadata as any
    
    const rewards = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1
      
      // First check if there's a specific reward for this day in the template
      const specificReward = templateRewards.find(r => r.day === day)
      if (specificReward) {
        return {
          day,
          exp: specificReward.exp,
          coins: specificReward.coins,
          stars: specificReward.stars || 0,
          description: specificReward.description || "รางวัลพิเศษ"
        }
      }
      
      // Otherwise use metadata to calculate dynamic rewards
      const baseExp = templateMetadata?.baseExp || 10
      const baseCoins = templateMetadata?.baseCoins || 5
      const weeklyMultiplier = templateMetadata?.weeklyMultiplier || 2
      const monthEndMultiplier = templateMetadata?.monthEndMultiplier || 3
      
      let multiplier = 1
      if (day % 7 === 0) multiplier = weeklyMultiplier // Weekly bonus
      if (day === daysInMonth) multiplier = monthEndMultiplier // Month completion bonus

      return {
        day,
        exp: Math.floor(baseExp * multiplier),
        coins: Math.floor(baseCoins * multiplier),
        stars: 0,
        description: day % 7 === 0 ? "สัปดาห์โบนัส!" : 
                    day === daysInMonth ? "โบนัสจบเดือน!" : 
                    "เข้าสู่ระบบประจำวัน"
      }
    })

    // Build campaign response
    const campaignData = {
      id: campaign.id,
      templateId: activeTemplate.id,
      title: `${activeTemplate.name} ${currentMonth}/${currentYear}`,
      type: "DAILY_LOGIN" as const,
      startDate: new Date(currentYear, currentMonth - 1, 1).toISOString(),
      endDate: new Date(currentYear, currentMonth - 1, daysInMonth).toISOString(),
      progress: {
        current: claimedDays.length,
        total: daysInMonth,
        claimed: Array.from({ length: daysInMonth }, (_, i) => claimedDays.includes(i + 1))
      },
      rewards,
      template: {
        id: activeTemplate.id,
        name: activeTemplate.name,
        metadata: activeTemplate.metadata
      }
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