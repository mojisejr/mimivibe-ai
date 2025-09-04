import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateReferralCode } from '@/lib/utils/referrals'
import { getBaseUrl } from '@/lib/utils/url'

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get or create referral code
    let referralCode = await prisma.referralCode.findFirst({
      where: { userId, referredBy: null }
    })

    if (!referralCode) {
      // Generate unique referral code
      const code = generateReferralCode(userId)
      referralCode = await prisma.referralCode.create({
        data: {
          userId,
          code
        }
      })
    }

    // Get referral stats
    const referredUsers = await prisma.referralCode.findMany({
      where: { referredBy: userId },
      include: {
        user: {
          select: { createdAt: true }
        }
      }
    })

    // Calculate total rewards from referrals
    const referralTransactions = await prisma.pointTransaction.findMany({
      where: {
        userId,
        eventType: 'REFERRAL_REWARD'
      }
    })

    const totalRewards = referralTransactions.reduce((acc, tx) => ({
      exp: acc.exp + tx.deltaExp,
      coins: acc.coins + tx.deltaCoins,
      stars: acc.stars + tx.deltaPoint
    }), { exp: 0, coins: 0, stars: 0 })

    const recentReferrals = referredUsers
      .slice(0, 10)
      .map(ref => ({
        id: ref.id,
        referredAt: ref.user.createdAt.toISOString(),
        rewarded: ref.isUsed,
        rewardAmount: {
          exp: 50, // Fixed reward amount
          coins: 20
        }
      }))

    const referralLink = `${getBaseUrl()}?ref=${referralCode.code}`

    return NextResponse.json({
      success: true,
      data: {
        referralCode: referralCode.code,
        referralLink,
        stats: {
          totalReferred: referredUsers.length,
          successfulReferrals: referredUsers.filter(r => r.isUsed).length,
          totalRewards
        },
        recentReferrals
      }
    })

  } catch (error) {
    console.error('Referral status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}