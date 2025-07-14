# API-PAYMENTS.md

## 💳 Payment System & Credit Management API

สำหรับ Round 5: Payment & Credit System

---

## Stripe Integration

### Payment Flow
```typescript
User selects package → Create payment intent → Stripe checkout → Webhook confirmation → Credit addition
```

---

## Payment API Endpoints

### Package Management

#### Get Available Packages
```typescript
GET /api/payments/packages
Response: {
  packages: Array<{
    id: number;
    title: string;
    subtitle?: string;
    price: number;           // in cents
    creditAmount: number;    // stars amount
    ctaText: string;
    metadata?: object;
    popular?: boolean;
  }>;
}
```

#### Create Payment Intent
```typescript
POST /api/payments/create-intent
Body: {
  packId: number;
}
Response: {
  clientSecret: string;
  amount: number;
  currency: string;
}
```

#### Confirm Payment Completion
```typescript
POST /api/payments/confirm
Body: {
  paymentIntentId: string;
}
Response: {
  success: boolean;
  credits: number;
  transaction: {
    id: string;
    amount: number;
    creditsAdded: number;
  };
}
```

#### Payment Webhook (Stripe)
```typescript
POST /api/payments/webhook
Headers: { stripe-signature: string; }
Body: StripeEvent
Response: { received: boolean; }
```

---

## Credit Management API

### Credit Balance

#### Get Current Credit Balance
```typescript
GET /api/user/credits
Response: {
  stars: number;
  coins: number;
  freePoint: number;
  limits: {
    dailyFree: { used: number; max: number; resetAt: string; };
    monthlyFree: { used: number; max: number; resetAt: string; };
  };
}
```

#### Spend Credits (Internal Use)
```typescript
POST /api/credits/spend
Body: {
  amount: number;
  reason: string;
  metadata?: object;
}
Response: {
  success: boolean;
  newBalance: number;
  transaction: {
    id: string;
    amount: number;
    reason: string;
  };
}
```

#### Get Transaction History
```typescript
GET /api/credits/transactions
Query: {
  page?: number;
  limit?: number;
  type?: 'COIN_TO_STAR' | 'STRIPE_TOPUP' | 'REWARD' | 'READING_SPEND';
}
Response: {
  transactions: Array<{
    id: string;
    eventType: string;
    deltaPoint: number;
    deltaCoins: number;
    deltaExp: number;
    createdAt: string;
    metadata?: object;
  }>;
  pagination: PaginationMeta;
}
```

---

## Database Models

### Payment History Model
```prisma
model PaymentHistory {
  id                String   @id @default(cuid())
  userId            String
  stripePaymentId   String   @unique
  packId            Int
  amount            Int      // in cents
  currency          String   @default("thb")
  status            String   // succeeded, failed, pending
  creditsAdded      Int
  createdAt         DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("payment_history")
}

model Package {
  id           Int     @id @default(autoincrement())
  title        String
  subtitle     String?
  price        Int     // in cents
  creditAmount Int     // stars to add
  ctaText      String
  metadata     Json?
  isActive     Boolean @default(true)
  popular      Boolean @default(false)
  sortOrder    Int     @default(0)
  
  @@map("packages")
}
```

---

## Package Configuration

### Default Packages
```typescript
const defaultPackages = [
  {
    id: 1,
    title: "Starter Pack",
    subtitle: "เริ่มต้นดูดวง",
    price: 9900, // ฿99
    creditAmount: 20,
    ctaText: "ซื้อ 20 Stars",
    popular: false
  },
  {
    id: 2,
    title: "Popular Pack", 
    subtitle: "คุ้มค่าที่สุด",
    price: 19900, // ฿199
    creditAmount: 50,
    ctaText: "ซื้อ 50 Stars",
    popular: true
  },
  {
    id: 3,
    title: "Premium Pack",
    subtitle: "สำหรับผู้ใช้งานหนัก",
    price: 39900, // ฿399
    creditAmount: 120,
    ctaText: "ซื้อ 120 Stars",
    popular: false
  },
  {
    id: 4,
    title: "Super Pack",
    subtitle: "ดูดวงไม่จำกัด",
    price: 59900, // ฿599
    creditAmount: 200,
    ctaText: "ซื้อ 200 Stars",
    popular: false
  }
];
```

---

## Stripe Implementation

### Stripe Configuration
```typescript
// src/lib/stripe.ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount)
}

export const formatAmountFromStripe = (amount: number): number => {
  return Math.round(amount)
}
```

### Payment Intent Creation
```typescript
// src/app/api/payments/create-intent/route.ts
import { auth } from '@clerk/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { stripe, formatAmountForStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { packId } = body

    if (!packId) {
      return NextResponse.json(
        { error: 'Package ID is required' },
        { status: 400 }
      )
    }

    // Get package details
    const package = await prisma.package.findUnique({
      where: { id: packId, isActive: true }
    })

    if (!package) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      )
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmountForStripe(package.price),
      currency: 'thb',
      metadata: {
        userId,
        packId: packId.toString(),
        creditAmount: package.creditAmount.toString()
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        amount: package.price,
        currency: 'thb'
      }
    })

  } catch (error) {
    console.error('Payment intent creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Payment Webhook Handler
```typescript
// src/app/api/payments/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    // Handle the event
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
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleSuccessfulPayment(paymentIntent: Stripe.PaymentIntent) {
  const { userId, packId, creditAmount } = paymentIntent.metadata
  
  if (!userId || !packId || !creditAmount) {
    console.error('Missing metadata in payment intent:', paymentIntent.id)
    return
  }

  try {
    // Start transaction
    await prisma.$transaction(async (tx) => {
      // Add credits to user
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

    console.log(`Payment processed successfully for user ${userId}`)
  } catch (error) {
    console.error('Error processing successful payment:', error)
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
  } catch (error) {
    console.error('Error recording failed payment:', error)
  }
}
```

### Get Packages Endpoint
```typescript
// src/app/api/payments/packages/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const packages = await prisma.package.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        title: true,
        subtitle: true,
        price: true,
        creditAmount: true,
        ctaText: true,
        metadata: true,
        popular: true
      }
    })

    return NextResponse.json({
      success: true,
      data: { packages }
    })

  } catch (error) {
    console.error('Get packages error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## Credit Management Implementation

### Get Credits Endpoint
```typescript
// src/app/api/user/credits/route.ts
import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        stars: true,
        coins: true,
        freePoint: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate daily/monthly limits (simple implementation)
    const now = new Date()
    const startOfDay = new Date(now.setHours(0, 0, 0, 0))
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get today's usage
    const todayUsage = await prisma.pointTransaction.count({
      where: {
        userId,
        eventType: 'READING_SPEND',
        createdAt: { gte: startOfDay }
      }
    })

    // Get this month's usage
    const monthUsage = await prisma.pointTransaction.count({
      where: {
        userId,
        eventType: 'READING_SPEND', 
        createdAt: { gte: startOfMonth }
      }
    })

    const dailyFreeLimit = 3
    const monthlyFreeLimit = 50

    return NextResponse.json({
      success: true,
      data: {
        stars: user.stars,
        coins: user.coins,
        freePoint: user.freePoint,
        limits: {
          dailyFree: {
            used: Math.min(todayUsage, dailyFreeLimit),
            max: dailyFreeLimit,
            resetAt: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000).toISOString()
          },
          monthlyFree: {
            used: Math.min(monthUsage, monthlyFreeLimit),
            max: monthlyFreeLimit,
            resetAt: new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 1).toISOString()
          }
        }
      }
    })

  } catch (error) {
    console.error('Get credits error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Transaction History Endpoint
```typescript
// src/app/api/credits/transactions/route.ts
import { auth } from '@clerk/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const type = searchParams.get('type')

    const where: any = { userId }
    if (type) {
      where.eventType = type
    }

    const [transactions, total] = await Promise.all([
      prisma.pointTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          eventType: true,
          deltaPoint: true,
          deltaCoins: true,
          deltaExp: true,
          createdAt: true,
          metadata: true
        }
      }),
      prisma.pointTransaction.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    })

  } catch (error) {
    console.error('Transaction history error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## Environment Variables

### Required Stripe Variables
```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Currency Settings
NEXT_PUBLIC_CURRENCY=THB
NEXT_PUBLIC_PAYMENT_METHODS=card,promptpay
```

---

## Error Handling

### Payment-Specific Errors
```typescript
const paymentErrorCodes = {
  PAYMENT_FAILED: "Payment processing failed",
  INVALID_PACKAGE: "Invalid package selected",
  STRIPE_ERROR: "Payment service error",
  WEBHOOK_VERIFICATION_FAILED: "Webhook verification failed",
  INSUFFICIENT_AMOUNT: "Payment amount insufficient"
};
```

---

**File Purpose**: Payment System & Credit Management  
**Round Usage**: Round 5 (Payment & Credit System)  
**Dependencies**: Stripe, Database Models  
**Estimated Tokens**: ~2,000