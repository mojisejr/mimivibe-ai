import { auth } from '@clerk/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { stripe, formatAmountForStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { rateLimit, paymentRateLimitConfig } from '@/lib/rate-limiter'

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

    // SECURITY ENHANCEMENT: Validate payment amount matches pack price
    const expectedAmount = formatAmountForStripe(pack.price)
    
    // Create payment intent with validated amount
    const paymentIntent = await stripe.paymentIntents.create({
      amount: expectedAmount,
      currency: 'thb',
      metadata: {
        userId,
        packId: packId.toString(),
        creditAmount: pack.creditAmount.toString(),
        expectedAmount: expectedAmount.toString() // Store expected amount for verification
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        amount: pack.price,
        currency: 'thb'
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