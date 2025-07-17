import { auth } from '@clerk/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { stripe, formatAmountForStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
          path: '/api/payments/create-intent'
        }, 
        { status: 401 }
      )
    }

    const body = await request.json()
    const { packId } = body

    if (!packId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Bad request',
          message: 'Package ID is required',
          timestamp: new Date().toISOString(),
          path: '/api/payments/create-intent'
        },
        { status: 400 }
      )
    }

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

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmountForStripe(pack.price),
      currency: 'thb',
      metadata: {
        userId,
        packId: packId.toString(),
        creditAmount: pack.creditAmount.toString()
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
    console.error('Payment intent creation error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Failed to create payment intent',
        timestamp: new Date().toISOString(),
        path: '/api/payments/create-intent'
      },
      { status: 500 }
    )
  }
}