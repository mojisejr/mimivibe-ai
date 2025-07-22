import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateReferralCode } from '@/lib/gamification/referrals'
import { GAMIFICATION_CONFIG } from '@/lib/gamification/levels'

// Force dynamic rendering for database access
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { referralCode, newUserId } = body

    if (!referralCode || !newUserId) {
      return NextResponse.json(
        { error: 'Referral code and new user ID required' },
        { status: 400 }
      )
    }

    // Find referral code
    const referral = await prisma.referralCode.findUnique({
      where: { code: referralCode },
      include: { user: true }
    })

    if (!referral) {
      return NextResponse.json(
        { error: 'Invalid referral code' },
        { status: 404 }
      )
    }

    if (referral.userId === newUserId) {
      return NextResponse.json(
        { error: 'Cannot use own referral code' },
        { status: 400 }
      )
    }

    // Check if new user already has a referral
    const existingReferral = await prisma.referralCode.findFirst({
      where: { userId: newUserId, referredBy: { not: null } }
    })

    if (existingReferral) {
      return NextResponse.json(
        { error: 'User already referred' },
        { status: 409 }
      )
    }

    const { referrerReward, referredReward } = GAMIFICATION_CONFIG.referral

    // Process referral
    await prisma.$transaction(async (tx) => {
      // Create referral record for new user
      await tx.referralCode.create({
        data: {
          userId: newUserId,
          code: generateReferralCode(newUserId),
          referredBy: referral.userId,
          isUsed: true,
          usedAt: new Date()
        }
      })

      // Note: Referrer reward will be given later when referral completes first reading
      // This is handled by /api/referrals/claim-first-reading endpoint

      // Reward referred user (immediate signup bonus)
      await tx.user.update({
        where: { id: newUserId },
        data: {
          exp: { increment: referredReward.exp },
          coins: { increment: referredReward.coins },
          stars: { increment: referredReward.stars }
        }
      })

      // Record transaction for referred user signup bonus
      await tx.pointTransaction.create({
        data: {
          id: `referral_welcome_${newUserId}_${Date.now()}`,
          userId: newUserId,
          eventType: 'REFERRAL_WELCOME',
          deltaPoint: referredReward.stars,
          deltaCoins: referredReward.coins,
          deltaExp: referredReward.exp,
          metadata: { referredBy: referral.userId, rewardType: 'signup_bonus' }
        }
      })
    })

    // Check for achievements after referral processing
    try {
      const { AchievementService } = await import('@/lib/services/AchievementService');
      // Check achievements for both referrer and new user
      await Promise.allSettled([
        AchievementService.checkAndTriggerAchievements(referral.userId, 'REFERRAL'),
        AchievementService.checkAndTriggerAchievements(newUserId, 'REFERRAL')
      ]);
    } catch (error) {
      console.error('Achievement check failed (non-critical):', error);
      // Don't fail the referral processing if achievement check fails
    }

    return NextResponse.json({
      success: true,
      data: {
        referrerReward: { 
          note: 'Referrer will receive reward when referral completes first reading',
          ...referrerReward 
        },
        referredReward
      }
    })

  } catch (error) {
    console.error('Process referral error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}