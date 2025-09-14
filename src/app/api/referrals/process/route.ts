import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateReferralCode } from '@/lib/utils/referrals'
import { getReferralRewards, toLegacyRewardFormat } from '@/lib/utils/rewards'
import { ensureUserExists } from '@/lib/utils/jit-user'

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

    // PHASE 1: Ensure User exists using JIT provisioning (eliminates webhook dependency)
    console.log(`🔧 JIT: Ensuring user ${newUserId} exists via JIT provisioning...`)

    let jitResult
    try {
      jitResult = await ensureUserExists(newUserId)
      const targetUser = jitResult.user

      if (jitResult.wasCreated) {
        console.log(`✅ JIT: Created new user ${newUserId} via JIT provisioning`)
      } else {
        console.log(`✅ JIT: User ${newUserId} already existed in database`)
      }

      console.log(`📊 JIT: User ready for referral processing:`, {
        userId: targetUser.id,
        email: targetUser.email,
        name: targetUser.name,
        stars: targetUser.stars,
        freePoint: targetUser.freePoint
      })

    } catch (jitError) {
      console.error(`❌ JIT: Failed to ensure user exists for ${newUserId}:`, jitError)

      return NextResponse.json(
        {
          error: 'Failed to process user account. Please try again.',
          code: 'JIT_PROVISIONING_FAILED',
          debug: {
            userId: newUserId,
            timestamp: new Date().toISOString(),
            error: jitError instanceof Error ? jitError.message : 'Unknown JIT error'
          }
        },
        { status: 500 }
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
      // User existence guaranteed by JIT provisioning above
      console.log(`✅ JIT: Proceeding with referral creation for user ${newUserId} (JIT provisioned)`)
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
      // JIT provisioning should eliminate user not found errors
      // If we still get foreign key errors, it's a different issue
      if (error.message.includes('referral_codes_userId_fkey') || error.message.includes('USER_NOT_FOUND')) {
        console.error(`🚨 JIT: Unexpected user reference error after JIT provisioning: ${error.message}`)
        console.error(`🔍 JIT: This suggests a critical issue with JIT user creation`)

        return NextResponse.json(
          {
            error: 'User account processing error. Please contact support if this persists.',
            code: 'JIT_USER_REFERENCE_ERROR',
            debug: {
              error: 'post_jit_user_error',
              timestamp: new Date().toISOString(),
              message: error.message
            }
          },
          { status: 500 }
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