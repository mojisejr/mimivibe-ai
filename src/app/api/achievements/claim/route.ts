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
    const { achievementId } = body

    if (!achievementId || typeof achievementId !== 'string') {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid achievement ID' 
      }, { status: 400 })
    }

    // Get achievement configuration
    const achievementConfig = await prisma.rewardConfiguration.findUnique({
      where: { 
        name: achievementId,
        isActive: true 
      }
    })

    if (!achievementConfig) {
      return NextResponse.json({ 
        success: false, 
        error: 'Achievement not found' 
      }, { status: 404 })
    }

    // Get current user stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        Reading: true,
        Review: true,
        ReferralCode: true,
        PointTransaction: true
      }
    })

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 })
    }

    // Check if achievement was already claimed
    const existingClaim = await prisma.pointTransaction.findFirst({
      where: {
        userId,
        eventType: 'ACHIEVEMENT',
        metadata: {
          path: ['achievementId'],
          equals: achievementId
        }
      }
    })

    if (existingClaim) {
      return NextResponse.json({ 
        success: false, 
        error: 'Achievement already claimed' 
      }, { status: 400 })
    }

    // Check if user meets achievement criteria
    const criteria = achievementConfig.criteria as any
    const userMeetsRequirements = checkAchievementCriteria(user, criteria)

    if (!userMeetsRequirements) {
      return NextResponse.json({ 
        success: false, 
        error: 'Achievement requirements not met' 
      }, { status: 400 })
    }

    // Process achievement claim in transaction
    const rewards = achievementConfig.rewards as any
    const result = await prisma.$transaction(async (tx) => {
      // Create achievement claim record
      const claimTransaction = await tx.pointTransaction.create({
        data: {
          id: `achievement_${achievementId}_${userId}_${Date.now()}`,
          userId,
          eventType: 'ACHIEVEMENT',
          deltaExp: rewards.exp || 0,
          deltaCoins: rewards.coins || 0,
          deltaPoint: rewards.stars || 0,
          metadata: {
            achievementId,
            achievementName: achievementConfig.name,
            achievementTitle: achievementConfig.title,
            rewards,
            claimedAt: new Date().toISOString()
          }
        }
      })

      // Update user stats
      const userUpdateData: any = {}
      
      if (rewards.exp) {
        userUpdateData.exp = { increment: rewards.exp }
      }
      if (rewards.coins) {
        userUpdateData.coins = { increment: rewards.coins }
      }
      if (rewards.stars) {
        userUpdateData.stars = { increment: rewards.stars }
      }

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: userUpdateData
      })

      return { claimTransaction, updatedUser }
    })

    return NextResponse.json({
      success: true,
      data: {
        achievementId,
        achievementTitle: achievementConfig.title,
        rewards,
        newTotals: {
          exp: result.updatedUser.exp,
          coins: result.updatedUser.coins,
          stars: result.updatedUser.stars
        }
      }
    })

  } catch (error) {
    console.error('Claim achievement error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function checkAchievementCriteria(user: any, criteria: any): boolean {
  // Check reading count
  if (criteria.readingCount) {
    const readingCount = user.Reading.filter((r: any) => !r.isDeleted).length
    if (readingCount < criteria.readingCount) return false
  }

  // Check level
  if (criteria.level) {
    if (user.level < criteria.level) return false
  }

  // Check total readings
  if (criteria.totalReadings) {
    const totalReadings = user.Reading.filter((r: any) => !r.isDeleted).length
    if (totalReadings < criteria.totalReadings) return false
  }

  // Check review count
  if (criteria.reviewCount) {
    const reviewCount = user.Review.length
    if (reviewCount < criteria.reviewCount) return false
  }

  // Check referral count (simplified - count referral codes that are used)
  if (criteria.referralCount) {
    const referralCount = user.ReferralCode.filter((code: any) => code.isUsed).length
    if (referralCount < criteria.referralCount) return false
  }

  // Check total coins earned
  if (criteria.totalCoinsEarned) {
    const totalCoinsEarned = user.PointTransaction
      .filter((t: any) => t.deltaCoins > 0)
      .reduce((total: number, t: any) => total + t.deltaCoins, 0)
    if (totalCoinsEarned < criteria.totalCoinsEarned) return false
  }

  // Check login streak (this would need additional implementation)
  if (criteria.loginStreak || criteria.streakDays) {
    // For now, return true as streak tracking needs more implementation
    // TODO: Implement proper streak tracking
    return true
  }

  // Check average accuracy (this would need additional implementation)
  if (criteria.averageAccuracy) {
    // For now, return true as this needs review accuracy calculation
    // TODO: Implement average accuracy calculation
    return true
  }

  // Check prestige level
  if (criteria.prestigeLevel) {
    if (user.prestigeLevel < criteria.prestigeLevel) return false
  }

  // All criteria must be met for the achievement to be claimable
  return true
}