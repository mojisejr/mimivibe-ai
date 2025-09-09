import { auth } from '@clerk/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { stripe, formatAmountForStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { rateLimit, paymentRateLimitConfig } from '@/lib/rate-limiter'
import { checkFirstPaymentCampaignEligibility, calculateCampaignPrice } from '@/lib/campaign'

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic'

// SECURITY ENHANCEMENT: Input validation schema
const PaymentIntentSchema = z.object({
  packId: z.number().int().positive('Pack ID must be a positive integer')
})

export async function POST(request: NextRequest) {
  try {
    // SECURITY ENHANCEMENT: Apply rate limiting
    const rateLimitResponse = await rateLimit(request, paymentRateLimitConfig)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required'
        }, 
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // SECURITY ENHANCEMENT: Comprehensive input validation
    const validationResult = PaymentIntentSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid request data',
          message: 'Package ID must be a valid positive integer'
        },
        { status: 400 }
      )
    }
    
    const { packId } = validationResult.data

    // Get package details
    const pack = await prisma.pack.findUnique({
      where: { id: packId, isActive: true }
    })

    if (!pack) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Not found',
          message: 'Package not found or inactive',
          timestamp: new Date().toISOString(),
          path: '/api/payments/create-intent'
        },
        { status: 404 }
      )
    }

    // Check campaign eligibility and calculate discounted price
    const campaignEligibility = await checkFirstPaymentCampaignEligibility(userId)
    let finalPrice = pack.price
    let campaignDiscount = 0
    
    if (campaignEligibility.eligible && campaignEligibility.campaign) {
      finalPrice = calculateCampaignPrice(pack.price, campaignEligibility.campaign.discountPercentage)
      campaignDiscount = pack.price - finalPrice
    }
    
    // SECURITY ENHANCEMENT: Validate payment amount (use discounted price if applicable)
    const expectedAmount = formatAmountForStripe(finalPrice)
    
    // Create payment intent with campaign-adjusted amount
    const paymentIntent = await stripe.paymentIntents.create({
      amount: expectedAmount,
      currency: 'thb',
      metadata: {
        userId,
        packId: packId.toString(),
        creditAmount: pack.creditAmount.toString(),
        expectedAmount: expectedAmount.toString(),
        originalPrice: pack.price.toString(),
        finalPrice: finalPrice.toString(),
        campaignDiscount: campaignDiscount.toString(),
        campaignId: campaignEligibility.eligible ? campaignEligibility.campaign?.id || '' : '',
        isFirstPayment: campaignEligibility.eligible ? 'true' : 'false'
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        amount: finalPrice,
        originalAmount: pack.price,
        campaignDiscount: campaignDiscount,
        currency: 'thb',
        campaign: campaignEligibility.eligible ? {
          applied: true,
          discountPercentage: campaignEligibility.campaign?.discountPercentage,
          discountAmount: campaignDiscount
        } : { applied: false }
      }
    })

  } catch (error) {
    // SECURITY FIX: Log error details internally but return generic message
    console.error('Payment intent creation error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Payment processing error',
        message: 'Unable to process payment request'
      },
      { status: 500 }
    )
  }
}