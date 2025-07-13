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