import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateReferralCode } from '@/lib/utils/referrals'
import { getReferralRewards, toLegacyRewardFormat } from '@/lib/utils/rewards'

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

    // PHASE 1: Validate User existence before processing referral
    const targetUser = await prisma.user.findUnique({
      where: { id: newUserId }
    })

    if (!targetUser) {
      console.log(`User sync pending for ID: ${newUserId}. User record not found in database.`)
      return NextResponse.json(
        {
          error: 'User account is still being set up. Please try again in a moment.',
          code: 'USER_SYNC_PENDING',
          retryAfter: 3 // seconds
        },
        { status: 202 } // Accepted but processing not complete
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

    // Fetch dynamic referral rewards from RewardConfiguration
    const rewardConfig = await getReferralRewards()
    const referrerReward = toLegacyRewardFormat(rewardConfig.inviter)
    const referredReward = toLegacyRewardFormat(rewardConfig.invited)

    // Process referral with enhanced error handling
    await prisma.$transaction(async (tx) => {
      // Double-check user existence within transaction for safety
      const userInTransaction = await tx.user.findUnique({
        where: { id: newUserId }
      })

      if (!userInTransaction) {
        throw new Error(`USER_NOT_FOUND: User ${newUserId} not found in database during referral processing`)
      }
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

    // Achievement system removed during refactor

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

    // Enhanced error handling with specific error types
    if (error instanceof Error) {
      // Handle specific user not found errors
      if (error.message.includes('USER_NOT_FOUND')) {
        console.log(`User sync issue during referral processing: ${error.message}`)
        return NextResponse.json(
          {
            error: 'User account setup incomplete. Please try again shortly.',
            code: 'USER_SYNC_ERROR',
            retryAfter: 5
          },
          { status: 202 }
        )
      }

      // Handle foreign key constraint violations specifically
      if (error.message.includes('referral_codes_userId_fkey')) {
        console.log(`Foreign key constraint violation - User not found in database during referral processing`)
        return NextResponse.json(
          {
            error: 'Account verification in progress. Please wait a moment and try again.',
            code: 'DATABASE_SYNC_ERROR',
            retryAfter: 8
          },
          { status: 202 }
        )
      }
    }

    // Generic error fallback
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}