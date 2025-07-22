# MiMiVibes - AI Development Context

> **📋 Documentation Strategy**: Optimized context for active development. Historical details moved to [COMPLETED-CLAUDE.md](./COMPLETED-CLAUDE.md) for reference.

## 🎯 Project Overview

**MiMiVibes** is an AI-powered tarot reading application using LangGraph + Multi-LLM Architecture (OpenAI GPT-4-turbo + Gemini) for Thai tarot readings. Built with Next.js 14, TypeScript, and modern web technologies.

### Current Status: 99% Complete
- **Phase 1**: Core Platform ✅ Complete
- **Phase 1.5**: /ask Redesign ✅ Complete
- **Phase 2**: Enhanced Features ✅ 9/9 Complete
- **Production**: 100% Vercel Ready

### Latest Achievement
**Stripe Payment System Investigation**: Webhook configuration and production readiness (COMPLETED)

### Next Priority
**Production Deployment**: Ready for live Stripe payments with webhook integration

---

## 🏗️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, DaisyUI + Tailwind CSS
- **Backend**: Node.js API routes, PostgreSQL
- **Database**: Prisma ORM, PostgreSQL with 78 tarot cards
- **Authentication**: Clerk (user management)
- **AI**: LangGraph workflow + Multi-LLM (OpenAI GPT-4-turbo primary, Gemini fallback) + Encrypted Prompt Management
- **Payments**: Stripe integration with PaymentHistory tracking and webhook configuration
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
- **Prompt Management**: Encrypted database storage with version control and CLI tools

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

// Prompt Management System (CLI)
npm run prompt:list         // List active prompts and versions
npm run prompt:update       // Update prompt content (creates new version)
npm run prompt:test         // Test full tarot reading flow
npm run prompt:analyze      // Performance analytics
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
- **Payments**: ✅ Stripe integration complete with webhook configuration
- **Webhooks**: ✅ Configured at https://mimivibe-ai.vercel.app/api/payments/webhook
- **Gamification**: ✅ 20 achievements, prestige system, exchange
- **Mobile**: ✅ Responsive with hamburger menu
- **AI**: ✅ Multi-LLM with OpenAI primary, Gemini fallback

---

## 🚀 Current Development Focus

### ✅ Stripe Payment System Investigation & Webhook Configuration (COMPLETED)
**Status**: ✅ **COMPLETED** - Production Payment System Ready  
**Context**: Comprehensive Stripe integration analysis and webhook setup  
**Actual Duration**: 2-3 hours (Systematic debugging and configuration)  
**Priority**: Critical (Production Payment System Requirements)

**Completed Tasks**:
- **Task A**: ✅ Diagnosed Stripe dashboard visibility issue (no webhook endpoints configured)
- **Task B**: ✅ Created comprehensive debug tools for Stripe connection testing
- **Task C**: ✅ Configured webhook endpoint at https://mimivibe-ai.vercel.app/api/payments/webhook
- **Task D**: ✅ Updated webhook secret in environment variables (STRIPE_WEBHOOK_SECRET)
- **Task E**: ✅ Verified Stripe account connection and payment intent creation
- **Task F**: ✅ Confirmed webhook events configuration (payment_intent.succeeded, payment_intent.payment_failed)

**Root Cause Analysis**:
- **Problem**: No activities appearing in Stripe dashboard during test mode
- **Diagnosis**: Missing webhook endpoints in Stripe Dashboard configuration
- **Solution**: Configured webhook endpoint with proper event subscriptions
- **Verification**: Debug tests confirm full integration functionality

**Technical Verification**:
- **Stripe Account**: ✅ Connected (Thailand, THB currency, test mode)
- **Payment Intents**: ✅ Creation successful (99 THB test payments)
- **Webhook Endpoint**: ✅ Configured at production URL with correct events
- **Database Integration**: ✅ Connected (9 users, 7 existing payments)
- **Environment Variables**: ✅ All keys properly configured

**Production Readiness**:
- **Payment Processing**: Ready for live transactions
- **Webhook Delivery**: Configured for real-time payment status updates
- **Dashboard Visibility**: Activities will now appear in Stripe Dashboard
- **Error Handling**: Comprehensive webhook validation and database integration
- **Security**: Webhook signature verification implemented

### ✅ Round 10.2: Prompt Management System Implementation (COMPLETED)
**Status**: ✅ **COMPLETED** - Advanced Security & Management System Complete  
**Context**: Prompt encryption, version control, and CLI management tools  
**Actual Duration**: 6-8 hours (Comprehensive security implementation)  
**Priority**: High (Security & IP Protection + Development Efficiency)

**Completed Tasks**:
- **Task A**: ✅ Implemented AES-256-GCM encryption system for secure prompt storage
- **Task B**: ✅ Created comprehensive prompt management CLI with 17 commands
- **Task C**: ✅ Built version control system with comparison and rollback capabilities
- **Task D**: ✅ Developed test framework for prompt validation and performance analytics
- **Task E**: ✅ Added database schema with encrypted storage and version history
- **Task F**: ✅ Integrated workflow to use database prompts instead of static files

**Business Value Delivered**: 
- **Security**: AES-256-GCM encryption protects valuable prompt intellectual property
- **Flexibility**: Easy prompt updates without code deployment or server restart
- **Testing**: Comprehensive test framework ensures quality before production
- **Analytics**: Performance tracking and optimization insights for data-driven improvements
- **Version Control**: Safe experimentation with rollback capabilities and A/B testing support

**Technical Implementation**:
- **PromptManager**: Core encryption/decryption with database operations
- **CLI Tool**: User-friendly command-line interface with help system and debugging
- **Test Framework**: Step-by-step validation with performance metrics
- **Database Integration**: Encrypted storage with version history and analytics
- **Security**: Environment-based encryption keys with memory safety
- **Documentation**: Complete usage guide in [PROMPT-CLI-GUIDE.md](./PROMPT-CLI-GUIDE.md)

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
  PromptManagement: { supplement: "PROMPT-CLI-GUIDE.md", focus: "Prompt Operations" },
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
1. **Production Deploy**: Ready for live Stripe payments with webhook integration
2. **Monitor**: Payment processing and webhook delivery
3. **Optimize**: Performance monitoring and user feedback
4. **Scale**: Additional payment methods and features

---

**Last Updated**: January 2025 - Stripe Payment System Investigation & Webhook Configuration Complete  
**Production Status**: 100% Ready for Live Payments  
**Development Context**: Payment system fully validated and webhook-enabled  
**Recent Achievement**: Stripe webhook configuration for dashboard visibility and real-time payment processing