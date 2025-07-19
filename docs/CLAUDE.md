# MiMiVibes - AI Development Context

> **📋 Documentation Strategy**: Optimized context for active development. Historical details moved to [COMPLETED-CLAUDE.md](./COMPLETED-CLAUDE.md) for reference.

## 🎯 Project Overview

**MiMiVibes** is an AI-powered tarot reading application using LangGraph + Multi-LLM Architecture (OpenAI GPT-4-turbo + Gemini) for Thai tarot readings. Built with Next.js 14, TypeScript, and modern web technologies.

### Current Status: 99% Complete
- **Phase 1**: Core Platform ✅ Complete
- **Phase 1.5**: /ask Redesign ✅ Complete
- **Phase 2**: Enhanced Features ✅ 9/9 Complete
- **Production**: 100% Vercel Ready

### Next Priority
**Round 11**: Error Handling & Loading States (Next development phase)

---

## 🏗️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, DaisyUI + Tailwind CSS
- **Backend**: Node.js API routes, PostgreSQL
- **Database**: Prisma ORM, PostgreSQL with 78 tarot cards
- **Authentication**: Clerk (user management)
- **AI**: LangGraph workflow + Multi-LLM (OpenAI GPT-4-turbo primary, Gemini fallback)
- **Payments**: Stripe integration with PaymentHistory tracking
- **Animation**: Framer Motion
- **Deployment**: Vercel (100% ready)

---

## 📚 Current Architecture

### Core Database Schema
```typescript
// Essential Models (Production Ready)
model User {
  id: String (Clerk ID)
  stars: Int (paid credits)
  coins: Int (gamification)
  freePoint: Int (free credits) 
  level: Int, exp: Int
  readings: Reading[]
  paymentHistory: PaymentHistory[]
}

model Reading {
  id: String
  question: String
  answer: Json // Structured: {header, cards_reading[], reading, suggestions[], final, end, notice}
  analysis: Json // {mood, topic, timeframe}
  cardIds: String[]
  expEarned: Int, coinsEarned: Int
}

model PaymentHistory {
  id: String
  stripePaymentId: String
  packId: Int
  amount: Int // THB
  status: String
  creditsAdded: Int
}
```

### AI Architecture
- **LangGraph Workflow**: 4-node state machine for tarot reading generation
- **Multi-LLM**: OpenAI GPT-4-turbo (primary) + Gemini 2.0 Flash (fallback)
- **Provider Abstraction**: Unified interface supporting multiple AI providers
- **Enhanced Parsing**: JSON recovery mechanisms for robust response handling

### API Routes (38 endpoints, 100% Vercel compatible)
```typescript
// Core Reading System
POST /api/readings/ask    // Generate reading (no auto-save)
POST /api/readings/save   // Explicit save after generation
GET /api/readings/history // Paginated history with filters

// Payment System
POST /api/payments/intent // Stripe payment intent
POST /api/payments/webhook // Stripe webhook handler
GET /api/payments/packages // Available packages
GET /api/payments/history // Payment transaction history ✅

// Payment History System  
GET /api/payments/history // Payment transaction history with filtering

// Gamification System
POST /api/achievements/claim // Achievement rewards
GET /api/achievements/progress // User progress
POST /api/user/level-check // Level progression
GET|POST /api/user/prestige // Prestige system
```

### UI/UX Components
```typescript
// Modern Article-Style Interface
/src/app/ask/components/
├── AskPage.tsx              // Main orchestrator
├── HeroSection.tsx          // Question input with credits
├── LoadingState.tsx         // Mystical loading animations
├── AnimatedArticleDisplay.tsx // Article with Framer Motion

// History & Profile Pages
/src/components/history/
├── ReadingCard.tsx          // Enhanced card display
├── ReadingDetailModal.tsx   // Full reading modal
├── SearchFilters.tsx        // Advanced filtering

// Payment History UI
/src/components/payments/
├── PaymentHistoryPage.tsx   // Main container component
├── PaymentCard.tsx          // Individual payment cards
├── PaymentFilters.tsx       // Advanced filtering
└── PaymentSummary.tsx       // Summary statistics

// Gamification UI
/src/components/exchange/
├── SwapInterface.tsx        // Uniswap-style design
└── ExchangeHeader.tsx       // Balance display

// Mobile Navigation
/src/components/layout/
└── UnifiedNavbar.tsx        // Responsive hamburger menu
```

### Current Production Status
- **Build**: ✅ Successful (100% Vercel compatible)
- **APIs**: ✅ 39 endpoints, all with dynamic exports
- **Database**: ✅ PostgreSQL schema ready
- **Payments**: ✅ Stripe integration complete
- **Gamification**: ✅ 20 achievements, prestige system, exchange
- **Mobile**: ✅ Responsive with hamburger menu
- **AI**: ✅ Multi-LLM with OpenAI primary, Gemini fallback

---

## 🚀 Current Development Focus

### ✅ Round 10.1: Payment History Implementation + Mobile UX Fixes (COMPLETED)
**Status**: ✅ **COMPLETED** - Sub-Round Development Complete + Mobile UX Refinements  
**Context**: `CLAUDE.md` + `PAYMENT-HISTORY-DESIGN.md`  
**Actual Duration**: 4-5 hours (Sub-round + UX fixes)  
**Priority**: Medium (High business value feature + Critical mobile UX)

**Completed Tasks**:
- **Task A**: ✅ Created `/api/payments/history` endpoint with filtering and pagination
- **Task B**: ✅ Built PaymentHistoryPage component following /history pattern
- **Task C**: ✅ Implemented PaymentCard component adapting ReadingCard design
- **Task D**: ✅ Added navigation integration and testing
- **Task E**: ✅ Fixed mobile side menu size and removed stars/coins display overflow
- **Task F**: ✅ Resolved PaymentCard Payment ID content overflow with proper truncation
- **Task G**: ✅ Enhanced search input layout with improved spacing and positioning
- **Task H**: ✅ Updated filters to use dynamic package data from API

**Business Value Delivered**: Self-service payment inquiries, transparent transaction records, reduced support load, optimal mobile experience

**Mobile UX Improvements**:
- **Side Menu**: Reduced width from 80vw to 72vw, removed credits display for cleaner mobile layout
- **Payment Cards**: Enhanced Payment ID display with proper overflow handling and copy functionality
- **Search Interface**: Improved spacing from magnify icon with absolute positioning for better aesthetics
- **Dynamic Filters**: Package filter now uses real-time API data instead of hardcoded values

---

## 🎯 Context Strategy

### Optimized Round Context
```typescript
const activeContextMap = {
  Round11: { supplement: "UI-INTEGRATION.md", focus: "Error Handling" },
  Round12: { supplement: "UI-INTEGRATION.md", focus: "Performance" },
  Round13: { supplement: "UI-INTEGRATION.md", focus: "Final Testing" },
};
```

**Token Strategy**: CLAUDE.md (3,500 tokens) + Supplement (2,500 tokens) = ~6,000 tokens optimal

---

## 📋 Production Readiness

### ✅ Completed Systems
- **Core Platform**: Authentication, database, AI workflow, payments
- **UI/UX**: Article-style interface, mobile responsive, animations
- **Gamification**: 20 achievements, prestige system, Uniswap exchange
- **Infrastructure**: 100% Vercel compatible, 38 API endpoints
- **Payment System**: Stripe integration, credit management
- **Mobile**: Hamburger menu, touch optimization

### 🚀 Next Actions
1. **Round 11**: Error boundaries and loading states (current priority)
2. **Round 12**: Performance optimization
3. **Deploy**: Production deployment to Vercel
4. **Monitor**: Performance and user feedback

---

**Last Updated**: January 2025 - Round 10.1 Payment History Implementation + Mobile UX Fixes Complete  
**Production Status**: 100% Deployment Ready  
**Development Context**: Historical details archived to COMPLETED-CLAUDE.md  
**Recent Fixes**: Mobile side menu optimization, Payment ID overflow resolution, enhanced search UX, dynamic package filters