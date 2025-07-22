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
    const achievements = await Promise.all(achievementConfigs.map(async (config) => {
      const criteria = config.criteria as any
      const rewards = config.rewards as any
      const isCompleted = claimedAchievementIds.includes(config.name)
      
      const progress = await calculateAchievementProgress(user, criteria)

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
    }))

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

async function calculateAchievementProgress(user: any, criteria: any): Promise<{ current: number, required: number, details?: any[] }> {
  // Handle multiple criteria (for achievements like ULTIMATE_MASTER)
  if (Object.keys(criteria).length > 1) {
    // Calculate progress for each criterion
    const criteriaResults = []
    
    if (criteria.readingCount) {
      const current = user.Reading.length
      criteriaResults.push({ 
        name: 'readings', 
        current, 
        required: criteria.readingCount, 
        met: current >= criteria.readingCount 
      })
    }
    
    if (criteria.totalReadings) {
      const current = user.Reading.length
      criteriaResults.push({ 
        name: 'readings', 
        current, 
        required: criteria.totalReadings, 
        met: current >= criteria.totalReadings 
      })
    }
    
    if (criteria.level) {
      criteriaResults.push({ 
        name: 'level', 
        current: user.level, 
        required: criteria.level, 
        met: user.level >= criteria.level 
      })
    }
    
    if (criteria.reviewCount) {
      const current = user.Review.length
      criteriaResults.push({ 
        name: 'reviews', 
        current, 
        required: criteria.reviewCount, 
        met: current >= criteria.reviewCount 
      })
    }
    
    if (criteria.referralCount) {
      const current = user.ReferralCode.filter((code: any) => code.isUsed).length
      criteriaResults.push({ 
        name: 'referrals', 
        current, 
        required: criteria.referralCount, 
        met: current >= criteria.referralCount 
      })
    }
    
    if (criteria.totalCoinsEarned) {
      const current = user.PointTransaction
        .filter((t: any) => t.deltaCoins > 0)
        .reduce((total: number, t: any) => total + t.deltaCoins, 0)
      criteriaResults.push({ 
        name: 'coins', 
        current, 
        required: criteria.totalCoinsEarned, 
        met: current >= criteria.totalCoinsEarned 
      })
    }
    
    if (criteria.prestigeLevel) {
      criteriaResults.push({ 
        name: 'prestige', 
        current: user.prestigeLevel, 
        required: criteria.prestigeLevel, 
        met: user.prestigeLevel >= criteria.prestigeLevel 
      })
    }

    // Handle streak criteria
    if (criteria.loginStreak || criteria.streakDays) {
      const { StreakService } = await import("@/lib/services/StreakService");
      const currentStreak = await StreakService.getCurrentStreakCount(user.id);
      const required = criteria.loginStreak || criteria.streakDays;
      criteriaResults.push({ 
        name: 'streak', 
        current: currentStreak, 
        required, 
        met: currentStreak >= required 
      })
    }
    
    // Calculate overall progress: percentage of criteria met
    const totalCriteria = criteriaResults.length
    const metCriteria = criteriaResults.filter(c => c.met).length
    const overallProgress = metCriteria / totalCriteria * 100
    
    return { 
      current: Math.round(overallProgress), 
      required: 100,
      details: criteriaResults 
    }
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

  // Login streak tracking
  if (criteria.loginStreak || criteria.streakDays) {
    const { StreakService } = await import("@/lib/services/StreakService");
    const currentStreak = await StreakService.getCurrentStreakCount(user.id);
    return { current: currentStreak, required: criteria.loginStreak || criteria.streakDays }
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