import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!
const DEBUG_MODE = process.env.NODE_ENV === 'development'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!
    
    if (DEBUG_MODE) {
      console.log('🎣 Webhook received:', {
        hasSignature: !!signature,
        bodyLength: body.length,
        timestamp: new Date().toISOString()
      })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { 
          success: false,
          error: 'Webhook signature verification failed',
          timestamp: new Date().toISOString(),
          path: '/api/payments/webhook'
        },
        { status: 400 }
      )
    }

    // Handle the event
    if (DEBUG_MODE) {
      console.log('🎯 Processing event:', {
        type: event.type,
        id: event.id,
        created: new Date(event.created * 1000).toISOString()
      })
    }
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handleSuccessfulPayment(paymentIntent)
        break
        
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent
        await handleFailedPayment(failedPayment)
        break
        
      default:
        if (DEBUG_MODE) {
          console.log(`⚠️ Unhandled event type: ${event.type}`)
        }
    }

    return NextResponse.json({ 
      success: true,
      received: true,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Webhook handler failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        path: '/api/payments/webhook'
      },
      { status: 500 }
    )
  }
}

async function handleSuccessfulPayment(paymentIntent: Stripe.PaymentIntent) {
  const { userId, packId, creditAmount } = paymentIntent.metadata
  
  if (DEBUG_MODE) {
    console.log('💰 Processing successful payment:', {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      userId,
      packId,
      creditAmount
    })
  }
  
  if (!userId || !packId || !creditAmount) {
    console.error('❌ Missing metadata in payment intent:', paymentIntent.id)
    return
  }

  try {
    // Start transaction
    await prisma.$transaction(async (tx) => {
      // Add credits to user (stars)
      await tx.user.update({
        where: { id: userId },
        data: {
          stars: { increment: parseInt(creditAmount) }
        }
      })

      // Record payment history
      await tx.paymentHistory.create({
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
    })

    if (DEBUG_MODE) {
      console.log('✅ Payment transaction completed successfully for user:', userId)
    }
  } catch (error) {
    console.error('💥 Error processing successful payment:', error)
  }
}

async function handleFailedPayment(paymentIntent: Stripe.PaymentIntent) {
  const { userId, packId } = paymentIntent.metadata
  
  try {
    // Record failed payment
    await prisma.paymentHistory.create({
      data: {
        userId: userId || 'unknown',
        stripePaymentId: paymentIntent.id,
        packId: packId ? parseInt(packId) : 0,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: 'failed',
        creditsAdded: 0
      }
    })

    console.log(`Failed payment recorded for payment intent ${paymentIntent.id}`)
  } catch (error) {
    console.error('Error recording failed payment:', error)
  }
}