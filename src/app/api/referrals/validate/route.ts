import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for database access
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  console.log('🔍 Referral validation request received')
  
  try {
    const body = await request.json()
    const { referralCode } = body

    console.log('📋 Validating referral code:', referralCode)

    if (!referralCode) {
      console.log('❌ Referral code is missing')
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

    console.log('🔍 Database query result:', referral ? 'found' : 'not found')

    if (!referral) {
      console.log('❌ Referral code not found in database')
      return NextResponse.json(
        { success: false, error: 'Invalid referral code' },
        { status: 404 }
      )
    }

    // Check if referral code belongs to an existing user (not someone who was referred)
    if (referral.referredBy !== null) {
      console.log('❌ Referral code belongs to a referred user, not valid for referral')
      return NextResponse.json(
        { success: false, error: 'Invalid referral code' },
        { status: 400 }
      )
    }

    console.log('✅ Referral code validation successful')

    return NextResponse.json({
      success: true,
      data: {
        referralCode: referral.code,
        referrerName: referral.user.name,
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