# UI-COMPONENTS.md

## 🧩 Core UI Components

สำหรับ Round 4: Chat UI & Reading Flow Components (LEGACY)  
สำหรับ Round 7B: Article-Style UI Components (LEGACY)  
สำหรับ Round 7C: Animated Article-Style UI Components (LEGACY)
สำหรับ Phase 2 Round 10: Enhanced UI & UX Polish (CURRENT)

**Last Updated**: Phase 2 Round 10 - Enhanced UX with mobile optimization, loading states, and improved card displays

---

## 🎬 Animated Article-Style UI Components (Round 7C - CURRENT)

### Overview

Complete Framer Motion animation system with 3D card flips, sequential content reveals, and comprehensive UX polish for the article-style reading experience.

### Components Architecture

```typescript
/ask/components/
├── AskPage.tsx                    // Main orchestrator with AnimatedArticleDisplay
├── HeroSection.tsx                // Title + input + stars counter
├── LoadingState.tsx               // Enhanced with Framer Motion animations
├── AnimatedArticleDisplay.tsx     // Complete animation timeline orchestrator
├── AutoHideNavbar.tsx             // Scroll behavior + logo integration
└── /cards/CardFallback.tsx        // MiMi logo fallback component
```

### Animation Features

#### 🎯 Animation Timeline
```typescript
1. Question appear (fadeInUp, 0.5s)
2. Header appear (fadeInUp, 0.8s)  
3. Cards appear + flip (1.2s delay, 0.6s stagger)
4. Reading sections (fadeInUp, 0.5s stagger)
5. Action buttons (slideUp, final)
```

#### 🎪 3D Card Flip Animation
- **Perspective**: 3D transforms with backface visibility
- **Stagger**: 600ms intervals between card reveals
- **Fallback**: Graceful degradation for performance issues
- **Mobile**: Optimized for touch devices

#### 🔄 Loading State Enhancements
- **Mystical Cards**: Rotating card animations around crystal ball
- **Progress Dots**: Animated sequence indicators
- **Text Transitions**: Smooth cycling of loading messages
- **Timer Animation**: Pulsing time counter

### Core Component Implementations

#### AnimatedArticleDisplay.tsx - Animation Orchestrator

```typescript
export function AnimatedArticleDisplay({ readingData, onSave, onDelete, onAskAgain }: AnimatedArticleDisplayProps) {
  const [scope, animate] = useAnimate()
  const [animationPhase, setAnimationPhase] = useState<'question' | 'header' | 'cards' | 'reading' | 'complete'>('question')
  const [cardsRevealed, setCardsRevealed] = useState(false)

  useEffect(() => {
    const runAnimationSequence = async () => {
      // 1. Question appear (0.5s)
      await animate('.question-header', 
        { opacity: [0, 1], y: [20, 0] }, 
        { duration: 0.5, ease: "easeOut" }
      )
      
      // 2. Header appear (0.8s delay)
      await animate('.reading-header', 
        { opacity: [0, 1], y: [20, 0] }, 
        { duration: 0.5, ease: "easeOut" }
      )
      
      // 3. Cards appear + flip (1.2s delay)
      setCardsRevealed(true)
      
      // 4. Reading sections appear (staggered)
      await animate('.reading-section',
        { opacity: [0, 1], y: [15, 0] },
        { duration: 0.4, delay: stagger(0.2) }
      )
      
      // 5. Action buttons appear
      await animate('.action-buttons',
        { opacity: [0, 1], y: [20, 0] },
        { duration: 0.4 }
      )
    }

    runAnimationSequence()
  }, [animate])

  return (
    <div ref={scope}>
      {/* Animated content with timeline */}
    </div>
  )
}
```

#### AnimatedCardImage.tsx - 3D Card Flip

```typescript
function AnimatedCardImage({ src, alt, position, index, shouldAnimate }: AnimatedCardImageProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  useEffect(() => {
    if (shouldAnimate) {
      const delay = 1200 + (index * 600) // Staggered timing
      const timer = setTimeout(() => {
        setIsFlipped(true)
      }, delay)
      return () => clearTimeout(timer)
    }
  }, [shouldAnimate, index])

  return (
    <motion.div 
      className="relative perspective-1000"
      initial={shouldAnimate ? { scale: 0, rotateY: 180 } : {}}
      animate={shouldAnimate ? { scale: 1, rotateY: isFlipped ? 0 : 180 } : {}}
      transition={{ 
        duration: 0.8, 
        ease: "easeInOut",
        delay: shouldAnimate ? 1.2 + (index * 0.6) : 0
      }}
    >
      <div className="card card-mystical w-full aspect-[2/3] shadow-lg">
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      </div>
    </motion.div>
  )
}
```

### Enhanced Features

#### 🔧 Error Handling System
```typescript
// Error Modal with Animation
<AnimatePresence>
  {showError && (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="card card-mystical p-6 max-w-md bg-base-100 shadow-xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="heading-3 text-error mb-4">เกิดข้อผิดพลาด</h3>
          <p className="body-normal text-base-content mb-6">{errorMessage}</p>
          <button onClick={() => setShowError(false)} className="btn btn-primary">
            ตกลง
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

#### 🎨 Action Button Animations
```typescript
// Hover/Tap Animations
<motion.button
  onClick={handleSave}
  className="btn btn-primary"
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  aria-label="บันทึกการทำนาย"
>
  <span>💾</span>
  <span>บันทึกการทำนาย</span>
</motion.button>
```

### Performance Optimizations

#### 🚀 Animation Fallbacks
```typescript
const runAnimationSequence = async () => {
  try {
    // Animation sequence
  } catch (error) {
    console.error('Animation sequence error:', error)
    // Fallback: show all content immediately
    setAnimationPhase('complete')
    setCardsRevealed(true)
  }
}
```

#### 📱 Mobile Optimization
- **Reduced Motion**: Respects user preferences
- **Performance**: Fallback strategies for slower devices
- **Touch**: Optimized for touch interactions
- **Viewport**: Responsive animations across screen sizes

### Accessibility Features

#### ♿ ARIA Support
```typescript
<img
  src={src}
  alt={alt}
  aria-describedby={`card-${position}-description`}
  role="img"
/>
<p id={`card-${position}-description`}>
  {card.shortMeaning}
</p>
```

#### ⌨️ Keyboard Navigation
- **Focus Management**: Proper focus order during animations
- **Skip Links**: Animation skip options
- **Screen Reader**: Compatible with assistive technologies

---

## 🚀 Article-Style UI Components (Round 7B - LEGACY)

### Overview

Complete transformation from chat interface to article-style reading experience with mobile-first UX optimization.

### Components Architecture

```typescript
/ask/components/
├── AskPage.tsx              // Main orchestrator with state management
├── HeroSection.tsx          // Title + input + stars counter
├── LoadingState.tsx         // Timer + loading messages + animations
├── ArticleDisplay.tsx       // Reading presentation + mobile actions
├── AutoHideNavbar.tsx       // Scroll behavior + logo integration
└── /cards/CardFallback.tsx  // MiMi logo fallback component
```

### Core Component Implementations

#### AskPage.tsx - Main Orchestrator

```typescript
export function AskPage() {
  const [pageState, setPageState] = useState<'initial' | 'loading' | 'result'>('initial')
  const [readingData, setReadingData] = useState<ReadingResponse['data'] | null>(null)
  
  return (
    <>
      <AutoHideNavbar 
        currentState={pageState}
        showInStates={['initial', 'loading', 'result']}
      />
      
      <main className="min-h-screen">
        {pageState === 'initial' && (
          <HeroSection onSubmit={handleQuestionSubmit} isLoading={false} />
        )}
        {pageState === 'loading' && (
          <LoadingState question={currentQuestion} />
        )}
        {pageState === 'result' && readingData && (
          <ArticleDisplay
            readingData={readingData}
            onSave={handleSaveReading}
            onDelete={handleDeleteReading}
            onAskAgain={handleAskAgain}
          />
        )}
      </main>
    </>
  )
}
```

#### HeroSection.tsx - Question Input

```typescript
export function HeroSection({ onSubmit, isLoading }: HeroSectionProps) {
  return (
    <div className="page-container flex flex-col items-center justify-center px-4 py-8 pt-20 lg:pt-24 bg-gradient-to-br from-base-100 to-base-200">
      <div className="w-full max-w-2xl mx-auto text-center">
        <h1 className="heading-1 md:text-5xl text-primary mb-4">
          ไพ่พร้อมแล้ว! 🪄
        </h1>
        <p className="body-large md:text-2xl text-neutral-content mb-8 font-semibold">
          บอกฉันสิ คุณอยากรู้อะไร?
        </p>
        
        {/* Stars Counter */}
        {profileData?.credits && (
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="badge badge-warning gap-1">⭐ {profileData.credits.stars}</div>
            <div className="badge badge-secondary gap-1">🎁 {profileData.credits.freePoint}</div>
          </div>
        )}
        
        {/* Question Input Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="เช่น: ความรักของฉันจะเป็นอย่างไรในช่วงนี้..."
            className="textarea textarea-bordered w-full h-32 text-lg resize-none shadow-lg"
            maxLength={180}
          />
          <button
            type="submit"
            disabled={!question.trim() || isLoading}
            className="btn btn-mystical w-full mt-6"
          >
            เริ่มทำนาย
          </button>
        </form>
      </div>
    </div>
  )
}
```

#### AutoHideNavbar.tsx - Smart Navigation

```typescript
export function AutoHideNavbar({ showInStates, currentState }: AutoHideNavbarProps) {
  const [hidden, setHidden] = useState(false)
  const { scrollY } = useScroll()
  
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious()
    // Only hide on mobile/tablet, always show on desktop (lg screens and up)
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024
    if (!isDesktop && previous !== undefined && latest > previous && latest > 150) {
      setHidden(true)
    } else {
      setHidden(false)
    }
  })

  return (
    <motion.nav
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      className="fixed top-0 left-0 right-0 z-50 bg-base-100/90 backdrop-blur-md"
    >
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo Integration */}
          <div className="flex items-center">
            <button onClick={() => router.push('/')}>
              <img
                src="/images/logo.png"
                alt="MiMi Vibes - หมอดูไพ่ทาโรต์ AI"
                className="h-8 w-auto sm:h-10 lg:h-12 object-contain"
                style={{ 
                  maxWidth: '120px',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }}
              />
            </button>
          </div>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <button className="btn btn-ghost btn-sm text-primary">ถามไพ่</button>
            <button className="btn btn-ghost btn-sm text-base-content">ประวัติ</button>
            <button className="btn btn-ghost btn-sm text-base-content">โปรไฟล์</button>
          </div>
          
          {/* User Section */}
          <div className="flex items-center space-x-3">
            <div className="badge badge-warning gap-1">⭐ {stars}</div>
            <UserButton />
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
```

#### ArticleDisplay.tsx - Reading Presentation

```typescript
export function ArticleDisplay({ readingData, onSave, onDelete, onAskAgain }: ArticleDisplayProps) {
  return (
    <div className="page-container bg-base-200 pt-20 lg:pt-24">
      <div className="content-container">
        {/* Article Header */}
        <header className="mb-12 text-center">
          <h1 className="heading-1 md:text-4xl text-base-content mb-4">
            {readingData.reading.header}
          </h1>
          
          {/* Reading Meta Info */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
            <div className="badge badge-primary gap-2">🔮 แม่หมอมีมี่</div>
            <div className="badge badge-secondary gap-2">📅 {date}</div>
            <div className="badge badge-accent gap-2">🃏 {cardCount} ใบ</div>
          </div>
        </header>

        {/* Cards Section */}
        <section className="mb-12">
          <h2 className="heading-2 text-base-content mb-8 text-center">ไพ่ที่จั่วได้</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {readingData.cards.map((card, index) => (
              <CardImage 
                key={card.id}
                src={card.imageUrl}
                alt={card.displayName}
                position={index + 1}
              />
            ))}
          </div>
        </section>

        {/* Reading Content */}
        <article className="max-w-3xl mx-auto px-4 sm:px-6">
          <section className="card card-mystical p-6 sm:p-8 shadow-lg mb-12">
            <h2 className="heading-2 text-base-content mb-6">การทำนาย</h2>
            <div className="body-normal text-base-content leading-relaxed whitespace-pre-line">
              {readingData.reading.reading}
            </div>
          </section>
        </article>

        {/* Mobile-Optimized Action Buttons */}
        <div className="pb-8">
          {/* Desktop Actions */}
          <div className="hidden sm:block sticky bottom-8 max-w-2xl mx-auto">
            <div className="card card-mystical p-6 shadow-xl bg-base-100/95 backdrop-blur-sm">
              <div className="flex gap-4">
                <button className="btn btn-primary flex-1">💾 บันทึก</button>
                <button className="btn btn-outline btn-error flex-1">🗑️ ลบ</button>
                <button className="btn btn-accent flex-1">🔮 ถามใหม่</button>
              </div>
            </div>
          </div>

          {/* Mobile Actions - Inline Layout */}
          <div className="sm:hidden max-w-2xl mx-auto px-4">
            <div className="space-y-4">
              <button className="btn btn-accent w-full btn-lg">🔮 ถามใหม่</button>
              <div className="grid grid-cols-2 gap-3">
                <button className="btn btn-sm btn-primary btn-outline">💾 บันทึก</button>
                <button className="btn btn-sm btn-outline btn-error">🗑️ ลบ</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

#### CardFallback.tsx - Logo Fallback

```typescript
export function CardFallback({ className = "" }: CardFallbackProps) {
  return (
    <div className={`relative bg-gradient-to-br from-primary/20 to-secondary/30 rounded-lg border-2 border-primary/30 aspect-[2/3] flex items-center justify-center ${className}`}>
      {/* Mystical background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-gradient-to-br from-primary to-secondary rounded-lg">
          {/* Decorative stars */}
          <div className="absolute top-2 left-2 text-warning text-xs">✦</div>
          <div className="absolute top-4 right-3 text-warning text-xs">✧</div>
          <div className="absolute bottom-4 left-3 text-warning text-xs">✦</div>
          <div className="absolute bottom-2 right-2 text-warning text-xs">✧</div>
        </div>
      </div>
      
      {/* Logo container */}
      <div className="relative z-10 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mb-2 relative">
          <img
            src="/images/logo.png"
            alt="MiMi Vibes Logo"
            className="w-full h-full object-contain drop-shadow-lg"
          />
        </div>
        <div className="text-center">
          <div className="text-xs sm:text-sm font-semibold text-primary mb-1">MiMi Vibes</div>
          <div className="text-xs text-secondary/80">ไพ่ทาโรต์</div>
        </div>
      </div>
      
      {/* Mystical glow effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 animate-pulse"></div>
    </div>
  )
}
```

### UX Improvements Implementation

#### Mobile-First Responsive Design

```typescript
// Responsive Card Grid
const cardGridClasses = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6"

// Mobile Action Buttons (Inline Layout)
const mobileActions = `
  <div className="sm:hidden max-w-2xl mx-auto px-4">
    <div className="space-y-4">
      {/* Primary Action - Ask Again */}
      <button className="btn btn-accent w-full btn-lg">🔮 ถามใหม่</button>
      
      {/* Secondary Actions - Horizontal */}
      <div className="grid grid-cols-2 gap-3">
        <button className="btn btn-sm btn-primary btn-outline">💾 บันทึก</button>
        <button className="btn btn-sm btn-outline btn-error">🗑️ ลบ</button>
      </div>
    </div>
  </div>
`

// Desktop Action Buttons (Sticky Floating)
const desktopActions = `
  <div className="hidden sm:block sticky bottom-8 max-w-2xl mx-auto">
    <div className="card card-mystical p-6 shadow-xl bg-base-100/95 backdrop-blur-sm">
      <div className="flex gap-4">
        <button className="btn btn-primary flex-1">💾 บันทึกการทำนาย</button>
        <button className="btn btn-outline btn-error flex-1">🗑️ ลบการทำนาย</button>
        <button className="btn btn-accent flex-1">🔮 ถามใหม่</button>
      </div>
    </div>
  </div>
`
```

---

## 🔥 Phase 2 Round 10: Enhanced UI & UX Polish (CURRENT)

### Overview

Comprehensive UI/UX enhancements focusing on card display improvements, mobile optimization, loading states, and cross-page consistency.

### 🎴 Card Display System Improvements

#### Enhanced Card Presentation
- **Object Contain**: Changed from `object-cover` to `object-contain` with white backgrounds
- **Title Case Names**: Transform card names from `the_fool` → `The Fool` 
- **Clean Layout**: Removed card meanings for cleaner design
- **Consistent Display**: Unified card appearance across /ask and /history pages

```typescript
// Card Name Transformation
const displayName = card.displayName || 
  (card.name || '')
    .split('_')
    .map((word: string) => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(' ')

// Enhanced Card Image
<div className="w-full h-full object-contain bg-white">
  <img 
    src={card.imageUrl}
    alt={displayName}
    className="w-full h-full object-contain"
  />
</div>
```

#### 📱 Mobile-Optimized Card Experience

```typescript
// Desktop Cards (5 columns)
<div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-4">
  {cards.map((card, index) => (
    <div className="text-center cursor-pointer" onClick={() => openModal(card)}>
      <CardDisplay card={card} />
      <h3 className="font-semibold text-sm">{card.displayName}</h3>
    </div>
  ))}
</div>

// Mobile Cards (3 columns + Modal)
<div className="md:hidden grid grid-cols-3 gap-3 max-w-sm mx-auto">
  {cards.map((card, index) => (
    <div className="text-center cursor-pointer" onClick={() => openModal(card)}>
      <div className="w-full aspect-[2/3] rounded-lg shadow-sm">
        <img className="w-full h-full object-contain bg-white" />
      </div>
      <h3 className="text-xs font-semibold">{card.displayName}</h3>
    </div>
  ))}
</div>
```

#### 🔍 Mobile Card Detail Modal

```typescript
// Compact Mobile Modal
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
  <div className="relative w-full max-w-xs bg-base-100 rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
    {/* Close Button */}
    <button className="absolute top-3 right-3 btn btn-circle btn-ghost btn-sm">
      <X className="w-4 h-4" />
    </button>
    
    {/* Compact Card Image */}
    <div className="relative bg-white p-4">
      <div className="w-32 h-48 mx-auto">
        <img className="w-full h-full object-contain rounded-lg" />
      </div>
    </div>

    {/* Essential Info Only */}
    <div className="p-4 space-y-3">
      <h3 className="text-lg font-bold text-center">{card.displayName}</h3>
      <div>
        <h4 className="font-semibold mb-2 text-sm">Keywords</h4>
        <p className="text-sm">{card.keywords}</p>
      </div>
      <button className="btn btn-primary w-full btn-sm">ปิด</button>
    </div>
  </div>
</div>
```

### 📅 Daily Login Calendar Mobile Enhancement

#### Mobile UI Issues Fixed
- **Text Overlapping**: Resolved calendar day numbers and icons competing for space
- **Touch Accessibility**: Implemented minimum 44px touch targets for mobile
- **Responsive Spacing**: Adaptive gap spacing (1px mobile, 12px desktop)
- **Dual Layout System**: Separate optimized layouts for mobile and desktop screens

```typescript
// Mobile-Optimized Calendar Grid
<div className="grid grid-cols-7 gap-1 md:gap-3">
  {Array.from({ length: campaign.progress.total }, (_, index) => {
    const day = index + 1;
    const status = getDayStatus(day);
    
    return (
      <motion.div
        className={`
          relative rounded-lg md:rounded-xl border-2 cursor-pointer
          min-h-[44px] md:min-h-[60px] aspect-square
          transition-all duration-300
          ${getStatusColor(status)}
        `}
      >
        {/* Mobile Layout (< md screens) */}
        <div className="md:hidden absolute inset-0 flex flex-col items-center justify-center p-1">
          <div className="text-xs font-bold leading-tight">{day}</div>
          <div className="text-sm leading-none mt-0.5">{getStatusIcon(status)}</div>
          
          {/* Compact reward indicator */}
          {reward && status !== "claimed" && (
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-secondary rounded-full"></div>
          )}
        </div>

        {/* Desktop Layout (md+ screens) */}
        <div className="hidden md:flex absolute inset-0 flex-col items-center justify-center p-1">
          <div className="text-lg font-bold">{day}</div>
          <div className="text-xl">{getStatusIcon(status)}</div>
          
          {/* Full reward indicator */}
          {reward && status !== "claimed" && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-secondary rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">!</span>
            </div>
          )}
        </div>
      </motion.div>
    );
  })}
</div>
```

#### Mobile-First Header Design

```typescript
// Responsive Calendar Header
<div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-4 md:p-6">
  <div className="text-center space-y-2 md:space-y-3">
    <h2 className="text-xl md:text-2xl font-bold">📅 {campaign.title}</h2>
    <p className="text-sm md:text-base text-base-content/70">
      เข้าสู่ระบบทุกวันเพื่อรับรางวัลพิเศษ
    </p>
    
    {/* Mobile-optimized progress indicators */}
    <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4">
      <div className="px-3 py-1.5 md:px-4 md:py-2 bg-primary/10 rounded-full">
        <span className="text-xs md:text-sm text-primary font-medium">
          รับแล้ว: {campaign.progress.current}/{campaign.progress.total} วัน
        </span>
      </div>
    </div>
    
    {/* Progress bar for mobile only */}
    <div className="md:hidden w-full max-w-xs mx-auto mt-3">
      <div className="flex justify-between text-xs text-base-content/60 mb-1">
        <span>ความคืบหน้า</span>
        <span>{Math.round((campaign.progress.current / campaign.progress.total) * 100)}%</span>
      </div>
      <div className="w-full bg-base-200 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
          style={{ width: `${(campaign.progress.current / campaign.progress.total) * 100}%` }}
        ></div>
      </div>
    </div>
  </div>
</div>
```

#### Enhanced Mobile Modal

```typescript
// Mobile-First Modal Design
<motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 md:p-4">
  <motion.div className="bg-base-100 rounded-2xl p-4 md:p-6 max-w-sm w-full max-h-[90vh] overflow-y-auto">
    <div className="text-center space-y-3 md:space-y-4">
      {/* Mobile close button */}
      <div className="md:hidden flex justify-end">
        <button className="btn btn-ghost btn-sm btn-circle">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="text-3xl md:text-4xl">{getStatusIcon(getDayStatus(selectedDay))}</div>
      <h3 className="text-lg md:text-xl font-bold">วันที่ {selectedDay}</h3>
      
      {/* Mobile-first button layout */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
        <button className="btn btn-ghost flex-1 order-2 sm:order-1">ปิด</button>
        {status === "available" && (
          <button className="btn btn-primary flex-1 order-1 sm:order-2">รับรางวัล</button>
        )}
      </div>
    </div>
  </motion.div>
</motion.div>
```

### 🔄 Enhanced Loading States

#### Button Loading Indicators

```typescript
// Save Button with Loading
<button
  onClick={handleSave}
  disabled={isSaved || isSaving}
  className={`btn flex-1 ${
    isSaved ? "btn-ghost text-success" : 
    isSaving ? "btn-ghost text-neutral loading" : 
    "btn btn-ghost text-primary"
  }`}
>
  {isSaving ? (
    <>
      <span className="loading loading-spinner loading-sm"></span>
      <span>กำลังบันทึก...</span>
    </>
  ) : (
    <>
      <span>{isSaved ? "✓" : "💾"}</span>
      <span>{isSaved ? "บันทึกแล้ว" : "บันทึกการทำนาย"}</span>
    </>
  )}
</button>

// Delete Button with Loading
<button
  onClick={handleDelete}
  disabled={isDeleting}
  className={`btn flex-1 ${
    isDeleting ? "btn-ghost text-neutral loading" : "btn-ghost text-error"
  }`}
>
  {isDeleting ? (
    <>
      <span className="loading loading-spinner loading-sm"></span>
      <span>กำลังลบ...</span>
    </>
  ) : (
    <>
      <span>🗑️</span>
      <span>ลบการทำนาย</span>
    </>
  )}
</button>
```

### 🌐 Cross-Page Consistency

#### Unified History Page Experience
- **Thai Localization**: Consistent with /payments page convention
- **Card Display**: Same styling as /ask page 
- **Modal Improvements**: Fixed z-index issues and improved accessibility

```typescript
// History Page Localization
<h1 className="heading-1 mb-4">ประวัติการทำนาย</h1>
<p className="body-large text-neutral-content">
  ทบทวนการทำนายไพ่ทาโร่และข้อมูลเชิงลึกของคุณ
</p>
<p className="text-sm text-neutral-content">
  จำนวนการทำนายทั้งหมด: {total} ครั้ง
</p>
```

#### Auto-Hide Navbar Behavior

```typescript
// Desktop vs Mobile Behavior
const navbarBehavior = {
  desktop: {
    condition: "window.innerWidth >= 1024",
    behavior: "Always visible for better navigation access",
    implementation: "setHidden(false) always on desktop"
  },
  mobile: {
    condition: "window.innerWidth < 1024", 
    behavior: "Auto-hide on scroll down, show on scroll up",
    implementation: "Standard auto-hide logic with scroll detection"
  }
}

// Implementation
useMotionValueEvent(scrollY, "change", (latest) => {
  const previous = scrollY.getPrevious()
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024
  
  if (!isDesktop && previous !== undefined && latest > previous && latest > 150) {
    setHidden(true)  // Hide on mobile scroll down
  } else {
    setHidden(false) // Always show on desktop, show on mobile scroll up
  }
})
```

#### Logo Integration Strategy

```typescript
// Navbar Logo Implementation
const logoImplementation = {
  format: "Landscape MiMi Vibes brand image",
  sizes: {
    mobile: "h-8 (32px)",
    tablet: "h-10 (40px)", 
    desktop: "h-12 (48px)"
  },
  styling: {
    maxWidth: "120px",
    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
    objectFit: "contain"
  },
  fallback: "Graceful error handling",
  accessibility: "Proper alt text for screen readers"
}

// CardFallback Logo
const cardFallbackLogo = {
  purpose: "Replace missing card-back.jpg with branded fallback",
  design: "Mystical background with MiMi logo centerpiece",
  responsive: "w-12→w-16→w-20 based on screen size",
  branding: "Consistent MiMi Vibes visual identity"
}
```

---

## 📱 Mobile UX Optimization Patterns

### Action Button Layouts

```typescript
// Problem: Sticky floating buttons obstruct reading on mobile
// Solution: Inline layout that doesn't interfere with content

const mobileUXPattern = {
  primary: {
    action: "ถามใหม่",
    style: "btn btn-accent w-full btn-lg",
    prominence: "Most prominent, full width",
    purpose: "Encourage continued engagement"
  },
  secondary: {
    actions: ["บันทึก", "ลบ"],
    style: "btn btn-sm btn-outline",
    layout: "grid grid-cols-2 gap-3",
    prominence: "Smaller, less intrusive"
  }
}
```

### Responsive Card Grid

```typescript
// Progressive Enhancement Grid
const responsiveGrid = {
  mobile: "grid-cols-2",      // 2 cards per row (easier touch targets)
  tablet: "grid-cols-3",      // 3 cards per row (balanced layout)
  desktop: "grid-cols-5",     // 5 cards per row (full tarot spread)
  gaps: "gap-4 sm:gap-6",     // Responsive spacing
  maxWidth: "max-w-4xl",      // Prevent over-stretching on large screens
}
```

### Theme Consistency

```typescript
// DaisyUI Component Usage
const themeComponents = {
  cards: "card card-mystical",
  buttons: "btn btn-primary | btn btn-accent | btn btn-outline btn-error",
  alerts: "alert alert-info | alert alert-success | alert alert-warning",
  badges: "badge badge-primary | badge badge-secondary | badge badge-accent",
  shadows: "shadow-lg",
  backgrounds: "bg-gradient-to-br from-base-100 to-base-200"
}

// MiMiVibes Color Palette
const colors = {
  primary: "#629c6b",    // Green
  secondary: "#66836a",  // Sage green  
  accent: "#de5b25",     // Orange
  warning: "#ffcc00",    // Yellow
  success: "#629c6b",    // Same as primary
  error: "#de5b25"       // Same as accent
}
```

---

## 🎯 Key Implementation Results

### Performance Metrics
- ✅ **Build Success**: TypeScript strict compliance
- ✅ **Mobile Performance**: Optimized touch interactions
- ✅ **Theme Consistency**: MiMiVibes colors throughout
- ✅ **Responsive Design**: Mobile-first approach

### User Experience Improvements
- ✅ **Navigation**: Desktop always visible, mobile auto-hide
- ✅ **Reading Experience**: Inline actions don't obstruct content
- ✅ **Brand Integration**: Professional logo implementation  
- ✅ **Error Handling**: Graceful fallbacks for missing images

### Technical Achievements
- ✅ **State Management**: Clean initial/loading/result flow
- ✅ **Component Architecture**: Reusable, maintainable components
- ✅ **API Integration**: Complete save/delete functionality
- ✅ **Mobile Optimization**: Touch-friendly responsive design

---

## 📚 Legacy Chat Interface Components (DEPRECATED)

### ⚠️ DEPRECATED: Chat Interface Components

### Chat Container Layout

```typescript
// src/components/chat/ChatContainer.tsx
import { ReactNode } from "react";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";

interface ChatContainerProps {
  user: User;
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export function ChatContainer({
  user,
  messages,
  onSendMessage,
  isLoading,
}: ChatContainerProps) {
  return (
    <div className="flex flex-col h-screen bg-base-100">
      {/* Header */}
      <ChatHeader user={user} />

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <ChatWelcome onSuggestedQuestion={onSendMessage} />
        ) : (
          <ChatMessages messages={messages} />
        )}
      </main>

      {/* Input Area */}
      <ChatInput
        onSendMessage={onSendMessage}
        disabled={isLoading}
        className="sticky bottom-0 safe-area-bottom"
      />
    </div>
  );
}
```

### Chat Header Component

```typescript
// src/components/chat/ChatHeader.tsx
import { UserButton } from "@clerk/nextjs";
import { User } from "@/types";
import { Logo } from "@/components/ui/Logo";

interface ChatHeaderProps {
  user: User;
}

export function ChatHeader({ user }: ChatHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-base-100/80 backdrop-blur-md border-b border-base-300 safe-area-top">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          {/* Logo Integration */}
          <Logo size="md" showText={false} />

          <div>
            <h1 className="font-semibold text-base-content">แม่หมอมีมี่</h1>
            <p className="text-sm text-neutral-content">หมอดูไพ่ทาโรต์ AI</p>
          </div>
        </div>

        {/* User Avatar & Status */}
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-2 text-sm">
            <span className="text-primary">⭐ {user.stars}</span>
            <span className="text-accent">🪙 {user.coins}</span>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}
```

### Chat Welcome Screen

```typescript
// src/components/chat/ChatWelcome.tsx
import { Logo } from "@/components/ui/Logo";

interface ChatWelcomeProps {
  onSuggestedQuestion: (question: string) => void;
}

export function ChatWelcome({ onSuggestedQuestion }: ChatWelcomeProps) {
  const suggestedQuestions = [
    "ความรักของฉันเป็นยังไงบ้าง?",
    "งานการเงินจะดีขึ้นไหม?",
    "ฉันควรทำอะไรดีในช่วงนี้?",
    "สิ่งที่รอคอยจะมาถึงเมื่อไหร่?",
  ];

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-8">
      <div className="text-center max-w-md space-y-6">
        {/* Logo + Mimi Avatar Combination */}
        <div className="relative">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <Logo size="lg" showText={true} />
            <div className="text-2xl">✨</div>
          </div>

          <img
            src="/mimi-welcome.webp"
            alt="แม่หมอมีมี่"
            className="w-32 h-32 mx-auto rounded-full shadow-2xl"
          />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-success rounded-full border-4 border-base-100 flex items-center justify-center">
            <span className="text-xs">✨</span>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-base-content">
            สวัสดีค่ะ ฉันแม่หมอมีมี่
          </h2>
          <p className="text-neutral-content leading-relaxed">
            ถามเรื่องอะไรก็ได้ที่คุณอยากรู้ แม่หมอจะดูให้ด้วยไพ่ทาโรต์
            และให้คำแนะนำที่จะช่วยให้คุณเดินทางต่อไปได้อย่างมั่นใจ
          </p>
        </div>

        {/* Suggested Questions */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-neutral-content">
            คำถามยอดนิยม:
          </p>
          <div className="space-y-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => onSuggestedQuestion(question)}
                className="btn btn-outline btn-sm w-full text-left justify-start hover:btn-primary"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Highlight */}
        <div className="bg-base-200 rounded-lg p-4 text-sm text-neutral-content">
          <p className="flex items-center justify-center space-x-2">
            <span>🔮</span>
            <span>การดูดวงทุกครั้งจะใช้ 1 Star</span>
          </p>
        </div>
      </div>
    </div>
  );
}
```

### Chat Messages Component

```typescript
// src/components/chat/ChatMessages.tsx
import { Message } from "@/types";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

interface ChatMessagesProps {
  messages: Message[];
  isTyping?: boolean;
}

export function ChatMessages({ messages, isTyping }: ChatMessagesProps) {
  return (
    <div className="px-4 py-6 space-y-6">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {isTyping && <TypingIndicator />}
    </div>
  );
}
```

### Message Bubble Component

```typescript
// src/components/chat/MessageBubble.tsx
import { Message } from "@/types";
import { Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import { TarotCardGrid } from "../cards/TarotCardGrid";
import { ReadingContent } from "./ReadingContent";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isAI = message.role === "assistant";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-3xl">
          <div className="bg-primary text-primary-content rounded-2xl rounded-tr-md p-4">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
          <div className="flex justify-end mt-2">
            <span className="text-xs text-neutral-content">ส่งแล้ว</span>
          </div>
        </div>
      </div>
    );
  }

  if (isAI) {
    return (
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <img
            src="/mimi-avatar.webp"
            alt="แม่หมอมีมี่"
            className="w-8 h-8 rounded-full"
          />
        </div>

        <div className="flex-1 max-w-3xl space-y-4">
          {/* Text Content */}
          <div className="bg-base-200 rounded-2xl rounded-tl-md p-4">
            {message.type === "reading" ? (
              <ReadingContent content={message.content} />
            ) : (
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            )}
          </div>

          {/* Cards Display */}
          {message.cards && message.cards.length > 0 && (
            <TarotCardGrid cards={message.cards} />
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-neutral-content">เมื่อกี้นี้</span>
            <button className="btn btn-ghost btn-xs" title="คัดลอก">
              <Copy className="w-3 h-3" />
            </button>
            <button className="btn btn-ghost btn-xs" title="ถูกต้อง">
              <ThumbsUp className="w-3 h-3" />
            </button>
            <button className="btn btn-ghost btn-xs" title="ไม่ถูกต้อง">
              <ThumbsDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
```

### Typing Indicator

```typescript
// src/components/chat/TypingIndicator.tsx
export function TypingIndicator() {
  return (
    <div className="flex items-start space-x-3">
      <img
        src="/mimi-avatar.webp"
        alt="แม่หมอมีมี่"
        className="w-8 h-8 rounded-full"
      />
      <div className="bg-base-200 rounded-2xl rounded-tl-md p-4">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-neutral rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-neutral rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-neutral rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
```

### Chat Input Component

```typescript
// src/components/chat/ChatInput.tsx
import { useState } from "react";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder = "ถามคำถามเกี่ยวกับชีวิต ความรัก การงาน หรือสิ่งที่คุณสงสัย...",
  className = "",
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div
      className={`bg-base-100/80 backdrop-blur-md border-t border-base-300 p-4 ${className}`}
    >
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="textarea textarea-bordered w-full resize-none min-h-[3rem] max-h-32 pr-12 text-base"
              rows={1}
              style={{
                height: "auto",
                minHeight: "3rem",
              }}
            />
            <button
              type="submit"
              disabled={!message.trim() || disabled}
              className="absolute right-2 bottom-2 btn btn-circle btn-sm btn-primary disabled:btn-disabled"
            >
              {disabled ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Character Counter */}
        <div className="flex justify-between items-center mt-2 text-xs text-neutral-content">
          <span>กด Enter เพื่อส่ง, Shift+Enter เพื่อขึ้นบรรทัดใหม่</span>
          <span className={message.length > 450 ? "text-warning" : ""}>
            {message.length}/500
          </span>
        </div>
      </form>
    </div>
  );
}
```

---

## Tarot Card Components

### Tarot Card Grid

```typescript
// src/components/cards/TarotCardGrid.tsx
import { Card } from "@/types";
import { TarotCard } from "./TarotCard";

interface TarotCardGridProps {
  cards: Card[];
  revealed?: boolean;
  onCardClick?: (card: Card) => void;
}

export function TarotCardGrid({
  cards,
  revealed = true,
  onCardClick,
}: TarotCardGridProps) {
  const gridClass =
    cards.length === 3
      ? "grid grid-cols-3 gap-4 justify-items-center max-w-sm mx-auto"
      : "grid grid-cols-5 gap-2 md:gap-4 justify-items-center max-w-2xl mx-auto";

  return (
    <div className="py-6">
      <div className={gridClass}>
        {cards.map((card, index) => (
          <TarotCard
            key={card.id}
            card={card}
            position={index + 1}
            revealed={revealed}
            onClick={() => onCardClick?.(card)}
            delay={index * 200}
          />
        ))}
      </div>
    </div>
  );
}
```

### Individual Tarot Card

```typescript
// src/components/cards/TarotCard.tsx
import { useState, useEffect } from "react";
import { Card } from "@/types";

interface TarotCardProps {
  card: Card;
  position: number;
  revealed?: boolean;
  onClick?: () => void;
  delay?: number;
}

export function TarotCard({
  card,
  position,
  revealed = false,
  onClick,
  delay = 0,
}: TarotCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      if (revealed) {
        setTimeout(() => setIsRevealed(true), 300);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, revealed]);

  const handleClick = () => {
    if (!isRevealed && revealed) {
      setIsRevealed(true);
    }
    onClick?.();
  };

  return (
    <div
      className={`group perspective-1000 transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div
        className={`
          relative w-24 h-36 md:w-32 md:h-48 transform-style-preserve-3d transition-transform duration-700 cursor-pointer
          ${isRevealed ? "rotate-y-180" : ""}
          hover:scale-105
        `}
        onClick={handleClick}
      >
        {/* Card Back */}
        <div className="absolute inset-0 w-full h-full backface-hidden">
          <div className="w-full h-full bg-gradient-to-br from-primary to-secondary rounded-lg border-2 border-primary/20 shadow-lg">
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-white">
                <div className="text-2xl mb-2">✨</div>
                <div className="text-xs font-medium">#{position}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Card Front */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
          <div className="w-full h-full bg-white rounded-lg border-2 border-base-300 shadow-lg overflow-hidden">
            <img
              src={card.imageUrl}
              alt={card.displayName}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
              <p className="text-white text-xs font-medium text-center truncate">
                {card.displayName}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Card Position Label */}
      <div className="text-center mt-2">
        <span className="text-xs text-neutral-content">
          ตำแหน่งที่ {position}
        </span>
      </div>
    </div>
  );
}
```

### Card Detail Modal

```typescript
// src/components/cards/CardDetailModal.tsx
import { Card } from "@/types";
import { X } from "lucide-react";

interface CardDetailModalProps {
  card: Card;
  position: number;
  isOpen: boolean;
  onClose: () => void;
}

export function CardDetailModal({
  card,
  position,
  isOpen,
  onClose,
}: CardDetailModalProps) {
  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <form method="dialog">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </form>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Card Image */}
          <div className="flex justify-center">
            <div className="w-48 h-72 bg-white rounded-lg shadow-lg overflow-hidden">
              <img
                src={card.imageUrl}
                alt={card.displayName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Card Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-base-content">
                {card.displayName}
              </h3>
              <p className="text-sm text-neutral-content">
                {card.arcana} • ตำแหน่งที่ {position}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-base-content mb-2">
                ความหมายโดยย่อ
              </h4>
              <p className="text-sm text-base-content leading-relaxed">
                {card.shortMeaning}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-base-content mb-2">
                ความหมายละเอียด
              </h4>
              <p className="text-sm text-base-content leading-relaxed">
                {card.longMeaning}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-base-content mb-2">คำสำคัญ</h4>
              <div className="flex flex-wrap gap-2">
                {card.keywords.split(",").map((keyword, index) => (
                  <span key={index} className="badge badge-primary badge-sm">
                    {keyword.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}
```

---

## Reading Content Components

### Reading Content Display

```typescript
// src/components/chat/ReadingContent.tsx
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ReadingContentProps {
  content: string; // JSON string from AI
}

export function ReadingContent({ content }: ReadingContentProps) {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    suggestions: false,
    final: false,
  });

  let reading;
  try {
    reading = JSON.parse(content);
  } catch {
    return <p className="text-error">ไม่สามารถแสดงผลคำทำนายได้</p>;
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {reading.header && (
        <div className="prose prose-sm max-w-none">
          <p className="text-base leading-relaxed">{reading.header}</p>
        </div>
      )}

      {/* Main Reading */}
      {reading.reading && (
        <div className="bg-primary/5 border-l-4 border-primary rounded-r-lg p-4">
          <h4 className="font-semibold text-primary mb-3">🔮 คำทำนาย</h4>
          <div className="prose prose-sm max-w-none">
            <p className="text-base-content leading-relaxed whitespace-pre-line">
              {reading.reading}
            </p>
          </div>
        </div>
      )}

      {/* Suggestions */}
      {reading.suggestions && reading.suggestions.length > 0 && (
        <div className="bg-accent/5 border-l-4 border-accent rounded-r-lg p-4">
          <button
            onClick={() => toggleSection("suggestions")}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-semibold text-accent">💡 คำแนะนำ</h4>
            {expandedSections.suggestions ? (
              <ChevronUp className="w-4 h-4 text-accent" />
            ) : (
              <ChevronDown className="w-4 h-4 text-accent" />
            )}
          </button>

          {expandedSections.suggestions && (
            <div className="mt-3 space-y-2">
              {reading.suggestions.map((suggestion: string, index: number) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="text-accent text-sm mt-1">•</span>
                  <p className="text-sm text-base-content leading-relaxed">
                    {suggestion}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Final Message */}
      {reading.final && reading.final.length > 0 && (
        <div className="bg-success/5 border-l-4 border-success rounded-r-lg p-4">
          <button
            onClick={() => toggleSection("final")}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-semibold text-success">✨ ข้อความสำคัญ</h4>
            {expandedSections.final ? (
              <ChevronUp className="w-4 h-4 text-success" />
            ) : (
              <ChevronDown className="w-4 h-4 text-success" />
            )}
          </button>

          {expandedSections.final && (
            <div className="mt-3 space-y-2">
              {reading.final.map((finalMsg: string, index: number) => (
                <p
                  key={index}
                  className="text-sm text-base-content leading-relaxed"
                >
                  {finalMsg}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* End Message */}
      {reading.end && (
        <div className="prose prose-sm max-w-none">
          <p className="text-base text-neutral-content leading-relaxed italic">
            {reading.end}
          </p>
        </div>
      )}

      {/* Notice */}
      {reading.notice && (
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
          <p className="text-xs text-warning-content leading-relaxed">
            ⚠️ {reading.notice}
          </p>
        </div>
      )}
    </div>
  );
}
```

---

## Navigation Components

### Mobile Bottom Navigation

```typescript
// src/components/navigation/BottomNavigation.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, History, User, CreditCard } from "lucide-react";

export function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/ask", label: "ถามดวง", icon: MessageCircle },
    { href: "/history", label: "ประวัติ", icon: History },
    { href: "/packages", label: "เติมเครดิต", icon: CreditCard },
    { href: "/profile", label: "โปรไฟล์", icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-base-100/95 backdrop-blur-md border-t border-base-300 z-50 safe-area-bottom">
      <div className="flex">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-2 px-1 transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-neutral-content hover:text-primary"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs mt-1 truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
```

### Desktop Sidebar Navigation

```typescript
// src/components/navigation/Sidebar.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageCircle,
  History,
  User,
  CreditCard,
  Settings,
  LogOut,
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";

export function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useClerk();

  const navItems = [
    { href: "/ask", label: "ถามดวง", icon: MessageCircle },
    { href: "/history", label: "ประวัติคำทำนาย", icon: History },
    { href: "/packages", label: "เติมเครดิต", icon: CreditCard },
    { href: "/profile", label: "โปรไฟล์", icon: User },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-base-200 border-r border-base-300 h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-base-300">
        <Link href="/" className="flex items-center space-x-3">
          <img src="/mimi-logo.webp" alt="MiMiVibes" className="w-10 h-10" />
          <h1 className="text-xl font-bold text-primary">MiMiVibes</h1>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-primary-content"
                      : "text-base-content hover:bg-base-300"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-base-300">
        <ul className="space-y-2">
          <li>
            <Link
              href="/settings"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base-content hover:bg-base-300 transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>ตั้งค่า</span>
            </Link>
          </li>
          <li>
            <button
              onClick={() => signOut()}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base-content hover:bg-base-300 transition-colors w-full text-left"
            >
              <LogOut className="w-5 h-5" />
              <span>ออกจากระบบ</span>
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
}
```

---

## Modal Components

### Reward Modal

```typescript
// src/components/modals/RewardModal.tsx
import { Gift, Star, Coins } from "lucide-react";

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewards: {
    exp: number;
    coins: number;
    stars?: number;
  };
  title?: string;
  description?: string;
}

export function RewardModal({
  isOpen,
  onClose,
  rewards,
  title = "ยินดีด้วย!",
  description = "คุณได้รับรางวัล:",
}: RewardModalProps) {
  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box text-center max-w-md">
        {/* Icon */}
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mb-4 animate-bounce">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-base-content">{title}</h3>
        </div>

        {/* Description */}
        <p className="text-neutral-content mb-6">{description}</p>

        {/* Rewards */}
        <div className="flex justify-center space-x-4 mb-8">
          {rewards.exp > 0 && (
            <div className="bg-primary/10 rounded-lg p-4">
              <div className="text-2xl mb-1">⚡</div>
              <p className="text-lg font-bold text-primary">
                +{rewards.exp} EXP
              </p>
              <p className="text-xs text-neutral-content">ประสบการณ์</p>
            </div>
          )}

          {rewards.coins > 0 && (
            <div className="bg-accent/10 rounded-lg p-4">
              <Coins className="w-6 h-6 mx-auto mb-1 text-accent" />
              <p className="text-lg font-bold text-accent">
                +{rewards.coins} Coins
              </p>
              <p className="text-xs text-neutral-content">เหรียญ</p>
            </div>
          )}

          {rewards.stars && rewards.stars > 0 && (
            <div className="bg-warning/10 rounded-lg p-4">
              <Star className="w-6 h-6 mx-auto mb-1 text-warning" />
              <p className="text-lg font-bold text-warning">
                +{rewards.stars} Stars
              </p>
              <p className="text-xs text-neutral-content">ดวงดาว</p>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button className="btn btn-primary btn-wide" onClick={onClose}>
          เยี่ยม!
        </button>
      </div>
    </dialog>
  );
}
```

### Save Reading Modal

```typescript
// src/components/modals/SaveReadingModal.tsx
import { useState } from "react";
import { Save, X } from "lucide-react";

interface SaveReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (save: boolean) => void;
  readingQuestion: string;
}

export function SaveReadingModal({
  isOpen,
  onClose,
  onSave,
  readingQuestion,
}: SaveReadingModalProps) {
  const [saving, setSaving] = useState(false);

  const handleSave = async (save: boolean) => {
    setSaving(true);
    await onSave(save);
    setSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <form method="dialog">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </form>

        <h3 className="text-lg font-bold mb-4">บันทึกคำทำนาย</h3>

        <div className="space-y-4">
          <div className="bg-base-200 rounded-lg p-4">
            <p className="text-sm text-neutral-content mb-2">คำถาม:</p>
            <p className="font-medium">{readingQuestion}</p>
          </div>

          <p className="text-sm text-neutral-content">
            คุณต้องการบันทึกคำทำนายนี้เพื่อติดตามความแม่นยำในอนาคตหรือไม่?
            การบันทึกจะช่วยให้คุณสามารถรีวิวและให้คะแนนความแม่นยำได้ในภายหลัง
          </p>

          <div className="bg-info/10 border border-info/30 rounded-lg p-3">
            <p className="text-xs text-info-content">
              💡 การรีวิวความแม่นยำจะช่วยให้คุณได้รับ EXP และ Coins เพิ่มเติม
            </p>
          </div>
        </div>

        <div className="modal-action">
          <button
            className="btn btn-ghost"
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            ไม่บันทึก
          </button>
          <button
            className="btn btn-primary"
            onClick={() => handleSave(true)}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                กำลังบันทึก...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                บันทึก
              </>
            )}
          </button>
        </div>
      </div>
    </dialog>
  );
}
```

---

## Loading Components

### AI Processing Animation

```typescript
// src/components/loading/AIProcessingLoader.tsx
export function AIProcessingLoader() {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      {/* Mystical Symbol Animation */}
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <div className="absolute inset-2 w-12 h-12 border-4 border-accent/30 border-b-accent rounded-full animate-spin animate-reverse"></div>
        <div className="absolute inset-4 w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full animate-pulse"></div>
      </div>

      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-base-content">
          แม่หมอกำลังดูดวงให้คุณ...
        </p>
        <p className="text-sm text-neutral-content">กรุณารอสักครู่ ✨</p>
      </div>
    </div>
  );
}
```

### Card Shuffling Animation

```typescript
// src/components/loading/CardShufflingLoader.tsx
export function CardShufflingLoader() {
  return (
    <div className="flex justify-center items-center space-x-2 p-8">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-16 h-24 bg-gradient-to-br from-primary to-secondary rounded-lg border-2 border-primary/20 shadow-lg flex items-center justify-center"
          style={{
            animation: `shuffle 1.5s infinite ${i * 0.1}s`,
            transform: `translateY(${Math.sin(Date.now() / 1000 + i) * 10}px)`,
          }}
        >
          <div className="text-white text-2xl">✨</div>
        </div>
      ))}

      <style jsx>{`
        @keyframes shuffle {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-10px) rotate(2deg);
          }
          75% {
            transform: translateY(5px) rotate(-1deg);
          }
        }
      `}</style>
    </div>
  );
}
```

---

## Error Components

### Error Boundary

```typescript
// src/components/error/ErrorBoundary.tsx
import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-error mb-4" />
            <h2 className="text-xl font-bold text-base-content mb-2">
              เกิดข้อผิดพลาด
            </h2>
            <p className="text-neutral-content mb-6 max-w-md">
              ขออภัย เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง
            </p>
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              โหลดหน้าใหม่
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

---

## Toast Notifications

### Toast Provider

```typescript
// src/components/toast/ToastProvider.tsx
import { createContext, useContext, ReactNode } from "react";
import { CheckCircle, XCircle, Info, AlertTriangle } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  // Toast implementation here...

  return (
    <ToastContext.Provider
      value={{ addToast: () => {}, removeToast: () => {} }}
    >
      {children}
      <div className="toast toast-top toast-center">
        {/* Toast components */}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};
```

---

**File Purpose**: Core UI Components for Chat & Cards  
**Round Usage**: Round 4 (Chat UI & Reading Flow)  
**Dependencies**: React, Tailwind, DaisyUI, Lucide Icons  
**Estimated Tokens**: ~3,000
