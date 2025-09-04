import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
// Level calculation removed during refactor

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic'

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
    // Level calculation removed during gamification refactor
    const levelConfig = {
      level: user.level,
      currentExp: user.exp,
      expToNext: (user.level * 100) - user.exp,
      expRequired: user.level * 100,
      benefits: { 
        unlocks: [],
        bonusExp: 0,
        bonusCoins: 0
      }
    }

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