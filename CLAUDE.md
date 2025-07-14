# MiMiVibes - AI Development Context

## 🎯 Project Overview
[Keep existing content...]

---

## 📚 Modular Context Strategy

### Context File Architecture
```typescript
const contextArchitecture = {
  core: {
    file: "CLAUDE.md",
    purpose: "Master reference, always included",
    size: "~6,500 tokens",
    contains: ["Project overview", "Tech stack", "Business logic", "Round structure"]
  },
  
  supplements: {
    maxPerRound: 1,
    size: "~2,000-3,000 tokens each",
    totalPerRound: "~9,000 tokens (optimal for Claude)",
    
    files: {
      "UI-SYSTEM.md": "Design system, colors, typography, base components",
      "UI-COMPONENTS.md": "Chat UI, cards, complex interaction patterns", 
      "API-AUTH.md": "Authentication, user management, middleware",
      "API-READINGS.md": "LangGraph workflow, AI integration, reading system",
      "API-PAYMENTS.md": "Stripe integration, credit management, transactions",
      "API-FEATURES.md": "Gamification, daily rewards, referral system"
    }
  }
};
```

### Round-Specific Context Mapping
```typescript
const roundContextMap = {
  Round1: {
    files: ["CLAUDE.md", "UI-SYSTEM.md"],
    focus: "Foundation + Design System",
    tokens: "~9,000",
    rationale: "Need design system for theme setup and component structure"
  },
  
  Round2: {
    files: ["CLAUDE.md", "API-AUTH.md"], 
    focus: "Database + Authentication",
    tokens: "~8,500",
    rationale: "Need auth patterns and user management for database layer"
  },
  
  Round3: {
    files: ["CLAUDE.md", "API-READINGS.md"],
    focus: "LangGraph + AI Integration", 
    tokens: "~9,000",
    rationale: "Need complete AI workflow and reading generation patterns"
  },
  
  Round4: {
    files: ["CLAUDE.md", "UI-COMPONENTS.md"],
    focus: "Chat UI + User Experience",
    tokens: "~9,500", 
    rationale: "Need complex UI patterns for chat and card interactions"
  },
  
  Round5: {
    files: ["CLAUDE.md", "API-PAYMENTS.md"],
    focus: "Payment + Credit System",
    tokens: "~8,500",
    rationale: "Need Stripe integration and transaction management"
  },
  
  Round6: {
    files: ["CLAUDE.md", "API-FEATURES.md"],
    focus: "Gamification + Advanced Features", 
    tokens: "~9,000",
    rationale: "Need EXP system, campaigns, and referral logic"
  }
};
```

---

## 🔄 Optimized Round Templates

### Round Execution Pattern (Updated)
```bash
# Optimized pattern with modular context
claude → [paste CLAUDE.md + specific supplement file] → implement → test → commit → next round
```

### Round 1: Foundation Setup (COMPLETED ✅)
**Status:** ✅ **COMPLETED** - January 2025  
**Context Files:** `CLAUDE.md` + `UI-SYSTEM.md`  
**Duration:** 2-3 hours (Actual)  
**Why This Combination:** Need project overview + design system for theming and component structure

**Completed Tasks:**
- **Task A**: ✅ Next.js 14 + Clerk authentication + LINE LIFF integration
- **Task B**: ✅ DaisyUI theme + MiMiVibes colors + responsive layout

**Context Scope:** 
- From CLAUDE.md: Project overview, tech stack, business objectives
- From UI-SYSTEM.md: Color system, typography, component patterns, responsive design

**Implementation Results:**
- ✅ Next.js 14 with TypeScript and App Router
- ✅ Clerk authentication configured with real API keys
- ✅ Complete routing structure: `/ask`, `/history`, `/profile`, `/packages`
- ✅ MiMiVibes custom theme with DaisyUI
- ✅ Mobile-first responsive design with safe areas
- ✅ Base component library (Button, Card, Input variants)
- ✅ Authentication middleware for protected routes
- ✅ Manual testing confirmed working

**Dependencies:** None  
**Success Criteria:** ✅ All completed successfully  
**Commit Hash:** `cd03406` - "feat(foundation): Next.js 14 + Clerk auth + MiMiVibes theme setup"

---

### Round 2: Database Layer & Authentication APIs (COMPLETED ✅)
**Status:** ✅ **COMPLETED** - January 2025  
**Context Files:** `CLAUDE.md` + `API-AUTH.md`  
**Duration:** 3-4 hours (Actual)  
**Why This Combination:** Need auth patterns and database models for complete user management system

**Completed Tasks:**
- **Task A**: ✅ Prisma ORM + PostgreSQL + database models + card data verification
- **Task B**: ✅ User management APIs + authentication middleware + transaction system

**Context Scope:**
- From CLAUDE.md: Project overview, tech stack, business objectives
- From API-AUTH.md: Database models, API endpoints, authentication patterns, error handling

**Implementation Results:**
- ✅ Prisma ORM configured with Supabase PostgreSQL
- ✅ Comprehensive database schema (8 models: User, Card, Reading, etc.)
- ✅ 78 tarot cards verified and accessible via API
- ✅ Complete user management API suite (7 endpoints)
- ✅ Credit tracking and transaction logging system
- ✅ Enhanced authentication middleware for API protection
- ✅ Consistent error handling with proper HTTP status codes
- ✅ TypeScript strict compliance and build success
- ✅ Manual testing verified all endpoints working

**API Endpoints Implemented:**
- `GET /api/health` - Database connection health check
- `GET/PUT /api/user/profile` - User profile management
- `GET /api/user/stats` - User statistics with EXP/level calculation
- `GET /api/user/credits` - Credit balance tracking
- `GET/POST /api/credits/transactions` - Transaction history and logging
- `GET /api/cards` - Tarot card dataset access

**Dependencies:** ✅ Round 1 complete  
**Success Criteria:** ✅ All completed successfully  
**Commit Hash:** `c4d4351` - "feat(database): complete Round 2 database layer with user management APIs"

---

### Round 3: LangGraph Integration & AI Reading System (COMPLETED ✅)
**Status:** ✅ **COMPLETED** - January 2025  
**Context Files:** `CLAUDE.md` + `API-READINGS.md`  
**Duration:** 4-5 hours (Actual)  
**Why This Combination:** Need complete AI workflow and reading generation patterns for core functionality

**Completed Tasks:**
- **Task A**: ✅ LangGraph workflow + Gemini AI + question filtering + card picker algorithm
- **Task B**: ✅ Reading generation API + SSE streaming + credit deduction + rewards system

**Context Scope:**
- From CLAUDE.md: Project overview, tech stack, business objectives
- From API-READINGS.md: LangGraph workflow, AI configuration, reading endpoints, streaming patterns

**Implementation Results:**
- ✅ Complete LangGraph workflow with 4 nodes (filter → picker → analysis → agent)
- ✅ Gemini 2.0 Flash AI integration with optimized temperature (0.7)
- ✅ Intelligent question filtering for appropriate tarot queries
- ✅ Random card selection algorithm (3-5 cards, no duplicates)
- ✅ Thai language reading generation with warm, supportive tone
- ✅ SSE streaming support for real-time progress updates
- ✅ Smart credit deduction system (freePoint → stars priority)
- ✅ Rewards system (+25 EXP, +5 coins per reading)
- ✅ Reading history API with pagination and full data retrieval
- ✅ Atomic database transactions for data consistency
- ✅ Comprehensive error handling and validation
- ✅ TypeScript strict compliance and successful build

**AI Workflow Architecture:**
1. **Question Filter Node**: Validates question appropriateness and content
2. **Card Picker Node**: Randomly selects 3-5 tarot cards from 78-card dataset
3. **Question Analysis Node**: Analyzes mood, topic, and timeframe
4. **Reading Agent Node**: Generates personalized Thai tarot reading

**API Endpoints Implemented:**
- `POST /api/readings/ask` - Generate new tarot reading (with optional SSE streaming)
- `GET /api/readings/history` - Paginated reading history 
- `POST /api/readings/history` - Get specific reading by ID

**Key Features:**
- **Credit System**: Smart deduction (freePoint first, then stars)
- **Database Storage**: JSON format for complex reading data
- **Streaming Support**: Real-time progress updates in Thai
- **Thai Language**: Natural, warm tarot readings with cultural sensitivity
- **Transaction Safety**: Atomic operations preventing data inconsistency

**Dependencies:** ✅ Round 1, 2 complete  
**Success Criteria:** ✅ All completed successfully  
**Commit Hash:** `fdc0f09` - "feat(langgraph): complete Round 3 AI reading system with LangGraph workflow"

---

### Round 4: Chat UI & User Experience (COMPLETED ✅)
**Status:** ✅ **COMPLETED** - January 2025  
**Context Files:** `CLAUDE.md` + `UI-COMPONENTS.md`  
**Duration:** 4-5 hours (Actual)  
**Why This Combination:** Need complex UI patterns for chat and card interactions with real-time experience

**Completed Tasks:**
- **Task A**: ✅ Gemini-style chat interface + real-time messaging + typing indicators + SSE integration
- **Task B**: ✅ Tarot card display + 3D animations + reading result presentation + mobile optimization

**Context Scope:**
- From CLAUDE.md: Project overview, tech stack, business objectives
- From UI-COMPONENTS.md: Chat components, card displays, interaction patterns, responsive design

**Implementation Results:**
- ✅ Complete Gemini-quality chat interface with real-time messaging
- ✅ SSE streaming integration with Round 3 APIs and progress indicators
- ✅ 3D tarot card animations with flip effects and staggered reveals
- ✅ Comprehensive reading presentation with Thai language support
- ✅ Advanced typing indicators and smooth loading states
- ✅ Mobile-first responsive navigation with safe areas
- ✅ Reward modal system with animated EXP/coin displays
- ✅ Toast notification system with context provider
- ✅ Enhanced CSS animations for card reveals and transitions
- ✅ Complete user flow from question input to reading results
- ✅ TypeScript strict compliance and successful build

**Chat System Components:**
- `ChatContainer` - Main orchestrator with SSE streaming and message management
- `ChatHeader` - User avatar display with mystical branding
- `ChatMessages` - Message routing system supporting multiple message types
- `ChatInput` - Smart textarea with auto-resize and keyboard shortcuts
- `TypingIndicator` - Animated loading state with Thai progress messages

**Card Display System:**
- `TarotCard` - 3D flip animations with backface visibility and click interactions
- `TarotCardGrid` - Responsive grid with staggered reveal animations (300ms delays)
- `CardDetailModal` - Detailed card information display with keywords and meanings

**Message Types:**
- `UserMessage` - Right-aligned messages with user avatar integration
- `AssistantMessage` - Left-aligned MiMi responses with timestamp
- `CardsMessage` - Embedded card grid with automatic reveal animations
- `ReadingMessage` - Rich reading display with analysis badges and rewards

**UI Enhancement Features:**
- `BottomNavigation` - Mobile navigation with active states and safe areas
- `RewardModal` - Animated reward display with staggered entrance effects
- `Toast System` - Context-based notifications with auto-dismiss functionality
- `Mobile Optimization` - Touch-friendly interfaces with proper safe area handling

**Key Features:**
- **Real-time Experience**: SSE streaming with Thai progress messages
- **3D Animations**: Hardware-accelerated card flip effects and reveals
- **Mobile-First**: Responsive design optimized for touch interactions
- **Thai Localization**: Complete Thai language support with cultural sensitivity
- **Error Handling**: Comprehensive error states with user-friendly messaging
- **Performance**: Optimized rendering with efficient state management

**Dependencies:** ✅ Round 1, 2, 3 complete  
**Success Criteria:** ✅ All completed successfully  
**Commit Hash:** `d8fb070` - "feat(chat-ui): complete Round 4 Gemini-style chat interface with card animations"

---

### Round 5: Payment System & Credit Management (COMPLETED ✅)
**Status:** ✅ **COMPLETED** - January 2025  
**Context Files:** `CLAUDE.md` + `API-PAYMENTS.md`  
**Duration:** 4-5 hours (Actual)  
**Why This Combination:** Need Stripe integration and transaction management for complete monetization system

**Completed Tasks:**
- **Task A**: ✅ Stripe integration + payment intents + webhooks + package management
- **Task B**: ✅ Credit system + transaction logging + free trial limits + enhanced reading integration

**Context Scope:**
- From CLAUDE.md: Project overview, tech stack, business objectives
- From API-PAYMENTS.md: Stripe configuration, payment flows, credit management patterns

**Implementation Results:**
- ✅ Complete Stripe payment integration with webhook security
- ✅ Payment intent creation with package validation and metadata
- ✅ Webhook handler with signature verification and atomic transactions
- ✅ Payment confirmation endpoint with idempotency protection
- ✅ Package management system with 4 default tiers (₿99-₿599)
- ✅ Enhanced credit deduction logic (freePoint → stars priority)
- ✅ Comprehensive transaction logging with metadata support
- ✅ Free trial limits implementation (3 daily, 50 monthly)
- ✅ Credit spending endpoint for internal transaction management
- ✅ Database schema updates with proper foreign key constraints
- ✅ TypeScript strict compliance and successful build
- ✅ Manual testing verified all payment endpoints working

**Stripe Integration Architecture:**
1. **Payment Intent Creation**: Validates packages and creates secure payment intents
2. **Webhook Processing**: Handles payment success/failure with signature verification
3. **Credit Management**: Atomic transactions for credit top-ups and deductions
4. **Package System**: 4-tier pricing with Thai language support

**API Endpoints Implemented:**
- `GET /api/payments/packages` - Public package listing with pricing
- `POST /api/payments/create-intent` - Secure payment intent creation
- `POST /api/payments/confirm` - Client-side payment confirmation
- `POST /api/payments/webhook` - Stripe webhook event processing
- `POST /api/credits/spend` - Internal credit deduction system
- Enhanced `GET /api/user/credits` - Credit balance with free trial limits
- Enhanced `GET /api/credits/transactions` - Transaction history with filtering

**Database Updates:**
- **Pack Model**: Added isActive, popular, sortOrder fields for package management
- **PaymentHistory Model**: Enhanced with Stripe-specific fields (stripePaymentId, amount, currency, status, creditsAdded)
- **PointTransaction Model**: Added metadata field for rich transaction context
- **Schema Migrations**: Applied with proper foreign key relationships

**Payment Package Tiers:**
1. **Starter Pack** - ₿99 (20 Stars) - Entry level for new users
2. **Popular Pack** - ₿199 (50 Stars) - Most popular, best value
3. **Premium Pack** - ₿399 (120 Stars) - For heavy users
4. **Super Pack** - ₿599 (200 Stars) - Unlimited usage experience

**Key Features:**
- **Secure Payments**: Stripe webhook signature verification and atomic transactions
- **Credit Management**: Smart deduction logic prioritizing free points over paid stars
- **Free Trial System**: Daily (3) and monthly (50) limits with automatic reset tracking
- **Transaction Logging**: Comprehensive metadata support for audit trails
- **Package Management**: Flexible pricing tiers with Thai language support
- **Error Handling**: Robust error recovery with proper HTTP status codes

**Integration Points:**
- **Round 3 Reading System**: Enhanced with metadata-rich transaction logging
- **Authentication Middleware**: Updated to allow public access for packages and webhooks
- **Database Transactions**: Atomic operations ensuring payment consistency
- **Client Integration**: Ready for frontend payment UI implementation

**Dependencies:** ✅ Round 1, 2, 3, 4 complete  
**Success Criteria:** ✅ All completed successfully  
**Commit Hash:** `a467e85` - "feat(payments): complete Round 5 Stripe payment integration with credit management"

---

### Round 6: Gamification Features & Advanced User Engagement (COMPLETED ✅)
**Status:** ✅ **COMPLETED** - January 2025  
**Context Files:** `CLAUDE.md` + `API-FEATURES.md`  
**Duration:** 3-4 hours (Actual)  
**Why This Combination:** Need gamification patterns and user engagement systems for complete user retention strategy

**Completed Tasks:**
- **Task A**: ✅ EXP system + level progression + daily login campaigns + achievement unlocks
- **Task B**: ✅ Coin exchange system + referral system + comprehensive gamification APIs

**Context Scope:**
- From CLAUDE.md: Project overview, tech stack, business objectives
- From API-FEATURES.md: Gamification patterns, EXP systems, daily campaigns, coin exchange, referral logic

**Implementation Results:**
- ✅ Complete EXP and leveling system with exponential progression (level * 100 EXP)
- ✅ Level-based benefits and unlocks (daily bonus at 5+, exclusive content at 10+, etc.)
- ✅ Daily login campaign system with monthly tracking and streak bonuses
- ✅ Coin exchange system with configurable rates (10 coins = 1 star default)
- ✅ Comprehensive referral system with dual rewards and anti-abuse protection
- ✅ Database schema optimization with simplified gamification models
- ✅ Atomic database transactions for all gamification operations
- ✅ Enhanced PointTransaction logging with rich metadata support
- ✅ TypeScript strict compliance and successful build
- ✅ Manual testing verified all gamification endpoints working

**Gamification System Architecture:**
1. **EXP & Leveling**: Exponential progression with automatic level-up detection and rewards
2. **Daily Login Campaigns**: Monthly campaign tracking with JSON-based claimed days array
3. **Coin Exchange**: Rate-limited exchange system with daily limits and transaction logging
4. **Referral System**: Unique code generation with referral chain tracking and dual rewards

**API Endpoints Implemented:**
**Gamification Core:**
- `GET /api/gamification/levels` - User level info and progression calculation
- `POST /api/gamification/level-up` - Trigger level-up rewards with bonus EXP/coins

**Daily Login Campaigns:**
- `GET /api/campaigns/active` - Active monthly campaigns with progress tracking
- `POST /api/campaigns/daily-login/claim` - Claim daily login rewards with streak bonuses
- `GET /api/campaigns/daily-login/status` - Login streak status and monthly progress

**Coin Exchange System:**
- `GET /api/coins/exchange-rates` - Exchange rates and daily limits with usage tracking
- `POST /api/coins/exchange` - Convert coins to stars with rate limiting and validation

**Referral System:**
- `GET /api/referrals/status` - User referral code, stats, and recent referrals
- `POST /api/referrals/process` - Process new user referrals with dual reward distribution

**Database Schema Updates:**
- **DailyLoginCampaign Model**: Simplified with JSON claimed days tracking and unique constraints
- **ReferralCode Model**: Enhanced with referral chain support and anti-abuse protection
- **User Model**: Added referral relationships (referredUsers, dailyLoginCampaigns)
- **Removed Legacy Models**: Cleaned up unused ActivityBonus, DailyLoginReward, LevelConfig, UserDailyLogin
- **Schema Migrations**: Applied with optimized foreign key relationships

**Gamification Configuration:**
```typescript
const GAMIFICATION_CONFIG = {
  dailyLogin: {
    baseExp: 10, baseCoins: 5,
    maxStreakMultiplier: 2.0, streakBonusRate: 0.1
  },
  levelSystem: {
    expPerLevel: 100, bonusExpPerLevel: 0.1, bonusCoinsPerLevel: 0.05
  },
  coinExchange: {
    rate: 10, dailyLimit: 100, minExchange: 10
  },
  referral: {
    referrerReward: { exp: 50, coins: 20 },
    referredReward: { exp: 25, coins: 10, freeCredits: 5 }
  }
}
```

**Key Features:**
- **EXP System**: Exponential level progression with percentage-based bonuses and unlock rewards
- **Daily Campaigns**: Streak-based multipliers with special weekly (2x) and monthly (3x) bonuses
- **Coin Exchange**: Daily exchange limits with rate limiting and comprehensive transaction logging
- **Referral System**: Unique 8-character codes with dual rewards and comprehensive anti-abuse protection
- **Transaction Safety**: All operations use atomic database transactions for data consistency
- **Thai Language**: Localized error messages and reward descriptions for Thai users

**Integration Points:**
- **Round 3 Reading System**: Enhanced with gamification rewards (+25 EXP, +5 coins per reading)
- **Round 5 Payment System**: Integrated with coin exchange and credit management
- **Authentication Middleware**: All gamification endpoints properly protected
- **Database Transactions**: Atomic operations ensuring gamification consistency

**Dependencies:** ✅ Round 1, 2, 3, 4, 5 complete  
**Success Criteria:** ✅ All completed successfully  
**Commit Hash:** `54a32a8` - "feat(gamification): complete Round 6 gamification features with EXP system, daily login campaigns, coin exchange, and referral system"

---

## 🚀 Simplified Round Prompt Template

### New Compact Round Prompt Format
```markdown
# Round [X]: [ROUND_NAME] 

**CONTEXT**: Read `CLAUDE.md` (master reference) + `[SUPPLEMENT_FILE].md` (round-specific)

## 🎯 ROUND OBJECTIVE
[One-line objective from CLAUDE.md round mapping]

## 🛠 PAIRED TASKS  
**Task A**: [Task A description] ([specific files])
**Task B**: [Task B description] ([specific files])

## ✅ SUCCESS CRITERIA
- [ ] [Criterion 1]
- [ ] [Criterion 2] 
- [ ] [Criterion 3]

## 📋 IMPLEMENTATION NOTES
[Only critical notes specific to this round from supplement file]

---
**Execute using Paired Sub-Agent Pattern**
**Test manually after completion**
**Commit with clear message**
```

### Benefits of New Template
- **50% shorter prompts**: Focus only on current round needs
- **Clearer context**: Exactly what files to read
- **Better focus**: No irrelevant information
- **Maintained quality**: All necessary context still provided

---

## 📚 Quick Reference for Context Usage

### When to Use Each Supplement File

**UI-SYSTEM.md** - Use when:
- Setting up design foundations
- Implementing theming
- Creating base components
- Responsive layout work

**UI-COMPONENTS.md** - Use when:
- Building complex interfaces
- Chat or interactive features
- Card displays and animations
- User interaction patterns

**API-AUTH.md** - Use when:
- Database setup
- User management
- Authentication middleware
- Protected routes

**API-READINGS.md** - Use when:
- AI integration
- LangGraph workflow
- Reading generation
- SSE streaming

**API-PAYMENTS.md** - Use when:
- Stripe integration
- Credit management
- Transaction handling
- Payment flows

**API-FEATURES.md** - Use when:
- Gamification features
- Daily rewards
- Referral systems
- Advanced user engagement

---

**Context Optimization**: Reduces from 28,500 to 9,000 tokens per round  
**Maintainability**: Each file has clear, focused purpose  
**Scalability**: Easy to add new supplement files for future features