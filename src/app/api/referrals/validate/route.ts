import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for database access
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  
  try {
    const body = await request.json()
    const { referralCode } = body


    if (!referralCode) {
      return NextResponse.json(
        { success: false, error: 'Referral code is required' },
        { status: 400 }
      )
    }

    // Check if referral code exists and is valid
    const referral = await prisma.referralCode.findUnique({
      where: { code: referralCode },
      include: { user: true }
    })


    if (!referral) {
      return NextResponse.json(
        { success: false, error: 'Invalid referral code' },
        { status: 404 }
      )
    }

    // Check if referral code belongs to an existing user (not someone who was referred)
    if (referral.referredBy !== null) {
      return NextResponse.json(
        { success: false, error: 'Invalid referral code' },
        { status: 400 }
      )
    }


    return NextResponse.json({
      success: true,
      data: {
        referralCode: referral.code,
        referrerName: referral.user.name,
        referrerUserId: referral.userId,
        rewards: {
          stars: 1,
          coins: 5,
          exp: 0
        }
      }
    })

  } catch (error) {
    console.error('Referral validation error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}