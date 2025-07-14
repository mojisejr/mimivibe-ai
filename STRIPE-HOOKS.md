# Stripe Webhooks Setup Guide

คู่มือการติดตั้งและกำหนดค่า Stripe Webhooks สำหรับ MiMiVibes Payment System

---

## Chapter 1: Local Development Setup

### 1.1 Prerequisites

ก่อนเริ่มต้น ให้แน่ใจว่าคุณมีสิ่งต่อไปนี้:

```bash
# Required tools
- Node.js 18+ installed
- Stripe CLI installed
- ngrok or similar tunneling tool (optional)
- Valid Stripe test account
```

### 1.2 Install Stripe CLI

#### macOS (using Homebrew)
```bash
brew install stripe/stripe-cli/stripe
```

#### Windows (using Scoop)
```bash
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

#### Linux (using apt)
```bash
wget -q -O - https://packages.stripe.dev/api/security/keypairs/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
sudo apt update
sudo apt install stripe
```

### 1.3 Authentication Setup

#### Login to Stripe
```bash
# Login with your Stripe account
stripe login

# Verify authentication
stripe config --list
```

#### Get Test API Keys
```bash
# Get your test secret key
stripe config --list

# Or get directly from Stripe Dashboard
# https://dashboard.stripe.com/test/apikeys
```

### 1.4 Environment Variables Configuration

สร้างไฟล์ `.env.local` และเพิ่มตัวแปรต่อไปนี้:

```bash
# Stripe Test Configuration
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Webhook Secret (will be generated in next step)
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Database Configuration
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 1.5 Local Webhook Setup Method 1: Stripe CLI (Recommended)

#### Step 1: Start your Next.js development server
```bash
npm run dev
# Server running on http://localhost:3000
```

#### Step 2: Start Stripe webhook forwarding
```bash
# Forward webhooks to your local endpoint
stripe listen --forward-to localhost:3000/api/payments/webhook

# Expected output:
# > Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxx (^C to quit)
```

#### Step 3: Copy the webhook secret
จากข้อความที่แสดงใน terminal ให้คัดลอก `whsec_xxxxxxxxxxxxxxxxxxxxx` และเพิ่มใน `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

#### Step 4: Restart your development server
```bash
# Stop the dev server (Ctrl+C) and restart
npm run dev
```

### 1.6 Local Webhook Setup Method 2: ngrok + Manual Webhook

#### Step 1: Install and setup ngrok
```bash
# Install ngrok
npm install -g ngrok

# Start tunnel to your local server
ngrok http 3000

# Note the HTTPS URL (e.g., https://abc123.ngrok.io)
```

#### Step 2: Create webhook endpoint in Stripe Dashboard
1. ไปที่ [Stripe Dashboard Webhooks](https://dashboard.stripe.com/test/webhooks)
2. คลิก "Add endpoint"
3. ใส่ URL: `https://abc123.ngrok.io/api/payments/webhook`
4. เลือก Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. คลิก "Add endpoint"

#### Step 3: Get webhook secret
1. คลิกที่ webhook endpoint ที่สร้างใหม่
2. ไปที่ tab "Signing secret"
3. คลิก "Reveal" และคัดลอก webhook secret
4. เพิ่มใน `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

### 1.7 Testing Local Webhooks

#### Test with Stripe CLI
```bash
# Trigger test payment_intent.succeeded event
stripe trigger payment_intent.succeeded

# Expected output in your Next.js logs:
# Payment processed successfully for user xxx
```

#### Test with Test Payment
```bash
# Create test payment intent
curl -X POST http://localhost:3000/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_SESSION_TOKEN" \
  -d '{"packId": 1}'

# Use test card numbers in Stripe Elements
# 4242424242424242 (Visa - succeeds)
# 4000000000000002 (Visa - declined)
```

### 1.8 Local Development Best Practices

#### Logging Configuration
```typescript
// src/app/api/payments/webhook/route.ts
const DEBUG_MODE = process.env.NODE_ENV === 'development'

export async function POST(request: NextRequest) {
  if (DEBUG_MODE) {
    console.log('🎣 Webhook received:', {
      headers: Object.fromEntries(request.headers.entries()),
      timestamp: new Date().toISOString()
    })
  }
  // ... rest of webhook handler
}
```

#### Error Handling
```typescript
// Enhanced error logging for development
catch (error) {
  if (DEBUG_MODE) {
    console.error('💥 Webhook error details:', {
      error: error.message,
      stack: error.stack,
      eventType: event?.type,
      paymentIntentId: paymentIntent?.id
    })
  }
  // ... error response
}
```

#### Database Transaction Debugging
```typescript
// Add transaction logging in development
await prisma.$transaction(async (tx) => {
  if (DEBUG_MODE) {
    console.log('🔄 Starting payment transaction for user:', userId)
  }
  
  // ... transaction logic
  
  if (DEBUG_MODE) {
    console.log('✅ Payment transaction completed')
  }
})
```

---

## Chapter 2: Production Deployment Setup

### 2.1 Production Environment Preparation

#### Environment Variables Setup
สำหรับ production ให้ใช้ Stripe Live keys และกำหนดค่าตัวแปรสิ่งแวดล้อมในระบบ deployment:

```bash
# Production Stripe Configuration
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Production Webhook Secret (will be configured)
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Production Database
DATABASE_URL="postgresql://production-db-url"
DIRECT_URL="postgresql://production-direct-url"

# Production Clerk Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

### 2.2 Vercel Deployment Configuration

#### Step 1: Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy your application
vercel --prod

# Note your production URL (e.g., https://mimi-vibes-v3.vercel.app)
```

#### Step 2: Configure Environment Variables in Vercel
1. ไปที่ [Vercel Dashboard](https://vercel.com/dashboard)
2. เลือก project ของคุณ
3. ไปที่ Settings → Environment Variables
4. เพิ่มตัวแปรทั้งหมดจาก production environment

### 2.3 Production Webhook Endpoint Setup

#### Step 1: Create Production Webhook in Stripe Live Dashboard
1. เปลี่ยนไปยัง Live mode ใน [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. คลิก "Add endpoint"
3. ใส่ URL: `https://your-domain.vercel.app/api/payments/webhook`
4. เลือก Events ที่จำเป็น:
   ```
   ✓ payment_intent.succeeded
   ✓ payment_intent.payment_failed
   ✓ payment_intent.canceled
   ✓ payment_method.attached (optional)
   ```

#### Step 2: Configure Webhook Security
1. คลิกที่ webhook endpoint ที่สร้าง
2. ไปที่ tab "Signing secret"
3. คัดลอก webhook secret
4. เพิ่มเป็น environment variable `STRIPE_WEBHOOK_SECRET` ใน Vercel

### 2.4 Production Security Best Practices

#### Rate Limiting
```typescript
// src/app/api/payments/webhook/route.ts
import { NextRequest } from 'next/server'

// Simple rate limiting for webhook endpoint
const webhookRequests = new Map<string, number>()

export async function POST(request: NextRequest) {
  const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()
  const windowStart = now - 60000 // 1 minute window
  
  // Clean old entries
  for (const [ip, timestamp] of webhookRequests.entries()) {
    if (timestamp < windowStart) {
      webhookRequests.delete(ip)
    }
  }
  
  // Check rate limit (max 100 requests per minute per IP)
  const requestCount = Array.from(webhookRequests.values())
    .filter(timestamp => timestamp > windowStart).length
    
  if (requestCount > 100) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    )
  }
  
  webhookRequests.set(clientIP, now)
  
  // ... rest of webhook handler
}
```

#### Webhook Signature Verification Enhancement
```typescript
// Enhanced signature verification
export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')
  
  if (!signature) {
    console.error('Missing Stripe signature')
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    )
  }
  
  let event: Stripe.Event
  
  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body, 
      signature, 
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', {
      error: err instanceof Error ? err.message : 'Unknown error',
      signature: signature.substring(0, 20) + '...',
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }
  
  // ... process verified event
}
```

### 2.5 Production Monitoring & Logging

#### Webhook Monitoring Setup
```typescript
// src/lib/monitoring.ts
export async function logWebhookEvent(event: {
  type: string
  id: string
  status: 'success' | 'error'
  userId?: string
  error?: string
}) {
  // Log to your monitoring service (e.g., Sentry, LogRocket, etc.)
  if (process.env.NODE_ENV === 'production') {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      service: 'stripe-webhook',
      event: event.type,
      id: event.id,
      status: event.status,
      userId: event.userId,
      error: event.error
    }))
  }
}
```

#### Database Connection Monitoring
```typescript
// src/app/api/payments/webhook/route.ts
import { logWebhookEvent } from '@/lib/monitoring'

async function handleSuccessfulPayment(paymentIntent: Stripe.PaymentIntent) {
  const startTime = Date.now()
  
  try {
    await prisma.$transaction(async (tx) => {
      // ... payment processing logic
    })
    
    await logWebhookEvent({
      type: 'payment_success',
      id: paymentIntent.id,
      status: 'success',
      userId: paymentIntent.metadata.userId
    })
    
  } catch (error) {
    const duration = Date.now() - startTime
    
    await logWebhookEvent({
      type: 'payment_success',
      id: paymentIntent.id,
      status: 'error',
      userId: paymentIntent.metadata.userId,
      error: `Transaction failed after ${duration}ms: ${error.message}`
    })
    
    throw error
  }
}
```

### 2.6 Production Testing Strategy

#### Webhook Testing with Stripe CLI in Production
```bash
# Test production webhooks (use with caution)
stripe listen --forward-to https://your-domain.vercel.app/api/payments/webhook --live

# Trigger test events to production (only for testing)
stripe trigger payment_intent.succeeded --live
```

#### Production Payment Testing
```bash
# Create test payment in production mode
curl -X POST https://your-domain.vercel.app/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PRODUCTION_CLERK_TOKEN" \
  -d '{"packId": 1}'

# Use Stripe test cards in live mode (will be processed as test)
# 4242424242424242 (test card - no real charge)
```

### 2.7 Production Deployment Checklist

#### Pre-deployment Verification
- [ ] All environment variables configured correctly
- [ ] Stripe webhook endpoint created with live keys  
- [ ] Database migrations applied to production
- [ ] SSL certificate installed and verified
- [ ] Rate limiting implemented
- [ ] Error monitoring configured
- [ ] Backup strategy in place

#### Post-deployment Testing
- [ ] Webhook endpoint responds to Stripe test events
- [ ] Payment flow works end-to-end
- [ ] Database transactions complete successfully
- [ ] Error handling works correctly
- [ ] Monitoring and logging function properly
- [ ] Performance meets requirements

#### Ongoing Maintenance
- [ ] Monitor webhook delivery success rate
- [ ] Review error logs regularly
- [ ] Update Stripe SDK versions
- [ ] Rotate webhook secrets periodically
- [ ] Monitor payment success/failure rates
- [ ] Review security practices quarterly

### 2.8 Troubleshooting Common Production Issues

#### Issue 1: Webhook Timeouts
```typescript
// Implement webhook timeout handling
export async function POST(request: NextRequest) {
  const timeoutId = setTimeout(() => {
    console.error('Webhook processing timeout')
  }, 10000) // 10 second timeout
  
  try {
    // ... webhook processing
    clearTimeout(timeoutId)
    return NextResponse.json({ received: true })
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}
```

#### Issue 2: Database Connection Issues
```typescript
// Implement connection retry logic
async function handlePaymentWithRetry(paymentIntent: Stripe.PaymentIntent, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await handleSuccessfulPayment(paymentIntent)
      return
    } catch (error) {
      console.error(`Payment processing attempt ${attempt} failed:`, error)
      
      if (attempt === maxRetries) {
        throw error
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
    }
  }
}
```

#### Issue 3: Webhook Replay Protection
```typescript
// Implement idempotency for webhook processing
const processedEvents = new Set<string>()

export async function POST(request: NextRequest) {
  const event = stripe.webhooks.constructEvent(/* ... */)
  
  // Check if event already processed
  if (processedEvents.has(event.id)) {
    console.log(`Event ${event.id} already processed, skipping`)
    return NextResponse.json({ received: true })
  }
  
  try {
    // Process event
    await handleEvent(event)
    processedEvents.add(event.id)
  } catch (error) {
    // Don't mark as processed if failed
    throw error
  }
  
  return NextResponse.json({ received: true })
}
```

---

## Summary

การติดตั้ง Stripe Webhooks สำหรับ MiMiVibes Payment System ต้องการความระมัดระวังในการกำหนดค่าทั้งใน local development และ production environments 

**Key Points:**
- ใช้ Stripe CLI สำหรับ local development testing
- กำหนดค่า environment variables อย่างถูกต้อง
- ใช้ HTTPS และ signature verification ใน production
- Implement proper error handling และ monitoring
- Test thoroughly ก่อน deploy ไป production

การทำตามขั้นตอนในคู่มือนี้จะช่วยให้คุณสามารถติดตั้งและใช้งาน Stripe Webhooks ได้อย่างปลอดภัยและมีประสิทธิภาพ