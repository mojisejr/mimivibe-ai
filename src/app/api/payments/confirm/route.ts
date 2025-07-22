import { auth } from '@clerk/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic'

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
          path: '/api/payments/confirm'
        }, 
        { status: 401 }
      )
    }

    const body = await request.json()
    const { paymentIntentId } = body

    if (!paymentIntentId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Bad request',
          message: 'Payment intent ID is required',
          timestamp: new Date().toISOString(),
          path: '/api/payments/confirm'
        },
        { status: 400 }
      )
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.metadata.userId !== userId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Forbidden',
          message: 'Payment intent does not belong to this user',
          timestamp: new Date().toISOString(),
          path: '/api/payments/confirm'
        },
        { status: 403 }
      )
    }

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Payment not completed',
          message: `Payment status: ${paymentIntent.status}`,
          timestamp: new Date().toISOString(),
          path: '/api/payments/confirm'
        },
        { status: 400 }
      )
    }

    // Check if payment already processed by webhook or previous request
    const existingPayment = await prisma.paymentHistory.findUnique({
      where: { stripePaymentId: paymentIntent.id }
    })

    if (existingPayment) {
      console.log('Payment already processed by webhook:', paymentIntent.id)
      
      // Get current user credits
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { stars: true, coins: true }
      })

      return NextResponse.json({
        success: true,
        data: {
          credits: user?.stars || 0,
          transaction: {
            id: existingPayment.id,
            amount: existingPayment.amount,
            creditsAdded: existingPayment.creditsAdded
          },
          message: 'Payment already processed'
        }
      })
    }

    console.log('Processing payment via confirm endpoint (webhook may not have fired yet):', paymentIntent.id)

    // Payment not yet processed, process it now with duplicate protection
    const { packId, creditAmount } = paymentIntent.metadata
    
    if (!packId || !creditAmount) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid payment',
          message: 'Missing payment metadata',
          timestamp: new Date().toISOString(),
          path: '/api/payments/confirm'
        },
        { status: 400 }
      )
    }

    // Process payment in transaction with duplicate protection
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Double-check for existing payment within transaction to prevent race condition
        const existingInTx = await tx.paymentHistory.findUnique({
          where: { stripePaymentId: paymentIntent.id }
        })

        if (existingInTx) {
          // Payment was processed by webhook during our transaction
          throw new Error('PAYMENT_ALREADY_PROCESSED')
        }

        // Add credits to user
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            stars: { increment: parseInt(creditAmount) }
          },
          select: { stars: true }
        })

        // Record payment history
        const paymentHistory = await tx.paymentHistory.create({
          data: {
            userId,
            stripePaymentId: paymentIntent.id,
            packId: parseInt(packId),
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            status: 'succeeded',
            creditsAdded: parseInt(creditAmount)
          }
        })

        // Record point transaction
        await tx.pointTransaction.create({
          data: {
            id: `txn_${Date.now()}_${userId.slice(-8)}`,
            userId,
            eventType: 'STRIPE_TOPUP',
            deltaPoint: parseInt(creditAmount),
            deltaCoins: 0,
            deltaExp: 0,
            metadata: {
              stripePaymentId: paymentIntent.id,
              packId: parseInt(packId),
              amount: paymentIntent.amount
            }
          }
        })

        return {
          credits: updatedUser.stars,
          transaction: {
            id: paymentHistory.id,
            amount: paymentHistory.amount,
            creditsAdded: paymentHistory.creditsAdded
          }
        }
      })

      return NextResponse.json({
        success: true,
        data: result
      })

    } catch (transactionError: any) {
      if (transactionError.message === 'PAYMENT_ALREADY_PROCESSED') {
        // Payment was processed by webhook, return success
        console.log('Payment processed by webhook during confirmation:', paymentIntent.id)
        
        const existingPayment = await prisma.paymentHistory.findUnique({
          where: { stripePaymentId: paymentIntent.id }
        })
        
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { stars: true }
        })

        return NextResponse.json({
          success: true,
          data: {
            credits: user?.stars || 0,
            transaction: {
              id: existingPayment?.id,
              amount: existingPayment?.amount,
              creditsAdded: existingPayment?.creditsAdded
            },
            message: 'Payment processed by webhook'
          }
        })
      }
      
      // Re-throw other transaction errors
      throw transactionError
    }

  } catch (error) {
    console.error('Payment confirmation error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Failed to confirm payment',
        timestamp: new Date().toISOString(),
        path: '/api/payments/confirm'
      },
      { status: 500 }
    )
  }
}