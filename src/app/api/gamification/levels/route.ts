import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateLevel } from '@/lib/gamification/levels'

export async function GET() {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's current EXP
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { exp: true, level: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate level configuration
    const levelConfig = calculateLevel(user.exp)

    // Update user level if it's different (level up might have happened)
    if (levelConfig.level !== user.level) {
      await prisma.user.update({
        where: { id: userId },
        data: { level: levelConfig.level }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        currentLevel: levelConfig.level,
        exp: user.exp,
        expRequired: levelConfig.expRequired,
        expToNext: levelConfig.expToNext,
        nextLevelBenefits: {
          bonusExp: levelConfig.benefits.bonusExp,
          bonusCoins: levelConfig.benefits.bonusCoins,
          unlocks: levelConfig.benefits.unlocks
        }
      }
    })

  } catch (error) {
    console.error('Get levels error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}