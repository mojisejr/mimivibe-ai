# Round 9.6A: Critical Data & State Issues

> **🎯 Context**: Phase A of Round 9.6 - Critical bug fixes affecting data synchronization, user experience, and error handling  
> **⏱️ Duration**: 2-3 hours  
> **🔴 Priority**: Critical (Production Quality Issues)

## 🚀 Implementation Brief

You are implementing **Round 9.6A: Critical Data & State Issues** for MiMiVibes, a Thai tarot reading application. This phase addresses 4 critical bugs discovered during manual testing that affect production quality.

### Tech Stack Context
- **Frontend**: Next.js 14, React, TypeScript, DaisyUI + Tailwind CSS
- **Backend**: Node.js API routes, PostgreSQL + Prisma ORM
- **AI**: LangGraph workflow + Multi-LLM (OpenAI GPT-4-turbo + Gemini)
- **Deployment**: Vercel (60s timeout limit)

---

## 🎯 Phase A Tasks

### **Issue #1: Delete History Real-time Sync Bug**
**Problem**: When deleting readings in /history page, ReadingCard doesn't disappear until page refresh.

**Root Cause**: Delete sync between `useHistory` and `useSearch` hooks not working properly.

**Files to Fix**:
- `/src/app/history/page.tsx` (lines 141-153)
- `/src/hooks/useHistory.ts` (deleteReading function)
- `/src/hooks/useSearch.ts` (data synchronization)

**Implementation**:
```typescript
// Fix data synchronization in useSearch when historyData updates
useEffect(() => {
  if (historyData?.readings) {
    setFilteredResults(historyData.readings);
  }
}, [historyData]);
```

---

### **Issue #2: Auto-save Without User Intent Bug**
**Problem**: Questions save to history automatically without user clicking "บันทึก" button.

**Root Cause**: `/api/readings/ask` route auto-saves reading to database (lines 120-128).

**Files to Fix**:
- `/src/app/api/readings/ask/route.ts` (remove auto-save)
- `/src/app/ask/components/AskPage.tsx` (save logic)

**Implementation**:
```typescript
// Separate reading generation from saving
// Only save when user explicitly clicks "บันทึก"
const handleSaveReading = async () => {
  await fetch(`/api/readings/${readingId}/save`, { method: 'POST' });
};
```

---

### **Issue #3: 59s Timeout Graceful Error Handling**
**Problem**: No proper error handling for Vercel 60s timeout limit.

**Root Cause**: Missing timeout detection in LangGraph workflow.

**Files to Fix**:
- `/src/lib/langgraph/workflow.ts` (add timeout handling)
- `/src/app/ask/components/AskPage.tsx` (error handling)

**Implementation**:
```typescript
// Add timeout with graceful error at 55s mark
const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('TIMEOUT')), 55000);
});

try {
  const result = await Promise.race([workflowPromise, timeoutPromise]);
} catch (error) {
  if (error.message === 'TIMEOUT') {
    return { error: 'Reading timeout - please try again (no credit deducted)' };
  }
}
```

---

### **Issue #7: Error Recovery Workflow**
**Problem**: When error occurs and user clicks "ลองใหม่อีกครั้ง", card picking may not restart.

**Root Cause**: Error recovery state may not reset workflow properly.

**Files to Fix**:
- `/src/app/ask/components/AskPage.tsx` (handleRetry function)
- `/src/lib/langgraph/workflow.ts` (workflow state reset)

**Implementation**:
```typescript
const handleRetry = () => {
  // Reset all workflow state
  setPageState("initial");
  setReadingData(null);
  setError(null);
  
  // Restart with current question
  if (currentQuestion) {
    handleQuestionSubmit(currentQuestion);
  }
};
```

---

## 🧪 Testing Requirements

### Manual Testing Checklist
- [ ] Delete reading → disappears immediately from history
- [ ] Ask question → reading NOT saved until "บันทึก" clicked
- [ ] Complex reading (>55s) → graceful timeout error
- [ ] Error → retry → full workflow restart including card picking

### Success Criteria
- [ ] Real-time delete sync working
- [ ] No auto-save without user intent
- [ ] 59s timeout with graceful error (no credit loss)
- [ ] Error recovery restarts full workflow

---

## 🔧 Implementation Notes

### Error Handling Patterns
```typescript
// Graceful error with user feedback
setError({
  message: "เกิดข้อผิดพลาด - กรุณาลองใหม่อีกครั้ง",
  canRetry: true,
  preserveCredits: true
});
```

### State Management
```typescript
// Ensure proper state sync between hooks
const [syncTrigger, setSyncTrigger] = useState(0);
useEffect(() => {
  // Force re-sync when data changes
  setSyncTrigger(prev => prev + 1);
}, [historyData]);
```

---

## 📋 File Priority Order

1. **High Priority**: `/src/app/api/readings/ask/route.ts` (Issue #2)
2. **High Priority**: `/src/hooks/useHistory.ts` + `/src/hooks/useSearch.ts` (Issue #1)
3. **Medium Priority**: `/src/lib/langgraph/workflow.ts` (Issue #3)
4. **Low Priority**: `/src/app/ask/components/AskPage.tsx` (Issue #7)

---

## 🎯 Key Constraints

- **Vercel Timeout**: 60s hard limit (detect at 55s)
- **Credit System**: No credit deduction on timeout/error
- **User Experience**: Immediate feedback, no page refresh needed
- **Backward Compatibility**: Don't break existing functionality

---

**Implementation Strategy**: Fix critical auto-save bug first, then sync issues, then timeout handling, then error recovery. Test each fix immediately to ensure no regression.

**Next Phase**: After completing Phase A, proceed to Round 9.6B (Loading States & UX Polish)