'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, stagger, useAnimate } from 'framer-motion'
import { ReadingResponse } from '@/types/reading'
import { CardFallback } from '@/components/cards/CardFallback'

interface AnimatedCardImageProps {
  src: string
  alt: string
  position: number
  index: number
  shouldAnimate: boolean
}

function AnimatedCardImage({ src, alt, position, index, shouldAnimate }: AnimatedCardImageProps) {
  const [hasError, setHasError] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)

  useEffect(() => {
    if (shouldAnimate) {
      const delay = 1200 + (index * 600) // Base delay + staggered timing
      const timer = setTimeout(() => {
        setIsFlipped(true)
      }, delay)
      return () => clearTimeout(timer)
    }
  }, [shouldAnimate, index])

  if (hasError) {
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
        <CardFallback className="w-full transition-transform duration-300 group-hover:scale-105" aria-label={`ไพ่ ${alt}`} />
        <motion.div 
          className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-content text-sm font-semibold rounded-full flex items-center justify-center shadow-lg"
          initial={shouldAnimate ? { scale: 0 } : {}}
          animate={shouldAnimate ? { scale: 1 } : {}}
          transition={{ 
            delay: shouldAnimate ? 1.6 + (index * 0.6) : 0,
            duration: 0.3,
            type: "spring",
            stiffness: 300
          }}
        >
          {position}
        </motion.div>
      </motion.div>
    )
  }

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
      <div className="card card-mystical w-full aspect-[2/3] overflow-hidden transition-transform duration-300 group-hover:scale-105 p-0 shadow-lg">
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
          role="img"
          aria-describedby={`card-${position}-description`}
        />
      </div>
      <motion.div 
        className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-content text-sm font-semibold rounded-full flex items-center justify-center shadow-lg"
        initial={shouldAnimate ? { scale: 0 } : {}}
        animate={shouldAnimate ? { scale: 1 } : {}}
        transition={{ 
          delay: shouldAnimate ? 1.6 + (index * 0.6) : 0,
          duration: 0.3,
          type: "spring",
          stiffness: 300
        }}
      >
        {position}
      </motion.div>
    </motion.div>
  )
}

interface AnimatedArticleDisplayProps {
  readingData: ReadingResponse['data']
  onSave?: () => void
  onDelete?: () => void
  onAskAgain?: () => void
  onQuestionClick?: (question: string) => void
}

export function AnimatedArticleDisplay({ readingData, onSave, onDelete, onAskAgain, onQuestionClick }: AnimatedArticleDisplayProps) {
  const [scope, animate] = useAnimate()
  const [animationPhase, setAnimationPhase] = useState<'question' | 'header' | 'cards' | 'reading' | 'complete'>('question')
  const [cardsRevealed, setCardsRevealed] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSave = async () => {
    try {
      await onSave?.()
      setIsSaved(true)
    } catch (error) {
      setErrorMessage('ไม่สามารถบันทึกการทำนายได้ กรุณาลองใหม่')
      setShowError(true)
    }
  }

  const handleDelete = async () => {
    try {
      await onDelete?.()
    } catch (error) {
      setErrorMessage('ไม่สามารถลบการทำนายได้ กรุณาลองใหม่')
      setShowError(true)
    }
  }

  useEffect(() => {
    const runAnimationSequence = async () => {
      try {
        // 1. Question appear (0.5s)
        await animate('.question-header', 
          { opacity: [0, 1], y: [20, 0] }, 
          { duration: 0.5, ease: "easeOut" }
        )
        setAnimationPhase('header')
        
        // 2. Header appear (0.8s delay)
        await new Promise(resolve => setTimeout(resolve, 300))
        await animate('.reading-header', 
          { opacity: [0, 1], y: [20, 0] }, 
          { duration: 0.5, ease: "easeOut" }
        )
        setAnimationPhase('cards')
        
        // 3. Cards appear + flip (1.2s delay total)
        await new Promise(resolve => setTimeout(resolve, 400))
        setCardsRevealed(true)
        setAnimationPhase('reading')
        
        // 4. Wait for cards animation to complete (3s + stagger time)
        await new Promise(resolve => setTimeout(resolve, 3000 + (readingData.cards.length * 600)))
        
        // 5. Reading sections appear (staggered)
        await animate('.reading-section',
          { opacity: [0, 1], y: [15, 0] },
          { duration: 0.4, delay: stagger(0.2), ease: "easeOut" }
        )
        
        setAnimationPhase('complete')
        
        // 6. Action buttons appear
        await animate('.action-buttons',
          { opacity: [0, 1], y: [20, 0] },
          { duration: 0.4, ease: "easeOut" }
        )
      } catch (error) {
        console.error('Animation sequence error:', error)
        // Fallback: show all content immediately
        setAnimationPhase('complete')
        setCardsRevealed(true)
      }
    }

    runAnimationSequence()
  }, [animate, readingData.cards.length])

  return (
    <div ref={scope} className="page-container bg-base-200 pt-20 lg:pt-24">
      <div className="content-container">
        {/* Article Header */}
        <header className="mb-12 text-center">
          <motion.div 
            className="mb-6 reading-header"
            initial={{ opacity: 0, y: 20 }}
          >
            <h1 className="heading-1 md:text-4xl text-base-content mb-4 leading-tight">
              {readingData.reading.header}
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto"></div>
          </motion.div>
          
          {/* Question */}
          <motion.div 
            className="max-w-2xl mx-auto mb-8 question-header"
            initial={{ opacity: 0, y: 20 }}
          >
            <p className="body-large text-neutral-content italic border-l-4 border-primary/30 pl-4">
              &ldquo;{readingData.question}&rdquo;
            </p>
          </motion.div>

          {/* Reading Meta Info */}
          <motion.div 
            className="flex flex-wrap justify-center items-center gap-4 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: animationPhase !== 'question' ? 1 : 0 }}
            transition={{ duration: 0.3, delay: 0.8 }}
          >
            <div className="badge badge-primary gap-2">
              <span>🔮</span>
              <span>แม่หมอมีมี่</span>
            </div>
            <div className="badge badge-secondary gap-2">
              <span>📅</span>
              <span>{new Date(readingData.createdAt).toLocaleDateString('th-TH')}</span>
            </div>
            <div className="badge badge-accent gap-2">
              <span>🃏</span>
              <span>{readingData.cards.length} ใบ</span>
            </div>
          </motion.div>
        </header>

        {/* Cards Section */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: animationPhase === 'cards' || animationPhase === 'reading' || animationPhase === 'complete' ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2 
            className="heading-2 text-base-content mb-8 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: animationPhase === 'cards' || animationPhase === 'reading' || animationPhase === 'complete' ? 1 : 0, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            ไพ่ที่จั่วได้
          </motion.h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {readingData.cards.map((card, index) => (
              <div key={card.id} className="text-center">
                <div className="relative group mb-4">
                  <AnimatedCardImage 
                    src={card.imageUrl}
                    alt={card.displayName}
                    position={index + 1}
                    index={index}
                    shouldAnimate={cardsRevealed}
                  />
                </div>
                <motion.h3 
                  className="font-semibold text-base-content text-sm sm:text-base mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: cardsRevealed ? 1 : 0 }}
                  transition={{ delay: 2.4 + (index * 0.6), duration: 0.3 }}
                >
                  {card.displayName}
                </motion.h3>
                <motion.p 
                  className="text-xs text-neutral-content leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: cardsRevealed ? 1 : 0 }}
                  transition={{ delay: 2.6 + (index * 0.6), duration: 0.3 }}
                  id={`card-${index + 1}-description`}
                >
                  {card.shortMeaning}
                </motion.p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Main Reading Content */}
        <article className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Main Reading */}
          <motion.section 
            className="prose prose-lg max-w-none mb-12 reading-section"
            initial={{ opacity: 0, y: 15 }}
          >
            <div className="card card-mystical p-6 sm:p-8 shadow-lg">
              <h2 className="heading-2 text-base-content mb-6 text-center sm:text-left">การทำนาย</h2>
              <div className="body-normal text-base-content leading-relaxed whitespace-pre-line text-left">
                {readingData.reading.reading}
              </div>
            </div>
          </motion.section>

          {/* Suggestions */}
          {readingData.reading.suggestions && readingData.reading.suggestions.length > 0 && (
            <motion.section 
              className="mb-12 reading-section"
              initial={{ opacity: 0, y: 15 }}
            >
              <div className="alert alert-info p-6 sm:p-8 shadow-lg">
                <div className="w-full">
                  <h2 className="heading-2 text-info-content mb-6 text-center sm:text-left">คำแนะนำ</h2>
                  <ul className="space-y-4">
                    {readingData.reading.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-7 h-7 bg-info text-info-content text-sm rounded-full flex items-center justify-center font-semibold shadow-sm">
                          {index + 1}
                        </span>
                        <span className="body-normal text-info-content leading-relaxed text-left">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.section>
          )}

          {/* Final Message */}
          {readingData.reading.final && (
            <motion.section 
              className="mb-12 reading-section"
              initial={{ opacity: 0, y: 15 }}
            >
              <div className="alert alert-success p-6 sm:p-8 shadow-lg">
                <div className="w-full">
                  <h2 className="heading-2 text-success-content mb-6 text-center sm:text-left">ข้อสรุป</h2>
                  <div className="body-normal text-success-content leading-relaxed whitespace-pre-line text-left">
                    {readingData.reading.final}
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* End Message */}
          {readingData.reading.end && (
            <motion.section 
              className="mb-12 reading-section"
              initial={{ opacity: 0, y: 15 }}
            >
              <div className="card card-mystical p-6 sm:p-8 text-center bg-gradient-to-br from-primary/10 to-secondary/10 shadow-lg">
                <div className="body-normal text-base-content leading-relaxed">
                  {readingData.reading.end}
                </div>
              </div>
            </motion.section>
          )}

          {/* Next Questions */}
          {readingData.reading.next_questions && readingData.reading.next_questions.length > 0 && (
            <motion.section 
              className="mb-12 reading-section"
              initial={{ opacity: 0, y: 15 }}
            >
              <div className="card card-mystical p-6 sm:p-8 shadow-lg">
                <div className="w-full">
                  <h2 className="heading-2 text-base-content mb-6 text-center">
                    <span className="text-primary">✨</span> คำถามแนะนำ
                  </h2>
                  <p className="body-normal text-neutral-content mb-6 text-center">
                    คลิกเพื่อถามคำถามต่อไปนี้
                  </p>
                  <div className="space-y-3">
                    {readingData.reading.next_questions.map((question, index) => (
                      <motion.button
                        key={index}
                        onClick={() => onQuestionClick?.(question)}
                        className="w-full text-left p-4 rounded-lg border-2 border-primary/20 hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="body-normal text-base-content group-hover:text-primary transition-colors">
                            {question}
                          </span>
                          <span className="text-primary opacity-60 group-hover:opacity-100 transition-opacity">
                            →
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* Notice */}
          {readingData.reading.notice && (
            <motion.section 
              className="mb-12 reading-section"
              initial={{ opacity: 0, y: 15 }}
            >
              <div className="alert alert-warning p-6 shadow-lg">
                <div className="w-full">
                  <h3 className="heading-3 mb-3 text-warning-content text-center sm:text-left">หมายเหตุ</h3>
                  <p className="body-normal text-warning-content leading-relaxed text-left">{readingData.reading.notice}</p>
                </div>
              </div>
            </motion.section>
          )}

          {/* Rewards */}
          {readingData.rewards && (
            <motion.section 
              className="mb-12 reading-section"
              initial={{ opacity: 0, y: 15 }}
            >
              <div className="alert alert-success p-6 shadow-lg">
                <div className="w-full">
                  <h3 className="heading-3 mb-6 text-center text-success-content">รางวัลที่ได้รับ</h3>
                  <div className="flex justify-center space-x-8">
                    <div className="text-center">
                      <div className="w-14 h-14 bg-warning rounded-full flex items-center justify-center mb-3 mx-auto shadow-lg">
                        <span className="text-warning-content text-xl">⭐</span>
                      </div>
                      <div className="body-small text-success-content font-medium">+{readingData.rewards.exp} EXP</div>
                    </div>
                    <div className="text-center">
                      <div className="w-14 h-14 bg-accent rounded-full flex items-center justify-center mb-3 mx-auto shadow-lg">
                        <span className="text-accent-content text-xl">🪙</span>
                      </div>
                      <div className="body-small text-success-content font-medium">+{readingData.rewards.coins} เหรียญ</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </article>

        {/* Action Buttons - Improved Mobile UX */}
        <motion.div 
          className="pb-8 action-buttons"
          initial={{ opacity: 0, y: 20 }}
        >
          {/* Desktop Action Buttons */}
          <div className="hidden sm:block sticky bottom-8 max-w-2xl mx-auto">
            <div className="card card-mystical p-6 shadow-xl bg-base-100/95 backdrop-blur-sm">
              <div className="flex gap-4">
                <motion.button
                  onClick={handleSave}
                  disabled={isSaved}
                  className={`btn flex-1 ${
                    isSaved
                      ? 'btn-success'
                      : 'btn btn-primary'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>{isSaved ? '✓' : '💾'}</span>
                  <span>{isSaved ? 'บันทึกแล้ว' : 'บันทึกการทำนาย'}</span>
                </motion.button>
                
                <motion.button
                  onClick={handleDelete}
                  className="btn btn-outline btn-error flex-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>🗑️</span>
                  <span>ลบการทำนาย</span>
                </motion.button>
                
                <motion.button
                  onClick={onAskAgain}
                  className="btn btn-accent flex-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>🔮</span>
                  <span>ถามใหม่</span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Mobile Action Buttons - Inline Layout */}
          <div className="sm:hidden max-w-2xl mx-auto px-4 pb-24 safe-area-bottom">
            <div className="space-y-4">
              {/* Primary Action - Ask Again */}
              <motion.button
                onClick={onAskAgain}
                className="btn btn-accent w-full btn-lg shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>🔮</span>
                <span>ถามใหม่</span>
              </motion.button>
              
              {/* Secondary Actions - Horizontal */}
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  onClick={handleSave}
                  disabled={isSaved}
                  className={`btn btn-sm ${
                    isSaved
                      ? 'btn-success'
                      : 'btn btn-primary btn-outline'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-xs">{isSaved ? '✓' : '💾'}</span>
                  <span className="text-xs">{isSaved ? 'บันทึกแล้ว' : 'บันทึก'}</span>
                </motion.button>
                
                <motion.button
                  onClick={handleDelete}
                  className="btn btn-sm btn-outline btn-error"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-xs">🗑️</span>
                  <span className="text-xs">ลบ</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Error Modal */}
      <AnimatePresence>
        {showError && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowError(false)}
          >
            <motion.div
              className="card card-mystical p-6 max-w-md w-full bg-base-100 shadow-xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-4xl mb-4">⚠️</div>
                <h3 className="heading-3 text-error mb-4">เกิดข้อผิดพลาด</h3>
                <p className="body-normal text-base-content mb-6">{errorMessage}</p>
                <button
                  onClick={() => setShowError(false)}
                  className="btn btn-primary"
                >
                  ตกลง
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}