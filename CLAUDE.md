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