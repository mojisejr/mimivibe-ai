"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, stagger, useAnimate } from "framer-motion";
import { ReadingResponse } from "@/types/reading";
import { CardFallback } from "@/components/cards/CardFallback";

interface AnimatedCardImageProps {
  src: string;
  alt: string;
  position: number;
  index: number;
  shouldAnimate: boolean;
}

function AnimatedCardImage({
  src,
  alt,
  position,
  index,
  shouldAnimate,
}: AnimatedCardImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (shouldAnimate) {
      const delay = 1200 + index * 600; // Base delay + staggered timing
      const timer = setTimeout(() => {
        setIsFlipped(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [shouldAnimate, index]);

  if (hasError) {
    return (
      <motion.div
        className="relative perspective-1000"
        initial={shouldAnimate ? { scale: 0, rotateY: 180 } : {}}
        animate={
          shouldAnimate ? { scale: 1, rotateY: isFlipped ? 0 : 180 } : {}
        }
        transition={{
          duration: 0.8,
          ease: "easeInOut",
          delay: shouldAnimate ? 1.2 + index * 0.6 : 0,
        }}
      >
        <CardFallback
          className="w-full transition-transform duration-300 group-hover:scale-105"
          aria-label={`ไพ่ ${alt}`}
        />
        <motion.div
          className="absolute bottom-1 right-1 w-6 h-6 bg-primary/80 text-primary-content text-xs font-medium rounded-full flex items-center justify-center shadow-sm"
          initial={shouldAnimate ? { scale: 0 } : {}}
          animate={shouldAnimate ? { scale: 1 } : {}}
          transition={{
            delay: shouldAnimate ? 1.6 + index * 0.6 : 0,
            duration: 0.3,
            type: "spring",
            stiffness: 300,
          }}
        >
          {position}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="relative perspective-1000"
      initial={shouldAnimate ? { scale: 0, rotateY: 180 } : {}}
      animate={shouldAnimate ? { scale: 1, rotateY: isFlipped ? 0 : 180 } : {}}
      transition={{
        duration: 0.8,
        ease: "easeInOut",
        delay: shouldAnimate ? 1.2 + index * 0.6 : 0,
      }}
    >
      <div className="w-full aspect-[2/3] overflow-hidden rounded-lg shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-[1.02]">
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
        className="absolute bottom-1 right-1 w-6 h-6 bg-primary/80 text-primary-content text-xs font-medium rounded-full flex items-center justify-center shadow-sm"
        initial={shouldAnimate ? { scale: 0 } : {}}
        animate={shouldAnimate ? { scale: 1 } : {}}
        transition={{
          delay: shouldAnimate ? 1.6 + index * 0.6 : 0,
          duration: 0.3,
          type: "spring",
          stiffness: 300,
        }}
      >
        {position}
      </motion.div>
    </motion.div>
  );
}

interface AnimatedArticleDisplayProps {
  readingData: ReadingResponse["data"];
  onSave?: () => void;
  onDelete?: () => void;
  onAskAgain?: () => void;
  onQuestionClick?: (question: string) => void;
}

export function AnimatedArticleDisplay({
  readingData,
  onSave,
  onDelete,
  onAskAgain,
  onQuestionClick,
}: AnimatedArticleDisplayProps) {
  const [scope, animate] = useAnimate();
  const [animationPhase, setAnimationPhase] = useState<
    "question" | "header" | "cards" | "reading" | "complete"
  >("question");
  const [cardsRevealed, setCardsRevealed] = useState(false);
  const isSaved = readingData?.isSaved || false;
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSave = async () => {
    try {
      await onSave?.();
      // isSaved state is now managed by parent component through readingData
    } catch (error) {
      setErrorMessage("ไม่สามารถบันทึกการทำนายได้ กรุณาลองใหม่");
      setShowError(true);
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete?.();
    } catch (error) {
      setErrorMessage("ไม่สามารถลบการทำนายได้ กรุณาลองใหม่");
      setShowError(true);
    }
  };

  useEffect(() => {
    const runAnimationSequence = async () => {
      try {
        // 1. Question appear (0.5s)
        await animate(
          ".question-header",
          { opacity: [0, 1], y: [20, 0] },
          { duration: 0.5, ease: "easeOut" }
        );
        setAnimationPhase("header");

        // 2. Header appear (0.8s delay)
        await new Promise((resolve) => setTimeout(resolve, 300));
        await animate(
          ".reading-header",
          { opacity: [0, 1], y: [20, 0] },
          { duration: 0.5, ease: "easeOut" }
        );
        setAnimationPhase("cards");

        // 3. Cards appear + flip (1.2s delay total)
        await new Promise((resolve) => setTimeout(resolve, 400));
        setCardsRevealed(true);
        setAnimationPhase("reading");

        // 4. Wait for cards animation to complete (3s + stagger time)
        await new Promise((resolve) =>
          setTimeout(resolve, 3000 + readingData.cards.length * 600)
        );

        // 5. Reading sections appear (staggered)
        await animate(
          ".reading-section",
          { opacity: [0, 1], y: [15, 0] },
          { duration: 0.4, delay: stagger(0.2), ease: "easeOut" }
        );

        setAnimationPhase("complete");

        // 6. Action buttons appear
        await animate(
          ".action-buttons",
          { opacity: [0, 1], y: [20, 0] },
          { duration: 0.4, ease: "easeOut" }
        );
      } catch (error) {
        console.error("Animation sequence error:", error);
        // Fallback: show all content immediately
        setAnimationPhase("complete");
        setCardsRevealed(true);
      }
    };

    runAnimationSequence();
  }, [animate, readingData.cards.length]);

  return (
    <div ref={scope} className="min-h-screen bg-base-100 pt-20 lg:pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Article Header */}
        <header className="mb-16 text-center">
          <motion.div
            className="mb-8 reading-header"
            initial={{ opacity: 0, y: 20 }}
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-base-content mb-6 leading-tight">
              {readingData.reading.header}
            </h1>
            <div className="w-16 h-px bg-gradient-to-r from-primary to-accent mx-auto"></div>
          </motion.div>

          {/* Question */}
          <motion.div
            className="max-w-2xl mx-auto mb-8 question-header"
            initial={{ opacity: 0, y: 20 }}
          >
            <p className="text-lg md:text-xl text-neutral-content italic border-l-4 border-primary/30 pl-6 py-2 leading-relaxed">
              &ldquo;{readingData.question}&rdquo;
            </p>
          </motion.div>

          {/* Reading Meta Info - Chip Style */}
          <motion.div
            className="flex flex-wrap justify-center items-center gap-3 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: animationPhase !== "question" ? 1 : 0 }}
            transition={{ duration: 0.3, delay: 0.8 }}
          >
            <div className="px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium">
              <span className="mr-2">🔮</span>
              <span>แม่หมอมีมี่</span>
            </div>
            <div className="px-4 py-2 rounded-full border border-secondary/20 bg-secondary/5 text-secondary text-sm font-medium">
              <span className="mr-2">📅</span>
              <span>
                {new Date(readingData.createdAt).toLocaleDateString("th-TH")}
              </span>
            </div>
            <div className="px-4 py-2 rounded-full border border-accent/20 bg-accent/5 text-accent text-sm font-medium">
              <span className="mr-2">🃏</span>
              <span>{readingData.cards.length} ใบ</span>
            </div>
          </motion.div>
        </header>

        {/* Cards Section */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0 }}
          animate={{
            opacity:
              animationPhase === "cards" ||
              animationPhase === "reading" ||
              animationPhase === "complete"
                ? 1
                : 0,
          }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2
            className="heading-2 text-base-content mb-8 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity:
                animationPhase === "cards" ||
                animationPhase === "reading" ||
                animationPhase === "complete"
                  ? 1
                  : 0,
              y: 0,
            }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            ไพ่ที่หยิบได้
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
                  transition={{ delay: 2.4 + index * 0.6, duration: 0.3 }}
                >
                  {card.displayName}
                </motion.h3>
                <motion.p
                  className="text-xs text-neutral-content leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: cardsRevealed ? 1 : 0 }}
                  transition={{ delay: 2.6 + index * 0.6, duration: 0.3 }}
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
            className="mb-12 border-l-4 border-primary/50 pl-8 py-6 reading-section"
            initial={{ opacity: 0, y: 15 }}
          >
            <h2 className="heading-2 text-base-content mb-6">การทำนาย</h2>
            <div className="body-normal text-base-content leading-relaxed whitespace-pre-line">
              {readingData.reading.reading}
            </div>
          </motion.section>

          {/* Suggestions */}
          {readingData.reading.suggestions &&
            readingData.reading.suggestions.length > 0 && (
              <motion.section
                className="mb-12 border-l-4 border-info/50 pl-8 py-6 reading-section"
                initial={{ opacity: 0, y: 15 }}
              >
                <h2 className="heading-2 text-base-content mb-6">คำแนะนำ</h2>
                <ul className="space-y-4">
                  {readingData.reading.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <span className="flex-shrink-0 mt-1 text-info font-semibold text-sm">
                        {index + 1}.
                      </span>
                      <span className="body-normal text-base-content leading-relaxed">
                        {suggestion}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.section>
            )}

          {/* Final Message */}
          {readingData.reading.final && (
            <motion.section
              className="mb-12 border-l-4 border-success/50 pl-8 py-6 reading-section"
              initial={{ opacity: 0, y: 15 }}
            >
              <h2 className="heading-2 text-base-content mb-6">ข้อสรุป</h2>
              <div className="body-normal text-base-content leading-relaxed whitespace-pre-line">
                {readingData.reading.final}
              </div>
            </motion.section>
          )}

          {/* End Message */}
          {readingData.reading.end && (
            <motion.section
              className="mb-12 text-center py-8 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg reading-section"
              initial={{ opacity: 0, y: 15 }}
            >
              <div className="body-normal text-base-content leading-relaxed">
                {readingData.reading.end}
              </div>
            </motion.section>
          )}

          {/* Next Questions */}
          {readingData.reading.next_questions &&
            readingData.reading.next_questions.length > 0 && (
              <motion.section
                className="mb-12 border-l-4 border-accent/50 pl-8 py-6 reading-section"
                initial={{ opacity: 0, y: 15 }}
              >
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
              </motion.section>
            )}

          {/* Notice */}
          {readingData.reading.notice && (
            <motion.section
              className="mb-12 border-l-4 border-warning/50 pl-8 py-6 reading-section"
              initial={{ opacity: 0, y: 15 }}
            >
              <h3 className="heading-3 mb-3 text-base-content">หมายเหตุ</h3>
              <p className="body-normal text-base-content leading-relaxed">
                {readingData.reading.notice}
              </p>
            </motion.section>
          )}

          {/* Rewards */}
          {readingData.rewards && (
            <motion.section
              className="mb-12 border-l-4 border-success/50 pl-8 py-6 reading-section"
              initial={{ opacity: 0, y: 15 }}
            >
              <h3 className="heading-3 mb-6 text-center text-base-content">
                รางวัลที่ได้รับ
              </h3>
              <div className="flex justify-center space-x-8">
                <div className="text-center">
                  <div className="w-14 h-14 bg-warning rounded-full flex items-center justify-center mb-3 mx-auto shadow-sm">
                    <span className="text-warning-content text-xl">⭐</span>
                  </div>
                  <div className="body-small text-base-content font-medium">
                    +{readingData.rewards.exp} EXP
                  </div>
                </div>
                <div className="text-center">
                  <div className="w-14 h-14 bg-accent rounded-full flex items-center justify-center mb-3 mx-auto shadow-sm">
                    <span className="text-accent-content text-xl">🪙</span>
                  </div>
                  <div className="body-small text-base-content font-medium">
                    +{readingData.rewards.coins} เหรียญ
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
                      ? "btn-ghost text-success"
                      : "btn btn-ghost text-primary"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>{isSaved ? "✓" : "💾"}</span>
                  <span>{isSaved ? "บันทึกแล้ว" : "บันทึกการทำนาย"}</span>
                </motion.button>

                <motion.button
                  onClick={handleDelete}
                  className="btn btn-ghost text-error flex-1"
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
                className="btn btn-accent w-full btn-lg shadow-md"
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
                      ? "btn-ghost text-success"
                      : "btn btn-ghost text-primary"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-xs">{isSaved ? "✓" : "💾"}</span>
                  <span className="text-xs">
                    {isSaved ? "บันทึกแล้ว" : "บันทึก"}
                  </span>
                </motion.button>

                <motion.button
                  onClick={handleDelete}
                  className="btn btn-sm btn-ghost text-error"
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
                <p className="body-normal text-base-content mb-6">
                  {errorMessage}
                </p>
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
  );
}
