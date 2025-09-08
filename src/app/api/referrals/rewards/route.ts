import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for database access
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Fetch referral reward configurations
    const referralRewards = await prisma.rewardConfiguration.findMany({
      where: {
        type: 'referral',
        isActive: true
      },
      select: {
        name: true,
        type: true,
        icon: true,
        title: true,
        description: true,
        criteria: true,
        rewards: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Structure the response for frontend consumption
    const rewardData = {
      inviter: null as any,
      invited: null as any
    }

    // Map the rewards to inviter/invited structure
    referralRewards.forEach(reward => {
      if (reward.name === 'REFERRAL_INVITER') {
        rewardData.inviter = {
          ...reward,
          displayText: formatRewardDisplay(reward.rewards as any)
        }
      } else if (reward.name === 'REFERRAL_INVITED') {
        rewardData.invited = {
          ...reward,
          displayText: formatRewardDisplay(reward.rewards as any)
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: rewardData
    })

  } catch (error) {
    console.error('Fetch referral rewards error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to format reward display text
function formatRewardDisplay(rewards: { stars?: number; coins?: number; freePoint?: number }): string {
  const parts: string[] = []
  
  if (rewards.stars && rewards.stars > 0) {
    parts.push(`+${rewards.stars} star${rewards.stars > 1 ? 's' : ''}`)
  }
  
  if (rewards.coins && rewards.coins > 0) {
    parts.push(`${rewards.coins} coins`)
  }
  
  if (rewards.freePoint && rewards.freePoint > 0) {
    parts.push(`${rewards.freePoint} free point${rewards.freePoint > 1 ? 's' : ''}`)
  }
  
  return parts.length > 0 ? `• +${parts.join(' + ')}` : '• ไม่มีรางวัล'
}