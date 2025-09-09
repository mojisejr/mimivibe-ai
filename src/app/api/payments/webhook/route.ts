import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'
import { rateLimit, webhookRateLimitConfig } from '@/lib/rate-limiter'
import { markCampaignUsed } from '@/lib/campaign'

// Force dynamic rendering for headers() usage
export const dynamic = 'force-dynamic'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!
const DEBUG_MODE = process.env.NODE_ENV === 'development'

export async function POST(request: NextRequest) {
  try {
    // SECURITY ENHANCEMENT: Apply rate limiting for webhooks
    const rateLimitResponse = await rateLimit(request, webhookRateLimitConfig)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

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
      // SECURITY FIX: Remove sensitive information from logs
      console.error('Webhook signature verification failed')
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Webhook signature verification failed'
        },
        { status: 400 }
      )
    }

    // SECURITY ENHANCEMENT: Webhook replay attack prevention
    const eventTimestamp = event.created * 1000 // Convert to milliseconds
    const currentTime = Date.now()
    const fiveMinutesInMs = 5 * 60 * 1000
    
    if (currentTime - eventTimestamp > fiveMinutesInMs) {
      console.warn('Webhook event too old, potential replay attack')
      return NextResponse.json(
        { 
          success: false,
          error: 'Webhook event expired'
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
  const { 
    userId, 
    packId, 
    creditAmount, 
    originalPrice,
    finalPrice,
    campaignDiscount,
    campaignId,
    isFirstPayment
  } = paymentIntent.metadata
  
  if (DEBUG_MODE) {
    console.log('💰 Processing successful payment:', {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      userId,
      packId,
      creditAmount,
      originalPrice,
      finalPrice,
      campaignDiscount: campaignDiscount || '0',
      campaignId: campaignId || 'none',
      isFirstPayment: isFirstPayment || 'false'
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
          stars: { increment: parseInt(creditAmount) },
          updatedAt: new Date()
        }
      })

      // Record payment history with campaign information
      await tx.paymentHistory.create({
        data: {
          userId,
          stripePaymentId: paymentIntent.id,
          packId: parseInt(packId),
          amount: paymentIntent.amount, // This is the final paid amount (after discount)
          currency: paymentIntent.currency,
          status: 'succeeded',
          creditsAdded: parseInt(creditAmount),
          // Store campaign info in metadata if this was a campaign purchase
          ...(campaignId && campaignDiscount && {
            metadata: {
              campaignId,
              originalPrice: parseInt(originalPrice || '0'),
              campaignDiscount: parseInt(campaignDiscount),
              discountApplied: true,
              isFirstPayment: isFirstPayment === 'true'
            }
          })
        }
      })

      // Record point transaction with campaign information
      await tx.pointTransaction.create({
        data: {
          id: `txn_${Date.now()}_${userId.slice(-8)}`,
          userId,
          eventType: campaignId && isFirstPayment === 'true' ? 'CAMPAIGN_PURCHASE' : 'STRIPE_TOPUP',
          deltaPoint: parseInt(creditAmount),
          deltaCoins: 0,
          deltaExp: 0,
          metadata: {
            stripePaymentId: paymentIntent.id,
            packId: parseInt(packId),
            amount: paymentIntent.amount,
            ...(campaignId && {
              campaignId,
              originalPrice: parseInt(originalPrice || '0'),
              campaignDiscount: parseInt(campaignDiscount || '0'),
              isFirstPaymentCampaign: isFirstPayment === 'true'
            })
          }
        }
      })
    })

    // Mark campaign as used if this was a campaign purchase
    if (campaignId && isFirstPayment === 'true') {
      await markCampaignUsed(userId, campaignId, paymentIntent.id)
      if (DEBUG_MODE) {
        console.log('🎯 Campaign marked as used:', {
          userId,
          campaignId,
          paymentIntentId: paymentIntent.id
        })
      }
    }

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