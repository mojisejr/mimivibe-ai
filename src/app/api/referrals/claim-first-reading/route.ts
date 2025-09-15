import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/prisma'
import { getReferralRewards, toLegacyRewardFormat } from '@/lib/utils/rewards'

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { readingId } = body

    if (!readingId) {
      return NextResponse.json(
        { error: 'Reading ID is required' },
        { status: 400 }
      )
    }

    // Check if this is the user's first reading
    const userReadings = await prisma.reading.count({
      where: { userId, isDeleted: false }
    })

    if (userReadings !== 1) {
      return NextResponse.json(
        { error: 'This is not the first reading' },
        { status: 400 }
      )
    }

    // Check if user was referred
    const referralCode = await prisma.referralCode.findFirst({
      where: { 
        userId, 
        referredBy: { not: null },
        isUsed: true 
      }
    })

    if (!referralCode || !referralCode.referredBy) {
      return NextResponse.json(
        { error: 'User was not referred' },
        { status: 400 }
      )
    }

    // Check if referrer reward has already been given
    const existingReward = await prisma.pointTransaction.findFirst({
      where: {
        userId: referralCode.referredBy,
        eventType: 'REFERRAL_FIRST_READING',
        metadata: {
          path: ['referredUserId'],
          equals: userId
        }
      }
    })

    if (existingReward) {
      return NextResponse.json(
        { error: 'Referrer reward already given' },
        { status: 409 }
      )
    }

    // Fetch dynamic referral rewards from RewardConfiguration
    const rewardConfig = await getReferralRewards()
    const referrerReward = toLegacyRewardFormat(rewardConfig.inviter)

    // Give referrer reward for first reading completion
    await prisma.$transaction(async (tx) => {
      // Update referrer's rewards (including freePoint)
      await tx.user.update({
        where: { id: referralCode.referredBy! },
        data: {
          exp: { increment: referrerReward.exp },
          coins: { increment: referrerReward.coins },
          stars: { increment: referrerReward.stars },
          freePoint: { increment: referrerReward.freePoint || 0 }
        }
      })

      // Record the transaction
      await tx.pointTransaction.create({
        data: {
          id: `referral_first_reading_${referralCode.referredBy!}_${Date.now()}`,
          userId: referralCode.referredBy!,
          eventType: 'REFERRAL_FIRST_READING',
          deltaPoint: referrerReward.stars,
          deltaCoins: referrerReward.coins,
          deltaExp: referrerReward.exp,
          metadata: { 
            referredUserId: userId,
            readingId,
            rewardType: 'first_reading_completion',
            freePointAwarded: referrerReward.freePoint || 0
          }
        }
      })
    })

    return NextResponse.json({
      success: true,
      data: {
        referrerReward,
        referrerId: referralCode.referredBy!
      }
    })

  } catch (error) {
    console.error('Claim first reading referral error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}