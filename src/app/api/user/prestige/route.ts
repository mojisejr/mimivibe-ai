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

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 })
    }

    // Check if user is eligible for prestige (level 100)
    if (user.level < 100) {
      return NextResponse.json({ 
        success: false, 
        error: 'Must reach level 100 to prestige' 
      }, { status: 400 })
    }

    // Calculate prestige rewards
    const newPrestigeLevel = user.prestigeLevel + 1
    const prestigeRewards = calculatePrestigeRewards(newPrestigeLevel)

    // Process prestige in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Reset user level and exp, increment prestige level
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          level: 1,
          exp: 0,
          prestigeLevel: newPrestigeLevel,
          coins: { increment: prestigeRewards.coins },
          stars: { increment: prestigeRewards.stars }
        }
      })

      // Create prestige transaction record
      await tx.pointTransaction.create({
        data: {
          id: `prestige_${userId}_${Date.now()}`,
          userId,
          eventType: 'PRESTIGE',
          deltaExp: -user.exp, // Show EXP reset
          deltaCoins: prestigeRewards.coins,
          deltaPoint: prestigeRewards.stars,
          metadata: {
            fromLevel: user.level,
            toLevel: 1,
            fromPrestigeLevel: user.prestigeLevel,
            toPrestigeLevel: newPrestigeLevel,
            expReset: user.exp,
            rewards: prestigeRewards,
            prestigedAt: new Date().toISOString()
          }
        }
      })

      return updatedUser
    })

    return NextResponse.json({
      success: true,
      data: {
        prestigeLevel: newPrestigeLevel,
        newLevel: 1,
        newExp: 0,
        rewards: prestigeRewards,
        newTotals: {
          coins: result.coins,
          stars: result.stars,
          prestigeLevel: result.prestigeLevel
        },
        bonuses: getPrestigeBonuses(newPrestigeLevel)
      }
    })

  } catch (error) {
    console.error('Prestige error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 })
    }

    // Get prestige rewards for next level
    const nextPrestigeRewards = calculatePrestigeRewards(user.prestigeLevel + 1)
    const currentBonuses = getPrestigeBonuses(user.prestigeLevel)
    const nextBonuses = getPrestigeBonuses(user.prestigeLevel + 1)

    return NextResponse.json({
      success: true,
      data: {
        currentPrestigeLevel: user.prestigeLevel,
        currentLevel: user.level,
        canPrestige: user.level >= 100,
        nextPrestigeRewards,
        currentBonuses,
        nextBonuses,
        requirementsToPrestige: {
          requiredLevel: 100,
          currentLevel: user.level,
          progress: (user.level / 100) * 100
        }
      }
    })

  } catch (error) {
    console.error('Get prestige info error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function calculatePrestigeRewards(prestigeLevel: number) {
  // Base rewards that scale with prestige level
  const baseCoins = 1000
  const baseStars = 5
  
  return {
    coins: baseCoins * prestigeLevel,
    stars: baseStars + Math.floor(prestigeLevel / 2),
    exp: 0 // Always reset to 0
  }
}

function getPrestigeBonuses(prestigeLevel: number) {
  const bonuses = []
  
  if (prestigeLevel >= 1) {
    bonuses.push({
      type: 'COINS_BONUS',
      value: 10 * prestigeLevel,
      description: `เพิ่มโบนัสเหรียญ ${10 * prestigeLevel}% จากทุกกิจกรรม`
    })
  }
  
  if (prestigeLevel >= 2) {
    bonuses.push({
      type: 'EXP_BONUS',
      value: 5 * Math.floor(prestigeLevel / 2),
      description: `เพิ่มโบนัส EXP ${5 * Math.floor(prestigeLevel / 2)}% จากการทำนาย`
    })
  }
  
  if (prestigeLevel >= 5) {
    bonuses.push({
      type: 'STAR_BONUS',
      value: Math.floor(prestigeLevel / 5),
      description: `โอกาสได้รับดาวเพิ่ม ${Math.floor(prestigeLevel / 5)} ดวงจากการทำนาย`
    })
  }
  
  if (prestigeLevel >= 10) {
    bonuses.push({
      type: 'SPECIAL_BADGE',
      value: 1,
      description: 'ได้รับตราสัญลักษณ์พิเศษ "ยอดนักทำนายผู้ทรงเกียรติ"'
    })
  }
  
  return bonuses
}