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

    // Get all active achievement configurations
    const achievementConfigs = await prisma.rewardConfiguration.findMany({
      where: { 
        type: 'ACHIEVEMENT',
        isActive: true 
      },
      orderBy: { sortOrder: 'asc' }
    })

    // Get user data needed for progress calculation
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        Reading: {
          where: { isDeleted: false }
        },
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

    // Get claimed achievements
    const claimedAchievements = await prisma.pointTransaction.findMany({
      where: {
        userId,
        eventType: 'ACHIEVEMENT'
      }
    })

    const claimedAchievementIds = claimedAchievements.map(claim => {
      const metadata = claim.metadata as any
      return metadata?.achievementId
    }).filter(Boolean)

    // Calculate progress for each achievement
    const achievements = achievementConfigs.map(config => {
      const criteria = config.criteria as any
      const rewards = config.rewards as any
      const isCompleted = claimedAchievementIds.includes(config.name)
      
      const progress = calculateAchievementProgress(user, criteria)

      return {
        id: config.name,
        name: config.name,
        icon: config.icon,
        title: config.title,
        description: config.description,
        progress: {
          current: progress.current,
          required: progress.required,
          completed: isCompleted
        },
        rewards: {
          exp: rewards.exp || 0,
          coins: rewards.coins || 0,
          stars: rewards.stars || 0
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        achievements,
        summary: {
          total: achievements.length,
          completed: achievements.filter(a => a.progress.completed).length,
          inProgress: achievements.filter(a => !a.progress.completed && a.progress.current > 0).length
        }
      }
    })

  } catch (error) {
    console.error('Get achievement progress error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function calculateAchievementProgress(user: any, criteria: any): { current: number, required: number } {
  // Handle multiple criteria (for achievements like ULTIMATE_MASTER)
  if (Object.keys(criteria).length > 1) {
    // Calculate progress for each criterion and return the least completed one
    const progressResults = []
    
    if (criteria.readingCount) {
      const current = user.Reading.length
      progressResults.push({ current, required: criteria.readingCount, percentage: current / criteria.readingCount })
    }
    
    if (criteria.totalReadings) {
      const current = user.Reading.length
      progressResults.push({ current, required: criteria.totalReadings, percentage: current / criteria.totalReadings })
    }
    
    if (criteria.level) {
      progressResults.push({ current: user.level, required: criteria.level, percentage: user.level / criteria.level })
    }
    
    if (criteria.reviewCount) {
      const current = user.Review.length
      progressResults.push({ current, required: criteria.reviewCount, percentage: current / criteria.reviewCount })
    }
    
    if (criteria.referralCount) {
      const current = user.ReferralCode.filter((code: any) => code.isUsed).length
      progressResults.push({ current, required: criteria.referralCount, percentage: current / criteria.referralCount })
    }
    
    if (criteria.totalCoinsEarned) {
      const current = user.PointTransaction
        .filter((t: any) => t.deltaCoins > 0)
        .reduce((total: number, t: any) => total + t.deltaCoins, 0)
      progressResults.push({ current, required: criteria.totalCoinsEarned, percentage: current / criteria.totalCoinsEarned })
    }
    
    if (criteria.prestigeLevel) {
      progressResults.push({ current: user.prestigeLevel, required: criteria.prestigeLevel, percentage: user.prestigeLevel / criteria.prestigeLevel })
    }
    
    // Return the criterion with the lowest completion percentage
    const leastCompleted = progressResults.reduce((min, curr) => 
      curr.percentage < min.percentage ? curr : min
    )
    
    return { current: leastCompleted.current, required: leastCompleted.required }
  }

  // Single criterion achievements
  // Reading count
  if (criteria.readingCount) {
    const current = user.Reading.length
    return { current, required: criteria.readingCount }
  }

  // Level
  if (criteria.level) {
    return { current: user.level, required: criteria.level }
  }

  // Total readings
  if (criteria.totalReadings) {
    const current = user.Reading.length
    return { current, required: criteria.totalReadings }
  }

  // Review count
  if (criteria.reviewCount) {
    const current = user.Review.length
    return { current, required: criteria.reviewCount }
  }

  // Referral count (simplified - count referral codes that are used)
  if (criteria.referralCount) {
    const current = user.ReferralCode.filter((code: any) => code.isUsed).length
    return { current, required: criteria.referralCount }
  }

  // Total coins earned
  if (criteria.totalCoinsEarned) {
    const current = user.PointTransaction
      .filter((t: any) => t.deltaCoins > 0)
      .reduce((total: number, t: any) => total + t.deltaCoins, 0)
    return { current, required: criteria.totalCoinsEarned }
  }

  // Login streak (placeholder)
  if (criteria.loginStreak || criteria.streakDays) {
    // TODO: Implement proper streak tracking
    return { current: 0, required: criteria.loginStreak || criteria.streakDays }
  }

  // Average accuracy (placeholder)
  if (criteria.averageAccuracy) {
    // TODO: Implement average accuracy calculation
    return { current: 0, required: criteria.averageAccuracy }
  }

  // Prestige level
  if (criteria.prestigeLevel) {
    return { current: user.prestigeLevel, required: criteria.prestigeLevel }
  }

  // Default
  return { current: 0, required: 1 }
}