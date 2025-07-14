import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateReferralCode } from '@/lib/gamification/referrals'
import { GAMIFICATION_CONFIG } from '@/lib/gamification/levels'

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

      // Reward referrer
      await tx.user.update({
        where: { id: referral.userId },
        data: {
          exp: { increment: referrerReward.exp },
          coins: { increment: referrerReward.coins }
        }
      })

      // Reward referred user
      await tx.user.update({
        where: { id: newUserId },
        data: {
          exp: { increment: referredReward.exp },
          coins: { increment: referredReward.coins },
          freePoint: { increment: referredReward.freeCredits }
        }
      })

      // Record transactions
      await tx.pointTransaction.createMany({
        data: [
          {
            id: `referral_reward_${referral.userId}_${Date.now()}`,
            userId: referral.userId,
            eventType: 'REFERRAL_REWARD',
            deltaPoint: 0,
            deltaCoins: referrerReward.coins,
            deltaExp: referrerReward.exp,
            metadata: { referredUserId: newUserId }
          },
          {
            id: `referral_welcome_${newUserId}_${Date.now()}`,
            userId: newUserId,
            eventType: 'REFERRAL_WELCOME',
            deltaPoint: referredReward.freeCredits,
            deltaCoins: referredReward.coins,
            deltaExp: referredReward.exp,
            metadata: { referredBy: referral.userId }
          }
        ]
      })
    })

    return NextResponse.json({
      success: true,
      data: {
        referrerReward,
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