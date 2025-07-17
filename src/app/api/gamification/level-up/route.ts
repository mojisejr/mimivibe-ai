import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateLevel, checkLevelUp } from '@/lib/gamification/levels'

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's current data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { exp: true, level: true, coins: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if level up is actually needed
    const levelCheck = checkLevelUp((user.level - 1) * 100, user.exp)
    
    if (!levelCheck.leveled) {
      return NextResponse.json({
        success: false,
        message: 'No level up available'
      })
    }

    const newLevelConfig = calculateLevel(user.exp)
    const levelUpRewards = {
      exp: Math.floor(newLevelConfig.level * 5), // Bonus EXP on level up
      coins: Math.floor(newLevelConfig.level * 10), // Bonus coins on level up
      unlocks: newLevelConfig.benefits.unlocks
    }

    // Update user with new level and rewards
    await prisma.$transaction(async (tx) => {
      // Update user
      await tx.user.update({
        where: { id: userId },
        data: {
          level: newLevelConfig.level,
          exp: { increment: levelUpRewards.exp },
          coins: { increment: levelUpRewards.coins }
        }
      })

      // Record level up transaction
      await tx.pointTransaction.create({
        data: {
          id: `levelup_${userId}_${Date.now()}`,
          userId,
          eventType: 'LEVEL_UP_REWARD',
          deltaPoint: 0,
          deltaCoins: levelUpRewards.coins,
          deltaExp: levelUpRewards.exp,
          metadata: {
            newLevel: newLevelConfig.level,
            oldLevel: user.level,
            unlocks: levelUpRewards.unlocks
          }
        }
      })
    })

    return NextResponse.json({
      success: true,
      data: {
        newLevel: newLevelConfig.level,
        rewards: levelUpRewards
      }
    })

  } catch (error) {
    console.error('Level up error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}