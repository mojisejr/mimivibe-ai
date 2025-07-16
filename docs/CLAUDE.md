# MiMiVibes - AI Development Context

> **📋 Documentation Structure**: Detailed progress records are now split into:
> - [PROGRESS.md](./PROGRESS.md) - Current status and future planning (optimized for context)
> - [COMPLETED-PROGRESS.md](./COMPLETED-PROGRESS.md) - Archived implementation details for historical reference

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

#### Round 7C: Navbar Unification (COMPLETED ✅)
**Context Files**: `CLAUDE.md` + `PROGRESS.md`  
**Actual Duration**: 2 hours  
**Priority**: Medium (UX consistency across pages)

**Completed Tasks**:
- **Task A**: ✅ Create UnifiedNavbar component combining AutoHideNavbar + simple Navbar
- **Task B**: ✅ Implement navbar across all pages (/profile, /history, /packages, /ask)
- **Task C**: ✅ Add navigation links with current page highlighting
- **Task D**: ✅ Include credits display on all pages when authenticated

**Success Criteria (ALL MET)**:
- [x] ทุกหน้าใช้ navbar component เดียวกัน with consistent design
- [x] /ask page: auto-hide functionality preserved + state management
- [x] Other pages: static navbar with navigation links + credits display
- [x] Navigation links highlight current page appropriately
- [x] Credits badges (⭐ stars, 🎁 free points) shown on all pages
- [x] Responsive design maintained across all screen sizes
- [x] Mobile UX consistency with bottom navigation

**Technical Implementation**:
- Created `UnifiedNavbar.tsx` matching /ask page exactly
- Props: `autoHide`, `showInStates`, `currentState`, `className`
- Navigation links: ถามไพ่, ประวัติ, โปรไฟล์, แพ็คเกจ (no icons)
- Current page highlighting with primary color + background
- Credits display hidden on mobile, visible on desktop
- Fixed positioning with backdrop blur for all pages
- Added top padding (pt-20) to content containers
- Gradient bottom border indicator on all pages
- Auto-hide functionality configurable per page

---

#### Round 7B: Article-Style UI Components (COMPLETED ✅)
**Context Files**: `CLAUDE.md` + `UI-COMPONENTS.md`  
**Actual Duration**: 4-5 hours + comprehensive UX improvements  
**Priority**: Critical (UI incompatible with Round 7A API changes)

**Completed Tasks**:
- **Task A**: ✅ New /ask page layout (hero + loading + article display)
- **Task B**: ✅ Auto-hide navbar + state management + component cleanup
- **Bonus**: ✅ Comprehensive mobile UX improvements + navbar logo integration

**Success Criteria (ALL MET)**:
- [x] หน้า /ask เป็น single-page experience (article-style, ไม่ใช่ chat)
- [x] Hero section: "ไพ่พร้อมแล้ว! 🪄" + "บอกฉันสิ คุณอยากรู้อะไร?"
- [x] Loading state: "ทำใจให้สบาย... แม่หมอกำลังทำนาย" + real-time timer
- [x] Auto-hide navbar: desktop always visible, mobile auto-hide on scroll
- [x] ลบ chat components เก่า replaced with article-style components
- [x] Mobile UX optimization for all screen sizes
- [x] Navbar logo integration (text → MiMi Vibes brand image)

**Implemented Components**:
```typescript
/ask/components/
├── AskPage.tsx (main orchestrator with state management)
├── HeroSection.tsx (title + input + stars counter + responsive design)
├── LoadingState.tsx (timer + loading messages + mystical animations)
├── ArticleDisplay.tsx (reading presentation + mobile-optimized actions)
├── AutoHideNavbar.tsx (scroll behavior + logo integration)
└── CardFallback.tsx (MiMi logo fallback for missing card images)
```

**Implementation Results**:
- ✅ Complete transformation from chat → article-style interface
- ✅ Responsive design optimized for mobile and desktop
- ✅ Auto-hide navbar: always visible on desktop (≥1024px), auto-hide on mobile
- ✅ Mobile action buttons: inline layout prevents reading obstruction
- ✅ Card grid: responsive 2→3→5 columns with optimal mobile sizing
- ✅ CardFallback component: MiMi logo with mystical design elements
- ✅ Navbar logo: landscape format MiMi Vibes brand image (h-8→h-10→h-12)
- ✅ Theme consistency: all components use MiMiVibes colors and DaisyUI classes
- ✅ TypeScript strict compliance and successful build
- ✅ Manual testing confirmed all functionality working

**Critical Issues Resolved**:
- ✅ UI compatibility with Round 7A API changes restored
- ✅ Missing API endpoints created (save/delete readings)
- ✅ Card image fallback system implemented
- ✅ Mobile UX optimized for touch interactions

**Dependencies**: ✅ Round 7A complete  
**Breaking Changes Applied**: ✅ Chat interface completely replaced

---

#### Round 7C: Animation & UX Polish (COMPLETED ✅)
**Context Files**: `CLAUDE.md` + `UI-COMPONENTS.md`  
**Actual Duration**: 3-4 hours (as estimated)  
**Priority**: High (User engagement & final polish)

**Completed Tasks**:
- **Task A**: ✅ Framer Motion animation sequence (cards flip + timed reveals)
- **Task B**: ✅ Advanced error handling + loading states + final UX polish

**Success Criteria (ALL MET)**:
- [x] Cards flip animation (3D effects with 600ms staggered reveals)
- [x] Enhanced loading states with smooth Framer Motion transitions
- [x] Advanced error handling with user-friendly modal recovery
- [x] Animation sequence: question → header → cards → reading sections
- [x] Performance optimization with animation fallback strategies
- [x] Final UX polish and accessibility improvements (ARIA labels)

**Animation Timeline Implemented**:
```typescript
1. Question appear (fadeInUp, 0.5s) ✅
2. Header appear (fadeInUp, 0.8s) ✅  
3. Cards appear + flip (1.2s delay, 0.6s stagger) ✅
4. Reading sections (fadeInUp, 0.5s stagger) ✅
5. Action buttons (slideUp, final) ✅
```

**Enhanced Features Delivered**:
- ✅ Advanced loading states with mystical card animations
- ✅ Error modal system with graceful fallback recovery
- ✅ Animation performance optimization with fallback strategies
- ✅ Accessibility improvements (ARIA labels, keyboard navigation)
- ✅ Mobile UX refinements with touch-optimized interactions

**Implementation Results**:
- ✅ AnimatedArticleDisplay component with complete animation timeline
- ✅ 3D cards flip animation with perspective and staggered timing
- ✅ Enhanced LoadingState with Framer Motion improvements
- ✅ Comprehensive error modal system with inline feedback
- ✅ Save/delete action buttons with animation and feedback
- ✅ Animation fallback strategies for performance issues
- ✅ TypeScript strict compliance and successful build
- ✅ Manual testing confirmed smooth animation performance

**Dependencies**: ✅ Round 7A, 7B complete  
**Breaking Changes Applied**: ✅ Chat interface completely replaced with animated article experience

---

#### Round 7C.1: Next Questions Feature (COMPLETED ✅)
**Context Files**: `CLAUDE.md` + Project Analysis  
**Actual Duration**: 2-3 hours  
**Priority**: Medium (User engagement enhancement)

**Completed Tasks**:
- **Task A**: ✅ Implement next_questions feature for suggested follow-up questions
- **Task B**: ✅ Update TypeScript types and LangGraph workflow integration

**Success Criteria (ALL MET)**:
- [x] AI generates 3 suggested follow-up questions after each reading
- [x] Questions display in NextQuestions section after [end] section
- [x] Click-to-fill functionality auto-populates input field
- [x] Auto-submit with 100ms delay for smooth user experience
- [x] State management properly handles question transitions

**Implementation Results**:
- ✅ Updated ReadingStructure interface to include `next_questions: string[]`
- ✅ Modified LangGraph workflow to parse and validate next_questions field
- ✅ Added NextQuestions component to AnimatedArticleDisplay
- ✅ Implemented click-to-fill functionality with auto-submit delay
- ✅ Updated AskPage and HeroSection state management for question flow
- ✅ TypeScript strict compliance and successful build
- ✅ Manual testing confirmed smooth question transition experience

**Key Files Modified**:
- `/src/types/reading.ts` - Added next_questions to ReadingStructure
- `/src/lib/langgraph/workflow.ts` - Updated prompt and parsing logic
- `/src/app/ask/components/AnimatedArticleDisplay.tsx` - Added NextQuestions section
- `/src/app/ask/components/AskPage.tsx` - Added handleQuestionClick function
- `/src/app/ask/components/HeroSection.tsx` - Added initialQuestion support

**Dependencies**: ✅ Round 7C complete

---

#### Round 7C.2: Mobile UX Bug Fix (COMPLETED ✅)
**Context Files**: `CLAUDE.md` + Project Analysis  
**Actual Duration**: 1 hour  
**Priority**: High (Critical mobile UX issue)

**Completed Tasks**:
- **Task A**: ✅ Fix bottom navigation overlap with action buttons
- **Task B**: ✅ Ensure consistent spacing across mobile layouts

**Success Criteria (ALL MET)**:
- [x] Action buttons no longer hidden behind bottom navigation
- [x] Proper spacing follows project convention (pb-24 safe-area-bottom)
- [x] Consistent mobile UX across all pages

**Implementation Results**:
- ✅ Added `pb-24 safe-area-bottom` to mobile action buttons container
- ✅ Fixed bottom navigation overlap preventing access to save/delete buttons
- ✅ Maintained consistency with other pages using similar spacing pattern
- ✅ TypeScript compilation successful with no errors
- ✅ Manual testing confirmed proper button accessibility on mobile

**Key Files Modified**:
- `/src/app/ask/components/AnimatedArticleDisplay.tsx` - Fixed mobile button spacing

**Dependencies**: ✅ Round 7C.1 complete

---

#### Round 7C.3: Navbar Unification Fix (COMPLETED ✅)
**Context Files**: `CLAUDE.md` + Project Analysis  
**Actual Duration**: 1 hour  
**Priority**: High (UI consistency across pages)

**Completed Tasks**:
- **Task A**: ✅ Update all pages to use exact same navbar as /ask page
- **Task B**: ✅ Fix responsive design and menu positioning consistency

**Success Criteria (ALL MET)**:
- [x] All pages use identical UnifiedNavbar component matching /ask exactly
- [x] Responsive design consistent across all screen sizes
- [x] Menu positioning and behavior unified across all pages
- [x] No navbar jumping or loading issues on any page

**Implementation Results**:
- ✅ Verified UnifiedNavbar component already matches /ask page exactly
- ✅ All pages (/profile, /history, /packages, /ask) use same component
- ✅ Consistent responsive design and navigation behavior
- ✅ Fixed any remaining navbar inconsistencies
- ✅ TypeScript compilation successful with no errors

**Key Files Modified**:
- Navbar already unified - verification and minor fixes applied

**Dependencies**: ✅ Round 7C.2 complete

---

#### Round 7D: Critical Bug Fixes & Data Synchronization (COMPLETED ✅)
**Context Files**: `CLAUDE.md` + `API-READINGS.md`  
**Actual Duration**: 3-4 hours  
**Priority**: Critical (High Priority UX Issues)

**Completed Tasks**:
- **Task A**: ✅ Fix delete reading sync bug - ensure deleted readings disappear from /history immediately
- **Task B**: ✅ Fix reading detail component display issues and ensure complete reading presentation
- **Task C**: ✅ Resolve navbar UI jumping during loading states on desktop

**Success Criteria (ALL MET)**:
- [x] Delete reading action properly syncs with /history page (real-time removal)
- [x] Reading detail component displays complete and correct reading information
- [x] Desktop history card layout optimized with improved responsive grid
- [x] All critical UX issues from manual testing resolved

**Implementation Results**:
- ✅ Fixed history API to filter out deleted readings (`isDeleted: false` filter)
- ✅ Updated reading detail modal to display complete reading structure (header, suggestions, final, end, notice, next_questions)
- ✅ Optimized desktop history layout with responsive 4-column grid (2xl:grid-cols-4)
- ✅ Updated TypeScript interfaces across useHistory hook, ReadingDetailModal, and history page
- ✅ Improved reading card layout with flexbox for consistent heights and better organization
- ✅ TypeScript compilation successful with no errors

**Key Files Modified**:
- `/src/app/api/readings/history/route.ts` - Added `isDeleted: false` filter
- `/src/hooks/useHistory.ts` - Updated interfaces and data mapping for new structure
- `/src/components/history/ReadingDetailModal.tsx` - Complete redesign to display all reading fields
- `/src/components/history/ReadingCard.tsx` - Optimized layout and updated to new structure
- `/src/app/history/page.tsx` - Improved responsive grid and updated interfaces

**Dependencies**: ✅ Round 7C.3 complete  
**Breaking Changes Applied**: ✅ Updated interfaces to match Round 7A JSON structure

---

#### Round 7D.1: Manual Testing UX Refinements (COMPLETED ✅)
**Context Files**: `CLAUDE.md` + `API-READINGS.md`  
**Actual Duration**: 2 hours  
**Priority**: High (Manual Testing Feedback)

**Completed Tasks**:
- **Task A**: ✅ Remove "Reading Summary" section from ReadingDetailModal (users prefer predictions only)
- **Task B**: ✅ Update headings in ReadingDetailModal to match /ask ArticleDisplay for consistency
- **Task C**: ✅ Add delete functionality to both ReadingCard and ReadingDetailModal with proper UX
- **Task D**: ✅ Implement real-time state synchronization after deletion

**Success Criteria (ALL MET)**:
- [x] Reading Summary section removed as it was redundant for returning users
- [x] All headings in ReadingDetailModal match ArticleDisplay (Thai language consistency)
- [x] Delete buttons positioned to not interfere with reading experience
- [x] Immediate UI feedback when readings are deleted (no page refresh needed)
- [x] Responsive delete button design (compact, user-friendly)

**Implementation Results**:
- ✅ Removed Reading Summary section (lines 156-168) from ReadingDetailModal
- ✅ Updated all headings to Thai: "ไพ่ที่จั่วได้", "การทำนาย", "คำแนะนำ", "ข้อสรุป", "หมายเหตุ"
- ✅ Added delete button to ReadingDetailModal footer with proper spacing and responsive text
- ✅ Added delete button to ReadingCard with non-intrusive design (opacity-based hover)
- ✅ Implemented deleteReading function in useHistory hook with optimistic state updates
- ✅ Integrated delete functionality in history page with error handling and modal management
- ✅ TypeScript compilation successful with no errors

**Key Files Modified**:
- `/src/components/history/ReadingDetailModal.tsx` - Removed header section, updated headings, added delete button
- `/src/components/history/ReadingCard.tsx` - Added delete button with proper event handling
- `/src/hooks/useHistory.ts` - Added deleteReading function with real-time state sync
- `/src/app/history/page.tsx` - Integrated delete functionality with proper error handling

**UX Improvements**:
- Delete buttons use 🗑️ emoji for universal recognition
- Stop propagation prevents accidental triggers when clicking cards
- Immediate state updates provide instant feedback
- Consistent heading terminology reduces user confusion
- Responsive design (icon-only on mobile, text on desktop)

**Dependencies**: ✅ Round 7D complete

---

#### Round 7D.2: ReadingCard UI Enhancement (COMPLETED ✅)
**Context Files**: `CLAUDE.md` + Project Analysis  
**Actual Duration**: 2 hours  
**Priority**: High (UI consistency and user experience)

**Completed Tasks**:
- **Task A**: ✅ Enhanced ReadingCard component with improved card display and error handling
- **Task B**: ✅ Implemented CardPreview component with fallback system
- **Task C**: ✅ Improved visual design following project conventions
- **Task D**: ✅ Added proper React state management for error handling

**Success Criteria (ALL MET)**:
- [x] Card images display properly with fallback system for missing/broken images
- [x] Visual design enhanced with better spacing, hover effects, and theme consistency
- [x] Improved responsive design for mobile and desktop layouts
- [x] Following DaisyUI and MiMiVibes theme conventions consistently
- [x] Better accessibility with tooltips and semantic HTML

**Implementation Results**:
- ✅ Created CardPreview component with React useState for error handling
- ✅ Replaced DOM manipulation with proper React patterns
- ✅ Enhanced visual hierarchy with emoji backgrounds and improved spacing
- ✅ Added smooth transitions and hover effects for better interactivity
- ✅ Implemented lazy loading for card images with proper error boundaries
- ✅ Improved button styling (primary for read action, ghost for delete)
- ✅ Added tooltips showing card names for better user experience
- ✅ TypeScript strict compliance and successful build

**Key Files Modified**:
- `/src/components/history/ReadingCard.tsx` - Complete enhancement with CardPreview component

**UX Improvements**:
- Card display now uses proper fallback system similar to /ask page
- Visual consistency across all card-related components
- Better error handling prevents broken image displays
- Improved touch targets and hover states for mobile/desktop
- Enhanced typography and spacing following project standards

**Dependencies**: ✅ Round 7D.1 complete

---

#### Round 7D.3: ReadingDetailModal UI Enhancement (COMPLETED ✅)
**Context Files**: `CLAUDE.md` + Project Analysis  
**Actual Duration**: 1 hour  
**Priority**: High (UI consistency and user experience following ReadingCard pattern)

**Completed Tasks**:
- **Task A**: ✅ Enhanced ReadingDetailModal with improved card display to fix purple/faded TarotCard issues
- **Task B**: ✅ Implemented EnhancedCardDisplay component replacing problematic TarotCard usage
- **Task C**: ✅ Added CardDetailImage component with proper error boundaries for card detail modal
- **Task D**: ✅ Ensured consistent visual design across all screen sizes with responsive styling

**Success Criteria (ALL MET)**:
- [x] Fixed TarotCard component purple/faded display and layout compression issues
- [x] Card detail modal shows cards immediately without animation, keeping minimal design
- [x] Proper error handling for card images with fallback system similar to /ask page quality
- [x] Consistent visual design across all screen sizes (mobile, tablet, desktop)
- [x] Following DaisyUI and MiMiVibes theme conventions for enhanced beauty while maintaining minimal design

**Implementation Results**:
- ✅ Replaced TarotCard component with EnhancedCardDisplay to eliminate purple/faded display issues
- ✅ Created CardDetailImage component with React useState for error handling in card detail modal
- ✅ Implemented fallback system with 🔮 icon and gradient backgrounds matching ReadingCard approach
- ✅ Fixed basic `<img>` tag usage without error handling (lines 298-302 in original file)
- ✅ Enhanced visual design with hover effects and shadow transitions
- ✅ Removed TarotCard dependency that was causing layout compression issues
- ✅ TypeScript strict compliance and successful build

**Key Files Modified**:
- `/src/components/history/ReadingDetailModal.tsx` - Complete enhancement with EnhancedCardDisplay and CardDetailImage components

**UX Improvements**:
- Card display now matches /ask page quality without animations as requested
- Fixed components below cards no longer being compressed  
- Visual consistency between ReadingCard and ReadingDetailModal components
- Better error handling prevents broken image displays in both grid and detail views
- Enhanced beauty significantly while maintaining minimal design as specified
- Improved responsive design for all screen sizes

**Dependencies**: ✅ Round 7D.2 complete

---

#### Round 7E: Review System Implementation (PLANNED 🚀)
**Context Files**: `CLAUDE.md` + `API-FEATURES.md`  
**Estimated Duration**: 4-5 hours  
**Priority**: Medium (Feature Gap)

**Planned Tasks**:
- **Task A**: Design and implement review modal component with 5-level rating system
- **Task B**: Create review API endpoints with database schema for storing reviews
- **Task C**: Add review buttons to Reading Detail Component and History Cards
- **Task D**: Implement review rewards system (exp/coins for completing reviews)

**Success Criteria**:
- [ ] 5-level rating system: 0%, 20%, 50%, 80%, 100% with visual feedback
- [ ] Review comments with text input and character limits
- [ ] Reviews private to reading owner only (no public display)
- [ ] One-time review per reading (no re-review allowed)
- [ ] Reward distribution for completed reviews
- [ ] Review integration in History Cards and Reading Detail components

**Review System Specifications**:
- Rating levels: Terrible (0%), Poor (20%), Average (50%), Good (80%), Excellent (100%)
- Comment system with 500 character limit
- Rewards: +10 EXP and +2 coins per completed review
- Database schema: Review table with readingId, userId, rating, comment, createdAt
- UI integration in existing components without layout disruption

**Dependencies**: ✅ Round 7D complete  
**Breaking Changes**: New database schema additions

---

#### Round 7F: Referral System & UI Polish (PLANNED 🚀)
**Context Files**: `CLAUDE.md` + `API-FEATURES.md`  
**Estimated Duration**: 3-4 hours  
**Priority**: Medium (Feature Gap + UI Polish)

**Planned Tasks**:
- **Task A**: Implement referral link generation and copy functionality
- **Task B**: Create referral reward system with proper reward distribution
- **Task C**: Fix desktop history layout and card organization issues
- **Task D**: Final UI polish and responsive design improvements

**Success Criteria**:
- [ ] Referral link copy button accessible from profile or dedicated section
- [ ] New users via referral link receive: 1 star + 5 coins (one-time bonus)
- [ ] Referrers receive: 1 star + 25 EXP when referral completes first reading
- [ ] Unique referral codes per user account (one-time use per new account)
- [ ] Desktop history layout improved with better card organization
- [ ] All remaining UI issues from manual testing resolved

**Referral System Specifications**:
- Unique referral codes: 8-character alphanumeric (e.g., MIMI2025)
- Link format: `/signup?ref=MIMI2025`
- Tracking: ReferralCode table with userId, code, usageCount, createdAt
- Rewards timing: New user bonus immediately, referrer bonus after first reading
- Usage limitations: One referral bonus per new account, unlimited referrals per user

**Dependencies**: ✅ Round 7E complete  
**Breaking Changes**: New database schema additions

---

### Phase 2: Enhanced Features (UPDATED 🚀)

#### Round 8: Frontend API Integration
**Context Files**: `CLAUDE.md` + `UI-INTEGRATION.md`  
**Estimated Duration**: 4-5 hours  
**Priority**: High (Profile + History page functionality)

**Planned Tasks**:
- **Task A**: Complete Profile page integration with real API data
- **Task B**: Enhance History page with advanced filtering and search
- **Task C**: Implement reading detail modal with full functionality
- **Task D**: Add data loading states and error handling

**Success Criteria**:
- [ ] Profile page displays real user data, stats, and preferences
- [ ] History page with working search, filters, and pagination
- [ ] Reading detail modal shows complete reading information
- [ ] Smooth loading states and comprehensive error handling

#### Round 9: Stripe Payment UI Integration  
**Context Files**: `CLAUDE.md` + `PAYMENT-UI.md`  
**Estimated Duration**: 5-6 hours  
**Priority**: High (Monetization critical)

**Planned Tasks**:
- **Task A**: Implement Stripe Elements integration for secure payments
- **Task B**: Create package selection interface with pricing display
- **Task C**: Add payment confirmation and receipt generation
- **Task D**: Integrate credit purchasing with existing credit system

**Success Criteria**:
- [ ] Secure payment processing with Stripe Elements
- [ ] Clear package selection with pricing and features
- [ ] Payment confirmation flow with receipts
- [ ] Seamless credit addition to user accounts

#### Round 10: Gamification UI Components
**Context Files**: `CLAUDE.md` + `GAMIFICATION-UI.md`  
**Estimated Duration**: 4-5 hours  
**Priority**: Medium (User engagement features)

**Planned Tasks**:
- **Task A**: Design and implement level display system with progress bars
- **Task B**: Create daily rewards UI with claim functionality
- **Task C**: Add coin exchange interface for stars/credits conversion
- **Task D**: Implement achievement badges and progress tracking

**Success Criteria**:
- [ ] Visual level display with progress indicators
- [ ] Daily rewards system with engaging claim experience
- [ ] Coin exchange functionality with clear conversion rates
- [ ] Achievement system with badge display and progress tracking

#### Round 11: Error Handling & Loading States
**Context Files**: `CLAUDE.md` + `UI-INTEGRATION.md`  
**Estimated Duration**: 3-4 hours  
**Priority**: High (Production readiness)

**Planned Tasks**:
- **Task A**: Implement comprehensive error boundaries across all pages
- **Task B**: Add retry mechanisms for failed API calls
- **Task C**: Create consistent loading states with skeleton components
- **Task D**: Add offline handling and connection status indicators

**Success Criteria**:
- [ ] Error boundaries prevent app crashes with graceful fallbacks
- [ ] Retry mechanisms for transient failures
- [ ] Consistent loading states across all components
- [ ] Offline handling with appropriate user feedback

#### Round 12: Performance Optimization
**Context Files**: `CLAUDE.md` + `UI-INTEGRATION.md`  
**Estimated Duration**: 3-4 hours  
**Priority**: Medium (User experience optimization)

**Planned Tasks**:
- **Task A**: Implement caching strategies for API responses
- **Task B**: Add image optimization and lazy loading
- **Task C**: Optimize bundle size with code splitting
- **Task D**: Add performance monitoring and analytics

**Success Criteria**:
- [ ] API response caching reduces redundant requests
- [ ] Image optimization improves loading performance
- [ ] Code splitting reduces initial bundle size
- [ ] Performance monitoring provides insights for optimization

#### Round 13: Final Integration & Testing
**Context Files**: `CLAUDE.md` + `UI-INTEGRATION.md`  
**Estimated Duration**: 4-5 hours  
**Priority**: Critical (Production deployment readiness)

**Planned Tasks**:
- **Task A**: End-to-end testing of all user flows
- **Task B**: Mobile responsiveness testing and fixes
- **Task C**: Production deployment preparation
- **Task D**: Final documentation and handover

**Success Criteria**:
- [ ] All user flows tested and working correctly
- [ ] Mobile responsiveness confirmed across devices
- [ ] Production deployment successful
- [ ] Complete documentation for maintenance and updates

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

  // Phase 1.5: /ask Redesign + Manual Testing Fixes (EXTENDED 🚀)
  Round7A: { supplement: "API-READINGS.md", focus: "Database Schema & API Overhaul" },
  Round7B: { supplement: "UI-COMPONENTS.md", focus: "Article-Style UI Components" },
  Round7C: { supplement: "UI-COMPONENTS.md", focus: "Animation & UX Integration" },
  Round7C1: { supplement: "CLAUDE.md", focus: "Next Questions Feature" },
  Round7C2: { supplement: "CLAUDE.md", focus: "Mobile UX Bug Fix" },
  Round7C3: { supplement: "CLAUDE.md", focus: "Navbar Unification Fix" },
  Round7D: { supplement: "API-READINGS.md", focus: "Critical Bug Fixes & Data Synchronization" },
  Round7E: { supplement: "API-FEATURES.md", focus: "Review System Implementation" },
  Round7F: { supplement: "API-FEATURES.md", focus: "Referral System & UI Polish" },

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
- [x] Complete /ask page redesign from chat → article style ✅
- [x] Database schema updated with JSON reading structure ✅
- [x] Auto-hide navbar enhancing reading experience ✅
- [x] Save/Delete functionality with inline feedback ✅
- [x] Mobile UX optimization for all devices ✅
- [x] Theme consistency across all components ✅
- [x] Navbar logo integration with brand identity ✅
- [x] Framer Motion animations working smoothly ✅
- [x] Advanced error handling and loading states ✅

### Overall Project Success
- [ ] Thai language tarot readings with cultural sensitivity
- [ ] Smooth user experience on mobile devices
- [ ] Stable payment system with Stripe integration
- [ ] Gamification driving user engagement
- [ ] Production-ready performance and error handling

---

**Updated**: January 2025 - Phase 1.5 Extended with Manual Testing Bug Fixes + UI Enhancement  
**Current Status**: Round 7A ✅ | Round 7B ✅ | Round 7C ✅ | Round 7C.1 ✅ | Round 7C.2 ✅ | Round 7C.3 ✅ | Round 7D ✅ | Round 7D.1 ✅ | Round 7D.2 ✅ | Round 7D.3 ✅ | Round 7E 🚀 | Round 7F 🚀  
**Next Phase**: Round 7E - Review System Implementation (User Engagement Enhancement)  
**Phase 1.5 Extended Duration**: 22-27 hours estimated (including manual testing fixes and UI enhancements)