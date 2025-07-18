# Round 9.6B: Loading States & UX Polish

> **🎯 Context**: Phase B of Round 9.6 - Loading states and UX improvements to prevent UI jumping and enhance user experience  
> **⏱️ Duration**: 2-3 hours  
> **🔴 Priority**: High (UX Quality Issues)

## 🚀 Implementation Brief

You are implementing **Round 9.6B: Loading States & UX Polish** for MiMiVibes, a Thai tarot reading application. This phase addresses 3 critical UX issues that cause UI jumping and poor user experience during loading states.

### Tech Stack Context
- **Frontend**: Next.js 14, React, TypeScript, DaisyUI + Tailwind CSS
- **Backend**: Node.js API routes, PostgreSQL + Prisma ORM
- **AI**: LangGraph workflow + Multi-LLM (OpenAI GPT-4-turbo + Gemini)
- **Deployment**: Vercel (60s timeout limit)

---

## 🎯 Phase B Tasks

### **Issue #4: Navbar Loading State UI Jumping**
**Problem**: Point indicator in navbar has no loading state, causing menu to jump and affecting UX.

**Root Cause**: Credits/points load asynchronously but no skeleton/loading state shown.

**Files to Fix**:
- `/src/components/Navbar.tsx` (credits display section)
- `/src/hooks/useUser.ts` (add loading state)
- `/src/components/ui/LoadingSkeleton.tsx` (create component)

**Implementation**:
```typescript
// Add loading skeleton for credits display
const CreditsDisplay = () => {
  const { user, isLoading } = useUser();
  
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="skeleton h-8 w-16 rounded-full"></div>
        <div className="skeleton h-8 w-16 rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-2 bg-base-100/80 backdrop-blur-sm rounded-full px-4 py-2">
        <span className="text-warning">⭐</span>
        <span className="font-semibold">{user?.stars || 0}</span>
      </div>
      <div className="flex items-center space-x-2 bg-base-100/80 backdrop-blur-sm rounded-full px-4 py-2">
        <span className="text-secondary">🎁</span>
        <span className="font-semibold">{user?.freePoint || 0}</span>
      </div>
    </div>
  );
};
```

---

### **Issue #5: Credits Display Loading State in /ask Page**
**Problem**: Credits block in /ask page has no loading indicator, causing UI jumping.

**Root Cause**: Same credits component loads without skeleton state.

**Files to Fix**:
- `/src/app/ask/components/AskPage.tsx` (credits display)
- `/src/components/ui/CreditsWidget.tsx` (create reusable component)

**Implementation**:
```typescript
// Reusable credits widget with loading state
const CreditsWidget = ({ className = "" }: { className?: string }) => {
  const { user, isLoading } = useUser();
  
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center space-x-4 mb-8 ${className}`}>
        <div className="skeleton h-12 w-20 rounded-full"></div>
        <div className="skeleton h-12 w-20 rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className={`flex items-center justify-center space-x-4 mb-8 ${className}`}>
      <div className="flex items-center space-x-2 bg-base-100/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-xl border border-primary/20">
        <span className="text-warning text-xl">⭐</span>
        <span className="font-semibold text-base-content">{user?.stars || 0}</span>
      </div>
      <div className="flex items-center space-x-2 bg-base-100/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-xl border border-secondary/20">
        <span className="text-secondary text-xl">🎁</span>
        <span className="font-semibold text-base-content">{user?.freePoint || 0}</span>
      </div>
    </div>
  );
};
```

---

### **Issue #6: Enter Key Support for Question Submission**
**Problem**: User cannot press Enter in textarea to submit question, must click button.

**Root Cause**: Missing onKeyDown handler in textarea component.

**Files to Fix**:
- `/src/app/ask/components/AskPage.tsx` (textarea handler)
- `/src/components/ui/QuestionInput.tsx` (if exists)

**Implementation**:
```typescript
// Add Enter key support to textarea
const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (question.trim() && question.length >= 10) {
      handleQuestionSubmit();
    }
  }
};

// In textarea component
<textarea
  value={question}
  onChange={(e) => setQuestion(e.target.value)}
  onKeyDown={handleKeyDown}
  placeholder="เช่น: ความรักของฉันจะเป็นอย่างไรในช่วงนี้..."
  className="textarea w-full h-32 text-lg resize-none bg-transparent border-0 focus:outline-none focus:ring-0 placeholder-neutral-content/60"
  maxLength={180}
/>
```

---

## 🧪 Testing Requirements

### Manual Testing Checklist
- [ ] Navbar credits display shows skeleton during loading
- [ ] /ask page credits display shows skeleton during loading
- [ ] No UI jumping during page load
- [ ] Enter key submits question (Shift+Enter for new line)
- [ ] Loading states are visually consistent with DaisyUI theme

### Success Criteria
- [ ] All loading states prevent UI jumping
- [ ] Credits display consistent across navbar and /ask page
- [ ] Enter key functionality works as expected
- [ ] Skeleton loading states match design system

---

## 🔧 Implementation Notes

### Loading State Patterns
```typescript
// Consistent loading skeleton pattern
const LoadingSkeleton = ({ className = "" }: { className?: string }) => (
  <div className={`skeleton h-8 w-16 rounded-full ${className}`}></div>
);

// Loading state hook pattern
const useLoadingState = (isLoading: boolean, delay = 100) => {
  const [showSkeleton, setShowSkeleton] = useState(false);
  
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setShowSkeleton(true), delay);
      return () => clearTimeout(timer);
    } else {
      setShowSkeleton(false);
    }
  }, [isLoading, delay]);
  
  return showSkeleton;
};
```

### DaisyUI Skeleton Classes
```css
/* Available skeleton classes */
.skeleton {
  @apply animate-pulse bg-base-300 rounded;
}

/* Usage examples */
.skeleton.h-8.w-16.rounded-full  /* For credit numbers */
.skeleton.h-12.w-20.rounded-full /* For larger credit widgets */
```

---

## 📋 File Priority Order

1. **High Priority**: `/src/hooks/useUser.ts` (add loading state)
2. **High Priority**: `/src/components/Navbar.tsx` (navbar credits loading)
3. **Medium Priority**: `/src/app/ask/components/AskPage.tsx` (credits + Enter key)
4. **Low Priority**: `/src/components/ui/CreditsWidget.tsx` (reusable component)

---

## 🎯 Key Constraints

- **DaisyUI Theme**: Use skeleton classes from DaisyUI
- **Loading Delay**: 100ms delay before showing skeleton to prevent flashing
- **Accessibility**: Ensure keyboard navigation works with Enter key
- **Consistency**: Same loading pattern across all components

---

**Implementation Strategy**: Fix loading states first (navbar, then /ask page), then add Enter key support. Create reusable components to maintain consistency.

**Next Phase**: After completing Phase B, proceed to Round 9.6C (Feature Improvements)