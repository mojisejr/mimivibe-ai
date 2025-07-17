# API-AUTH.md

## 🔐 Authentication & User Management API

สำหรับ Round 2: Database Layer + Authentication endpoints

---

## Authentication Strategy

### Authentication Flow
```typescript
LINE LIFF → Clerk JWT → API Middleware → Protected Resources
```

### Security Implementation
```typescript
const authConfig = {
  method: "Clerk JWT tokens",
  lineIntegration: "LIFF authentication flow through Clerk", 
  middleware: "JWT validation on all protected routes",
  rateLimiting: "User-based and endpoint-specific limits"
};

const authHeaders = {
  Authorization: "Bearer <clerk_jwt_token>",
  "Content-Type": "application/json"
};
```

---

## Core User API Endpoints

### User Profile Operations

#### Get Current User Profile
```typescript
GET /api/user/profile
Response: {
  id: string;
  lineId?: string;
  name?: string;
  email?: string;
  imageUrl?: string;
  stats: {
    stars: number;
    coins: number;
    exp: number;
    level: number;
    freePoint: number;
  };
  createdAt: string;
}
```

#### Update User Profile
```typescript
PUT /api/user/profile
Body: {
  name?: string;
  email?: string;
  imageUrl?: string;
}
Response: UserProfile
```

#### Get User Statistics
```typescript
GET /api/user/stats
Response: {
  level: number;
  exp: number;
  expRequired: number;
  expToNext: number;
  coins: number;
  stars: number;
  totalReadings: number;
  avgAccuracy: number;
  loginStreak: number;
}
```

### Authentication Callbacks

#### LINE LIFF Callback
```typescript
POST /api/auth/line-callback
Body: {
  code: string;
  state: string;
}
Response: {
  success: boolean;
  redirectUrl: string;
}
```

---

## Database Models (Prisma Schema)

### User Model
```prisma
model User {
  id        String   @id @default(cuid())
  lineId    String?  @unique
  email     String?  @unique
  name      String?
  tel       String?
  imageUrl  String?
  
  // Credits & Gamification
  stars     Int      @default(5)     // Free trial credits
  coins     Int      @default(0)     // Earned currency
  exp       Int      @default(0)     // Experience points
  level     Int      @default(1)     // User level
  freePoint Int      @default(5)     // Free daily points
  
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  readings          Reading[]
  pointTransactions PointTransaction[]
  paymentHistory    PaymentHistory[]
  referralCodes     ReferralCode[]
  reviews          Review[]
  
  @@map("users")
}

enum Role {
  USER
  ADMIN
}
```

### Point Transaction Model
```prisma
model PointTransaction {
  id         String   @id @default(cuid())
  userId     String
  eventType  String   // 'READING_SPEND', 'STRIPE_TOPUP', 'REWARD', 'COIN_TO_STAR'
  deltaPoint Int      // Change in stars (can be negative)
  deltaCoins Int      @default(0) // Change in coins
  deltaExp   Int      @default(0) // Change in experience
  metadata   Json?    // Additional context
  createdAt  DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("point_transactions")
}
```

---

## API Implementation Examples

### Middleware for Authentication
```typescript
// src/middleware.ts
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/api/webhooks/(.*)"],
  ignoredRoutes: ["/api/health"]
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

### User Profile API Route
```typescript
// src/app/api/user/profile/route.ts
import { auth } from '@clerk/nextjs'
import { NextRequest, NextResponse } from 'next/server'
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
        id: true,
        lineId: true,
        name: true,
        email: true,
        imageUrl: true,
        stars: true,
        coins: true,
        exp: true,
        level: true,
        freePoint: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        stats: {
          stars: user.stars,
          coins: user.coins,
          exp: user.exp,
          level: user.level,
          freePoint: user.freePoint
        }
      }
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, imageUrl } = body

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(imageUrl && { imageUrl })
      },
      select: {
        id: true,
        name: true,
        email: true,
        imageUrl: true,
        stars: true,
        coins: true,
        exp: true,
        level: true,
        freePoint: true
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedUser
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### User Stats API Route
```typescript
// src/app/api/user/stats/route.ts
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
      include: {
        readings: {
          where: { isDeleted: false },
          select: { isReviewed: true }
        },
        reviews: {
          select: { accurateLevel: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate level progression
    const expRequired = user.level * 100 // Simple formula
    const expToNext = expRequired - user.exp

    // Calculate accuracy
    const reviewedReadings = user.reviews.filter(r => r.accurateLevel !== null)
    const avgAccuracy = reviewedReadings.length > 0 
      ? reviewedReadings.reduce((sum, r) => sum + r.accurateLevel, 0) / reviewedReadings.length
      : 0

    return NextResponse.json({
      success: true,
      data: {
        level: user.level,
        exp: user.exp,
        expRequired,
        expToNext: Math.max(0, expToNext),
        coins: user.coins,
        stars: user.stars,
        totalReadings: user.readings.length,
        avgAccuracy: Math.round(avgAccuracy),
        loginStreak: 0 // TODO: Implement login streak calculation
      }
    })
  } catch (error) {
    console.error('Stats fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## Error Handling

### Standard Error Responses
```typescript
interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  code?: string;
  timestamp: string;
  path: string;
}
```

### Common Error Codes
```typescript
const authErrorCodes = {
  AUTH_TOKEN_MISSING: "Missing authentication token",
  AUTH_TOKEN_INVALID: "Invalid authentication token", 
  AUTH_TOKEN_EXPIRED: "Authentication token expired",
  USER_NOT_FOUND: "User not found",
  INSUFFICIENT_PERMISSIONS: "Insufficient permissions"
};
```

---

## Rate Limiting

### Rate Limit Configuration
```typescript
const rateLimits = {
  authenticated: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000 // requests per window
  },
  
  "/api/user/profile": {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10 // profile updates per 5 min
  }
};
```

---

**File Purpose**: Authentication & User Management  
**Round Usage**: Round 2 (Database Layer)  
**Dependencies**: Clerk, Prisma, PostgreSQL  
**Estimated Tokens**: ~2,000