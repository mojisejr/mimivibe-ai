# API-FEATURES.md

## 🎮 Gamification & Advanced Features API

สำหรับ Round 6: Gamification Features
**Phase 2 Enhancements**: Dynamic URL detection, improved referral system

**Last Updated**: Phase 2 Round 10 - Fixed referral links production deployment issue

---

## Gamification System API

### 🏆 Achievement System (CRITICAL ANALYSIS RESULTS)

**Current Status**: ❌ **INCOMPLETE** - Critical bugs and missing implementations identified

#### Implementation Issues Discovered

**A. Critical Logic Bugs:**
- Claim button shows for already-completed achievements (incorrect)
- Multi-criteria achievements show misleading progress (ULTIMATE_MASTER issue)
- No automatic achievement detection when conditions are met

**B. Missing Implementations:**
- Login streak tracking returns placeholder data (TODO comments)
- Average accuracy calculation not implemented
- No auto-triggering system for achievement completion

**C. UX Problems:**
- Manual claim process requiring users to visit /events page
- No real-time notifications when achievements are ready
- Poor discoverability of achievement system

#### Achievement API Endpoints

**✅ Currently Working:**
```typescript
GET /api/achievements/progress
// Works but shows incorrect progress for multi-criteria achievements
Response: {
  success: boolean;
  data: {
    achievements: Array<{
      id: string;
      name: string;
      icon: string;
      title: string;
      description: string;
      progress: {
        current: number;    // ⚠️ Misleading for multi-criteria
        required: number;
        completed: boolean; // ⚠️ Based on claim status, not criteria met
      };
      rewards: { exp?: number; coins?: number; stars?: number; };
    }>;
    summary: {
      total: number;
      completed: number;
      inProgress: number;
    };
  };
}

POST /api/achievements/claim
// Works but frontend button logic is wrong
Body: { achievementId: string }
Response: {
  success: boolean;
  data: {
    achievementId: string;
    achievementTitle: string;
    rewards: { exp?: number; coins?: number; stars?: number; };
    newTotals: { exp: number; coins: number; stars: number; };
  };
}
```

**❌ Missing Required Endpoints:**
```typescript
POST /api/achievements/check
// Needed for manual/automatic achievement checking
Body: { 
  userId?: string;        // Optional, defaults to authenticated user
  triggerType?: string;   // 'READING' | 'LEVEL_UP' | 'REFERRAL' | 'MANUAL'
}
Response: {
  success: boolean;
  data: {
    readyAchievements: Array<{
      id: string;
      title: string;
      rewards: object;
    }>;
    newlyCompleted: number;
  };
}

GET /api/achievements/ready
// Needed for notification system and navbar badges
Response: {
  success: boolean;
  data: {
    count: number;
    achievements: Array<{
      id: string;
      title: string;
      icon: string;
    }>;
  };
}

POST /api/achievements/notify
// Needed for achievement completion notifications
Body: {
  achievementId: string;
  notificationType: 'IMMEDIATE' | 'BATCH' | 'DIGEST';
}
```

#### Current Tracking Implementation Status

**✅ Working Criteria:**
- `readingCount`: Counts user readings (non-deleted)
- `level`: Uses user.level field
- `totalReadings`: Same as readingCount
- `reviewCount`: Counts user reviews
- `referralCount`: Counts used referral codes
- `totalCoinsEarned`: Sums positive coin transactions
- `prestigeLevel`: Uses user.prestigeLevel field

**❌ Placeholder/Broken Criteria:**
```typescript
// Login streak - returns mock data
if (criteria.loginStreak || criteria.streakDays) {
  // TODO: Implement proper streak tracking
  return { current: 0, required: criteria.loginStreak || criteria.streakDays }
}

// Average accuracy - not implemented
if (criteria.averageAccuracy) {
  // TODO: Implement average accuracy calculation
  return true // Always returns true
}
```

#### Required Database Schema Additions

```sql
-- Missing: Login streak tracking
CREATE TABLE user_login_streaks (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_login_date DATE,
  streak_start_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Missing: Achievement notifications
CREATE TABLE achievement_notifications (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  achievement_id VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'PENDING', -- PENDING, SENT, READ
  notified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Systematic Repair Plan

**Phase 1: Critical Bug Fixes (IMMEDIATE)**
```typescript
// 1. Fix claim button logic in AchievementBadges.tsx
// Current (wrong): {isCompleted && <ClaimButton />}
// Should be: {criteriaMetButNotClaimed && <ClaimButton />}

// 2. Fix multi-criteria progress calculation
// Instead of showing "least completed", show overall progress

// 3. Implement missing streak tracking
// Add login streak table and update logic

// 4. Add achievement checking service
// Create reusable service for checking achievement criteria
```

**Phase 2: Auto-Triggering Integration (HIGH PRIORITY)**
```typescript
// Add achievement triggers to existing APIs:

// /api/readings/save - after reading completion
await checkAndTriggerAchievements(userId, 'READING');

// /api/user/level-check - after level up  
await checkAndTriggerAchievements(userId, 'LEVEL_UP');

// /api/referrals/process - after referral completion
await checkAndTriggerAchievements(userId, 'REFERRAL');
```

**Phase 3: Enhanced UX Integration (MEDIUM PRIORITY)**
```typescript
// 1. Add achievement badge to UnifiedNavbar
// 2. Add achievement progress to profile sidebar
// 3. Implement achievement notifications
// 4. Add achievement preview in onboarding
```

### Experience & Leveling

#### Get Level Configuration
```typescript
GET /api/gamification/levels
Response: {
  currentLevel: number;
  exp: number;
  expRequired: number;
  expToNext: number;
  nextLevelBenefits: {
    bonusExp: number;
    bonusCoins: number;
    unlocks: string[];
  };
}
```

#### Level Up (Internal Trigger)
```typescript
POST /api/gamification/level-up
Response: {
  success: boolean;
  newLevel: number;
  rewards: {
    exp: number;
    coins: number;
    unlocks: string[];
  };
}
```

---

## Daily Login & Campaigns

### Campaign Management

#### Get Active Campaigns
```typescript
GET /api/campaigns/active
Response: {
  campaigns: Array<{
    id: string;
    title: string;
    type: "DAILY_LOGIN" | "SPECIAL_EVENT";
    startDate: string;
    endDate: string;
    progress: {
      current: number;
      total: number;
      claimed: boolean[];
    };
    rewards: Array<{
      day: number;
      exp: number;
      coins: number;
      description: string;
    }>;
  }>;
}
```

#### Claim Daily Login Reward
```typescript
POST /api/campaigns/daily-login/claim
Response: {
  success: boolean;
  alreadyClaimed: boolean;
  rewards: {
    exp: number;
    coins: number;
    streak: number;
  };
  nextClaimAt: string;
}
```

#### Get Login Streak Info
```typescript
GET /api/campaigns/daily-login/status
Response: {
  streak: number;
  lastLogin: string;
  canClaim: boolean;
  nextClaimAt: string;
  monthlyProgress: {
    daysCompleted: number;
    totalDays: number;
    monthlyBonus: {
      exp: number;
      coins: number;
    };
  };
}
```

---

## Coin Exchange System

### Exchange Rates

#### Get Exchange Rates
```typescript
GET /api/coins/exchange-rates
Response: {
  rates: Array<{
    fromCurrency: "COINS";
    toCurrency: "STARS";
    rate: number; // coins per star
    minAmount: number;
    maxAmount: number;
  }>;
  userLimits: {
    dailyMax: number;
    used: number;
    resetAt: string;
  };
}
```

#### Exchange Coins for Stars
```typescript
POST /api/coins/exchange
Body: {
  coinAmount: number;
  targetCurrency: "STARS";
}
Response: {
  success: boolean;
  exchanged: {
    coinsSpent: number;
    starsReceived: number;
    rate: number;
  };
  newBalances: {
    coins: number;
    stars: number;
  };
  transaction: {
    id: string;
    createdAt: string;
  };
}
```

---

## Referral System

### Referral Management

#### Get User Referral Info
```typescript
GET /api/referrals/status
// Uses dynamic URL detection - works in development and production
// Development: http://localhost:3000?ref=ABC12345
// Production: https://your-domain.com?ref=ABC12345
Response: {
  referralCode: string;
  referralLink: string; // Dynamically generated based on environment
  stats: {
    totalReferred: number;
    successfulReferrals: number;
    totalRewards: {
      exp: number;
      coins: number;
      stars: number;
    };
  };
  recentReferrals: Array<{
    id: string;
    referredAt: string;
    rewarded: boolean;
    rewardAmount: {
      exp: number;
      coins: number;
    };
  }>;
}
```

#### Process Referral (When New User Signs Up)
```typescript
POST /api/referrals/process
Body: {
  referralCode: string;
  newUserId: string;
}
Response: {
  success: boolean;
  referrerReward: {
    exp: number;
    coins: number;
  };
  referredReward: {
    exp: number;
    coins: number;
    freeCredits: number;
  };
}
```

---

## 🌐 Dynamic URL System (Phase 2 Enhancement)

### Overview
Fixed production deployment issue where referral links were hardcoded to `localhost:3000`. Now uses dynamic URL detection that works across all environments.

### Implementation

#### URL Utility Functions
```typescript
// src/lib/utils/url.ts
export function getBaseUrl(): string {
  // Browser (client-side)
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Server-side environment detection
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // Vercel auto-detection
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // NextAuth URL
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }

  // Fallbacks
  return process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000'
    : 'https://your-domain.com';
}

export function buildUrl(path: string = ''): string {
  const baseUrl = getBaseUrl();
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const separator = cleanPath && !baseUrl.endsWith('/') ? '/' : '';
  return `${baseUrl}${separator}${cleanPath}`;
}
```

#### Updated Referral API
```typescript
// src/app/api/referrals/status/route.ts
import { getBaseUrl } from '@/lib/utils/url'

// Before: Hard-coded URL
// const referralLink = `${process.env.NEXT_PUBLIC_APP_URL}?ref=${code}`

// After: Dynamic URL detection
const referralLink = `${getBaseUrl()}?ref=${referralCode.code}`
```

### Environment Support

| Environment | URL Detection | Example |
|-------------|---------------|----------|
| **Development** | `localhost:3000` | `http://localhost:3000?ref=ABC12345` |
| **Vercel** | `VERCEL_URL` | `https://app.vercel.app?ref=ABC12345` |
| **Production** | `NEXT_PUBLIC_APP_URL` | `https://your-domain.com?ref=ABC12345` |
| **Custom** | `NEXTAUTH_URL` | Custom domain support |

### Production Deployment

#### Environment Variables Setup
```bash
# .env.production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# For Vercel (auto-set)
# VERCEL_URL=your-app.vercel.app

# For other platforms
# NEXTAUTH_URL=https://your-domain.com
```

#### Benefits
- ✅ **No code changes** needed between environments
- ✅ **Automatic detection** of deployment URL
- ✅ **Works with all hosting platforms**
- ✅ **Fallback support** for edge cases
- ✅ **Development-friendly** with localhost detection

---

## Database Models

### Daily Login Campaign Model
```prisma
model DailyLoginCampaign {
  id          String   @id @default(cuid())
  userId      String
  year        Int
  month       Int
  claimedDays Json     @default("[]") // Array of claimed day numbers
  streak      Int      @default(0)
  lastClaim   DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, year, month])
  @@map("daily_login_campaigns")
}

model ReferralCode {
  id           String   @id @default(cuid())
  userId       String
  code         String   @unique
  referredBy   String?  // userId who referred this user
  isUsed       Boolean  @default(false)
  usedAt       DateTime?
  createdAt    DateTime @default(now())
  
  user     User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  referrer User? @relation("UserReferrals", fields: [referredBy], references: [id])
  
  @@map("referral_codes")
}

model User {
  // ... existing fields ...
  referralCodes     ReferralCode[]
  referredUsers     ReferralCode[] @relation("UserReferrals")
  dailyLoginCampaigns DailyLoginCampaign[]
}
```

---

## Implementation Examples

### Level System
```typescript
// src/lib/gamification/levels.ts
export interface LevelConfig {
  level: number;
  expRequired: number;
  expToNext: number;
  benefits: {
    bonusExp: number;
    bonusCoins: number;
    unlocks: string[];
  };
}

export function calculateLevel(totalExp: number): LevelConfig {
  // Simple exponential progression: level * 100 EXP
  let currentLevel = 1;
  let expForCurrentLevel = 0;
  
  while (expForCurrentLevel + (currentLevel * 100) <= totalExp) {
    expForCurrentLevel += currentLevel * 100;
    currentLevel++;
  }
  
  const expRequired = currentLevel * 100;
  const expToNext = expRequired - (totalExp - expForCurrentLevel);
  
  return {
    level: currentLevel,
    expRequired,
    expToNext,
    benefits: {
      bonusExp: Math.floor(currentLevel * 0.1), // 10% bonus per level
      bonusCoins: Math.floor(currentLevel * 0.05), // 5% bonus per level
      unlocks: getLevelUnlocks(currentLevel)
    }
  };
}

function getLevelUnlocks(level: number): string[] {
  const unlocks: string[] = [];
  
  if (level >= 5) unlocks.push("Daily bonus multiplier");
  if (level >= 10) unlocks.push("Exclusive card interpretations");
  if (level >= 15) unlocks.push("Advanced reading patterns");
  if (level >= 20) unlocks.push("VIP support access");
  
  return unlocks;
}
```

### Daily Login Implementation
```typescript
// src/app/api/campaigns/daily-login/claim/route.ts
import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    const currentDay = now.getDate()

    // Get or create campaign record
    let campaign = await prisma.dailyLoginCampaign.findUnique({
      where: {
        userId_year_month: {
          userId,
          year: currentYear,
          month: currentMonth
        }
      }
    })

    if (!campaign) {
      campaign = await prisma.dailyLoginCampaign.create({
        data: {
          userId,
          year: currentYear,
          month: currentMonth,
          claimedDays: [],
          streak: 0
        }
      })
    }

    const claimedDays = campaign.claimedDays as number[]
    
    // Check if already claimed today
    if (claimedDays.includes(currentDay)) {
      return NextResponse.json({
        success: false,
        alreadyClaimed: true,
        message: "Already claimed today"
      })
    }

    // Calculate streak
    let newStreak = campaign.streak
    const yesterday = currentDay - 1
    
    if (yesterday > 0 && claimedDays.includes(yesterday)) {
      newStreak += 1
    } else if (claimedDays.length === 0 || !claimedDays.includes(yesterday)) {
      newStreak = 1 // Reset streak
    }

    // Calculate rewards based on streak
    const baseExp = 10
    const baseCoins = 5
    const streakMultiplier = Math.min(newStreak * 0.1, 2.0) // Max 2x multiplier
    
    const expReward = Math.floor(baseExp * (1 + streakMultiplier))
    const coinReward = Math.floor(baseCoins * (1 + streakMultiplier))

    // Update campaign and user
    await prisma.$transaction(async (tx) => {
      // Update campaign
      await tx.dailyLoginCampaign.update({
        where: { id: campaign.id },
        data: {
          claimedDays: [...claimedDays, currentDay],
          streak: newStreak,
          lastClaim: now
        }
      })

      // Update user
      await tx.user.update({
        where: { id: userId },
        data: {
          exp: { increment: expReward },
          coins: { increment: coinReward }
        }
      })

      // Record transaction
      await tx.pointTransaction.create({
        data: {
          userId,
          eventType: 'DAILY_LOGIN_REWARD',
          deltaPoint: 0,
          deltaCoins: coinReward,
          deltaExp: expReward,
          metadata: {
            day: currentDay,
            streak: newStreak,
            year: currentYear,
            month: currentMonth
          }
        }
      })
    })

    // Calculate next claim time (tomorrow)
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    return NextResponse.json({
      success: true,
      alreadyClaimed: false,
      rewards: {
        exp: expReward,
        coins: coinReward,
        streak: newStreak
      },
      nextClaimAt: tomorrow.toISOString()
    })

  } catch (error) {
    console.error('Daily login claim error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Coin Exchange Implementation
```typescript
// src/app/api/coins/exchange/route.ts
import { auth } from '@clerk/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const EXCHANGE_RATE = 10 // 10 coins = 1 star
const DAILY_EXCHANGE_LIMIT = 100 // max 100 stars per day

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { coinAmount, targetCurrency } = body

    if (targetCurrency !== 'STARS') {
      return NextResponse.json(
        { error: 'Only STARS exchange supported' },
        { status: 400 }
      )
    }

    if (!coinAmount || coinAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid coin amount' },
        { status: 400 }
      )
    }

    if (coinAmount < EXCHANGE_RATE) {
      return NextResponse.json(
        { error: `Minimum exchange is ${EXCHANGE_RATE} coins` },
        { status: 400 }
      )
    }

    const starsToReceive = Math.floor(coinAmount / EXCHANGE_RATE)

    // Check daily limit
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayExchanges = await prisma.pointTransaction.aggregate({
      where: {
        userId,
        eventType: 'COIN_TO_STAR',
        createdAt: { gte: today }
      },
      _sum: { deltaPoint: true }
    })

    const todayStarsExchanged = todayExchanges._sum.deltaPoint || 0
    
    if (todayStarsExchanged + starsToReceive > DAILY_EXCHANGE_LIMIT) {
      return NextResponse.json(
        { error: 'Daily exchange limit exceeded' },
        { status: 429 }
      )
    }

    // Check user has enough coins
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { coins: true, stars: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.coins < coinAmount) {
      return NextResponse.json(
        { error: 'Insufficient coins' },
        { status: 400 }
      )
    }

    // Perform exchange
    const coinsToSpend = starsToReceive * EXCHANGE_RATE

    await prisma.$transaction(async (tx) => {
      // Update user balances
      await tx.user.update({
        where: { id: userId },
        data: {
          coins: { decrement: coinsToSpend },
          stars: { increment: starsToReceive }
        }
      })

      // Record transaction
      await tx.pointTransaction.create({
        data: {
          userId,
          eventType: 'COIN_TO_STAR',
          deltaPoint: starsToReceive,
          deltaCoins: -coinsToSpend,
          deltaExp: 0,
          metadata: {
            exchangeRate: EXCHANGE_RATE,
            coinsSpent: coinsToSpend,
            starsReceived: starsToReceive
          }
        }
      })
    })

    return NextResponse.json({
      success: true,
      exchanged: {
        coinsSpent: coinsToSpend,
        starsReceived: starsToReceive,
        rate: EXCHANGE_RATE
      },
      newBalances: {
        coins: user.coins - coinsToSpend,
        stars: user.stars + starsToReceive
      },
      transaction: {
        id: 'generated_id', // Will be actual transaction ID
        createdAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Coin exchange error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Referral System Implementation
```typescript
// src/app/api/referrals/status/route.ts
import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get or create referral code
    let referralCode = await prisma.referralCode.findFirst({
      where: { userId, referredBy: null }
    })

    if (!referralCode) {
      // Generate unique referral code
      const code = generateReferralCode(userId)
      referralCode = await prisma.referralCode.create({
        data: {
          userId,
          code
        }
      })
    }

    // Get referral stats
    const referredUsers = await prisma.referralCode.findMany({
      where: { referredBy: userId },
      include: {
        user: {
          select: { createdAt: true }
        }
      }
    })

    // Calculate total rewards from referrals
    const referralTransactions = await prisma.pointTransaction.findMany({
      where: {
        userId,
        eventType: 'REFERRAL_REWARD'
      }
    })

    const totalRewards = referralTransactions.reduce((acc, tx) => ({
      exp: acc.exp + tx.deltaExp,
      coins: acc.coins + tx.deltaCoins,
      stars: acc.stars + tx.deltaPoint
    }), { exp: 0, coins: 0, stars: 0 })

    const recentReferrals = referredUsers
      .slice(0, 10)
      .map(ref => ({
        id: ref.id,
        referredAt: ref.user.createdAt.toISOString(),
        rewarded: ref.isUsed,
        rewardAmount: {
          exp: 50, // Fixed reward amount
          coins: 20
        }
      }))

    const referralLink = `${process.env.NEXT_PUBLIC_APP_URL}?ref=${referralCode.code}`

    return NextResponse.json({
      success: true,
      data: {
        referralCode: referralCode.code,
        referralLink,
        stats: {
          totalReferred: referredUsers.length,
          successfulReferrals: referredUsers.filter(r => r.isUsed).length,
          totalRewards
        },
        recentReferrals
      }
    })

  } catch (error) {
    console.error('Referral status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateReferralCode(userId: string): string {
  // Generate a unique 8-character code
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const userHash = userId.slice(-4).toUpperCase()
  let code = userHash
  
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return code
}
```

### Process Referral Implementation
```typescript
// src/app/api/referrals/process/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { referralCode, newUserId } = body

    if (!referralCode || !newUserId) {
      return NextResponse.json(
        { error: 'Referral code and new user ID required' },
        { status: 400 }
      )
    }

    // Find referral code
    const referral = await prisma.referralCode.findUnique({
      where: { code: referralCode },
      include: { user: true }
    })

    if (!referral) {
      return NextResponse.json(
        { error: 'Invalid referral code' },
        { status: 404 }
      )
    }

    if (referral.userId === newUserId) {
      return NextResponse.json(
        { error: 'Cannot use own referral code' },
        { status: 400 }
      )
    }

    // Check if new user already has a referral
    const existingReferral = await prisma.referralCode.findFirst({
      where: { userId: newUserId, referredBy: { not: null } }
    })

    if (existingReferral) {
      return NextResponse.json(
        { error: 'User already referred' },
        { status: 409 }
      )
    }

    const referrerReward = { exp: 50, coins: 20 }
    const referredReward = { exp: 25, coins: 10, freeCredits: 5 }

    // Process referral
    await prisma.$transaction(async (tx) => {
      // Create referral record for new user
      await tx.referralCode.create({
        data: {
          userId: newUserId,
          code: generateReferralCode(newUserId),
          referredBy: referral.userId,
          isUsed: true,
          usedAt: new Date()
        }
      })

      // Reward referrer
      await tx.user.update({
        where: { id: referral.userId },
        data: {
          exp: { increment: referrerReward.exp },
          coins: { increment: referrerReward.coins }
        }
      })

      // Reward referred user
      await tx.user.update({
        where: { id: newUserId },
        data: {
          exp: { increment: referredReward.exp },
          coins: { increment: referredReward.coins },
          freePoint: { increment: referredReward.freeCredits }
        }
      })

      // Record transactions
      await tx.pointTransaction.createMany({
        data: [
          {
            userId: referral.userId,
            eventType: 'REFERRAL_REWARD',
            deltaPoint: 0,
            deltaCoins: referrerReward.coins,
            deltaExp: referrerReward.exp,
            metadata: { referredUserId: newUserId }
          },
          {
            userId: newUserId,
            eventType: 'REFERRAL_WELCOME',
            deltaPoint: referredReward.freeCredits,
            deltaCoins: referredReward.coins,
            deltaExp: referredReward.exp,
            metadata: { referredBy: referral.userId }
          }
        ]
      })
    })

    return NextResponse.json({
      success: true,
      referrerReward,
      referredReward
    })

  } catch (error) {
    console.error('Process referral error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## Rate Limiting

### Feature-Specific Rate Limits
```typescript
const gamificationRateLimits = {
  "/api/campaigns/daily-login/claim": {
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 1 // once per day
  },
  
  "/api/coins/exchange": {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10 // exchanges per hour
  },
  
  "/api/referrals/process": {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5 // referral processing per hour
  }
};
```

---

## Gamification Constants

### Reward Configuration
```typescript
export const GAMIFICATION_CONFIG = {
  dailyLogin: {
    baseExp: 10,
    baseCoins: 5,
    maxStreakMultiplier: 2.0,
    streakBonusRate: 0.1
  },
  
  levelSystem: {
    expPerLevel: 100,
    bonusExpPerLevel: 0.1,
    bonusCoinsPerLevel: 0.05
  },
  
  coinExchange: {
    rate: 10, // 10 coins = 1 star
    dailyLimit: 100, // max 100 stars per day
    minExchange: 10 // minimum 10 coins
  },
  
  referral: {
    referrerReward: { exp: 50, coins: 20 },
    referredReward: { exp: 25, coins: 10, freeCredits: 5 }
  }
};
```

---

## Error Handling

### Gamification-Specific Errors
```typescript
const gamificationErrorCodes = {
  DAILY_ALREADY_CLAIMED: "Daily reward already claimed",
  EXCHANGE_LIMIT_EXCEEDED: "Exchange limit exceeded",
  INSUFFICIENT_COINS: "Insufficient coins for exchange",
  INVALID_REFERRAL_CODE: "Invalid referral code",
  REFERRAL_ALREADY_USED: "Referral already used",
  LEVEL_UP_FAILED: "Level up processing failed"
};
```

---

**File Purpose**: Gamification & Advanced Features  
**Round Usage**: Round 6 (Gamification Features)  
**Dependencies**: Database Models, User System  
**Estimated Tokens**: ~2,500