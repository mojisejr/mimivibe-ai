# MiMiVibes - AI Development Context

## 🎯 Project Overview

**MiMiVibes** เป็น AI-powered tarot reading application ที่ใช้ LangGraph + Gemini AI สำหรับการทำนายไพ่ทาโรต์ในภาษาไทย พัฒนาด้วย Next.js 14, TypeScript, และ modern web technologies

### Business Objectives
1. **Primary**: สร้าง tarot reading experience ที่น่าเชื่อถือและใช้งานง่าย
2. **Secondary**: Monetization ผ่าน credit system และ gamification
3. **Technical**: Learn modern AI integration และ full-stack development

---

## 🏗️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, DaisyUI + Tailwind CSS
- **Backend**: Node.js API routes, Supabase PostgreSQL
- **Database**: Prisma ORM, PostgreSQL
- **Authentication**: Clerk (LINE LIFF integration)
- **AI**: LangGraph workflow + Gemini 2.0 Flash
- **Payments**: Stripe integration
- **Animation**: Framer Motion
- **Deployment**: Vercel

---

## 📚 Features Required

### Phase 1: Core Features (COMPLETED ✅)
1. **Authentication**: Clerk + LINE LIFF integration ✅
2. **Database Layer**: Prisma + PostgreSQL with 78 tarot cards ✅
3. **AI Reading System**: LangGraph workflow + Gemini AI ✅
4. **Chat UI**: Real-time messaging with SSE streaming ✅
5. **Payment System**: Stripe integration + credit management ✅
6. **Gamification**: EXP system + daily rewards + referral system ✅

### Phase 1.5: Major /ask Page Redesign (NEW 🚀)
1. **Database Schema Update**: JSON reading structure + hard reset
2. **Article-Style UI**: Single-page experience replacing chat interface
3. **Animation System**: Framer Motion cards + timed reveals
4. **Enhanced UX**: Auto-hide navbar + error handling + save/delete actions

### Phase 2: Enhanced Features (PLANNED 🚀)
1. **Frontend Integration**: Profile + History pages with real APIs
2. **Payment UI**: Stripe Elements + package selection interface
3. **Gamification UI**: Level display + daily rewards + coin exchange
4. **Error Handling**: Comprehensive error boundaries + retry mechanisms
5. **Performance**: Caching + optimization + mobile improvements
6. **Final Integration**: End-to-end testing + production readiness

---

## 🔄 Round Development Plan

### Phase 1: Core Platform (COMPLETED ✅)

#### Round 1: Foundation Setup ✅
- Next.js 14 + Clerk authentication + MiMiVibes theme
- **Status**: COMPLETED ✅

#### Round 2: Database Layer ✅  
- Prisma ORM + PostgreSQL + user management APIs
- **Status**: COMPLETED ✅

#### Round 3: LangGraph Integration ✅
- AI workflow + Gemini AI + reading generation + SSE streaming
- **Status**: COMPLETED ✅

#### Round 4: Chat UI & User Experience ✅
- Gemini-style chat interface + 3D card animations + real-time messaging
- **Status**: COMPLETED ✅

#### Round 5: Payment System ✅
- Stripe integration + credit management + transaction logging
- **Status**: COMPLETED ✅

#### Round 6: Gamification Features ✅
- EXP system + daily login campaigns + coin exchange + referral system
- **Status**: COMPLETED ✅

---

### Phase 1.5: Major /ask Page Redesign (NEW 🚀)

#### Round 7A: Database Schema & API Overhaul (COMPLETED ✅)
**Context Files**: `CLAUDE.md` + `API-READINGS.md`  
**Actual Duration**: 3-4 hours  
**Priority**: Critical (Breaking changes)

**Completed Tasks**:
- **Task A**: Database schema update (JSON reading structure + hard reset) ✅
- **Task B**: LangGraph output parser + API endpoint modifications ✅

**Success Criteria (ALL MET)**:
- [x] Reading.answer เป็น JSON structure ใหม่
- [x] LangGraph returns structured output with cards_reading
- [x] API `/api/readings/ask` returns new format
- [x] Database migration completed (hard reset ยกเว้น Card table)

**Implementation Details**:
```typescript
// New Reading JSON Structure
{
  header: string,
  cards_reading: CardObject[], // Full card objects with meanings
  reading: string,
  suggestions: string[],
  final: string,
  end: string,
  notice: string
}

// API Response Format
{
  success: true,
  data: {
    readingId: string,
    question: string,
    questionAnalysis: {...},
    cards: CardObject[], // For display
    reading: NewReadingStructure,
    rewards: {...},
    createdAt: string
  }
}
```

**Implementation Results**:
- ✅ Prisma schema updated: Reading.answer String → Json type  
- ✅ Database hard reset completed with 78 tarot cards preserved
- ✅ LangGraph workflow updated to include full card objects in cards_reading
- ✅ API `/api/readings/ask` completely rewritten without SSE streaming
- ✅ New TypeScript types created in `/src/types/reading.ts`
- ✅ Reading history API updated to handle Json answer field
- ✅ Build successful with TypeScript compliance
- ⚠️ **UI Compatibility**: Chat interface requires Round 7B updates

**Dependencies**: ✅ Phase 1 complete  
**Breaking Changes**: ✅ Applied (database hard reset completed)

---

#### Round 7B: Article-Style UI Components (URGENT 🚨)
**Context Files**: `CLAUDE.md` + `UI-COMPONENTS.md`  
**Estimated Duration**: 4-5 hours  
**Priority**: Critical (UI incompatible with Round 7A API changes)

**Paired Tasks**:
- **Task A**: New /ask page layout (hero + loading + article display)
- **Task B**: Auto-hide navbar + state management + component cleanup

**Success Criteria**:
- [ ] หน้า /ask เป็น single-page experience (ไม่ใช่ chat)
- [ ] Hero section: "ไพ่พร้อมแล้ว" + "บอกฉันสิ คุณอยากรู้อะไร?"
- [ ] Loading state: "ทำใจให้สบาย... แม่หมอกำลังทำนาย" + timer
- [ ] Auto-hide navbar on scroll (Framer Motion)
- [ ] ลบ chat components เก่า (ChatContainer, ChatMessages, etc.)

**New Components**:
```typescript
/ask/
├── AskPage.tsx (main orchestrator)
├── components/
│   ├── HeroSection.tsx (title + input + stars counter)
│   ├── LoadingState.tsx (timer + loading message)
│   ├── ArticleDisplay.tsx (reading presentation)
│   ├── AutoHideNavbar.tsx (scroll behavior)
│   └── ActionButtons.tsx (save/delete/ask-again)
```

**Critical Issue**: Current chat interface expects SSE streaming (removed in Round 7A)

**Dependencies**: ✅ Round 7A complete  
**UI Changes**: Complete redesign of /ask page required for functionality

---

#### Round 7C: Animation & UX Integration (NEW 🚀)
**Context Files**: `CLAUDE.md` + `UI-COMPONENTS.md`  
**Estimated Duration**: 3-4 hours  
**Priority**: High (User engagement)

**Paired Tasks**:
- **Task A**: Framer Motion animation sequence (cards flip + timed reveals)
- **Task B**: Error handling + save/delete actions + user flow completion

**Success Criteria**:
- [ ] Cards flip animation (3s delay + staggered reveals)
- [ ] Article-style reading display (Medium.com style)
- [ ] Save/Delete buttons with inline feedback
- [ ] Error modals with retry/reset functionality
- [ ] Complete user flow: hero → loading → animation → reading → actions

**Animation Timeline**:
```typescript
1. Question appear (fadeInUp, 0.5s)
2. Header appear (fadeInUp, 0.8s)  
3. Cards appear + flip (1.2s delay, 0.6s stagger)
4. Reading sections (fadeInUp, 0.5s stagger)
5. Action buttons (slideUp, final)
```

**Error Handling**:
- API/Network errors → Modal → Reset to initial state
- Animation failures → Silent fallback → Continue to reading
- Credit insufficient → Specific modal → Buy credits action

**Dependencies**: ✅ Round 7A, 7B complete  
**UX Completion**: Full article-style experience ready

---

### Phase 2: Enhanced Features (UPDATED 🚀)

#### Round 8: Frontend API Integration
**Context Files**: `CLAUDE.md` + `UI-INTEGRATION.md`  
**Previous Round 7 → Now Round 8**

#### Round 9: Stripe Payment UI Integration  
**Context Files**: `CLAUDE.md` + `PAYMENT-UI.md`  
**Previous Round 8 → Now Round 9**

#### Round 10: Gamification UI Components
**Context Files**: `CLAUDE.md` + `GAMIFICATION-UI.md`  
**Previous Round 9 → Now Round 10**

#### Round 11: Error Handling & Loading States
**Context Files**: `CLAUDE.md` + `UI-INTEGRATION.md`  
**Previous Round 10 → Now Round 11**

#### Round 12: Performance Optimization
**Context Files**: `CLAUDE.md` + `UI-INTEGRATION.md`  
**Previous Round 11 → Now Round 12**

#### Round 13: Final Integration & Testing
**Context Files**: `CLAUDE.md` + `UI-INTEGRATION.md`  
**Previous Round 12 → Now Round 13**

---

## 🎯 Context Strategy

### Round Context Mapping (Updated)

```typescript
const roundContextMap = {
  // Phase 1: Core Platform (COMPLETED ✅)
  Round1: { supplement: "UI-SYSTEM.md", focus: "Foundation + Design System" },
  Round2: { supplement: "API-AUTH.md", focus: "Database + Authentication" },
  Round3: { supplement: "API-READINGS.md", focus: "LangGraph + AI Integration" },
  Round4: { supplement: "UI-COMPONENTS.md", focus: "Chat UI + User Experience" },
  Round5: { supplement: "API-PAYMENTS.md", focus: "Payment + Credit System" },
  Round6: { supplement: "API-FEATURES.md", focus: "Gamification + Advanced Features" },

  // Phase 1.5: /ask Redesign (NEW 🚀)
  Round7A: { supplement: "API-READINGS.md", focus: "Database Schema & API Overhaul" },
  Round7B: { supplement: "UI-COMPONENTS.md", focus: "Article-Style UI Components" },
  Round7C: { supplement: "UI-COMPONENTS.md", focus: "Animation & UX Integration" },

  // Phase 2: Enhanced Features (UPDATED 🚀)
  Round8: { supplement: "UI-INTEGRATION.md", focus: "Frontend API Integration" },
  Round9: { supplement: "PAYMENT-UI.md", focus: "Stripe Payment UI Integration" },
  Round10: { supplement: "GAMIFICATION-UI.md", focus: "Gamification UI Components" },
  Round11: { supplement: "UI-INTEGRATION.md", focus: "Error Handling & Loading States" },
  Round12: { supplement: "UI-INTEGRATION.md", focus: "Performance Optimization" },
  Round13: { supplement: "UI-INTEGRATION.md", focus: "Final Integration & Testing" },
};
```

---

## 🚀 Execution Pattern

```bash
# Phase 1.5 Execution:
claude → [CLAUDE.md + API-READINGS.md] → Round 7A → test → commit
claude → [CLAUDE.md + UI-COMPONENTS.md] → Round 7B → test → commit  
claude → [CLAUDE.md + UI-COMPONENTS.md] → Round 7C → test → commit

# Then continue to Phase 2...
```

---

## 📋 Success Criteria

### Phase 1.5 Success Metrics
- [ ] Complete /ask page redesign from chat → article style
- [x] Database schema updated with JSON reading structure ✅
- [ ] Framer Motion animations working smoothly
- [ ] Error handling comprehensive and user-friendly
- [ ] Save/Delete functionality with inline feedback
- [ ] Auto-hide navbar enhancing reading experience

### Overall Project Success
- [ ] Thai language tarot readings with cultural sensitivity
- [ ] Smooth user experience on mobile devices
- [ ] Stable payment system with Stripe integration
- [ ] Gamification driving user engagement
- [ ] Production-ready performance and error handling

---

**Updated**: January 2025 - Round 7A Complete, UI Update Required  
**Current Status**: Round 7A ✅ | Round 7B Required for UI Compatibility  
**Next Phase**: Execute Round 7B (Article-Style UI Components)  
**Total Estimated Duration**: +6-8 hours remaining for Phase 1.5