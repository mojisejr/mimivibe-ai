"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, stagger, useAnimate } from "framer-motion";
import { ReadingResponse } from "@/types/reading";
import { CardFallback } from "@/components/cards/CardFallback";
import { X } from "lucide-react";

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
          className="w-full h-full object-contain bg-white"
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
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    if (isSaving || isSaved) return;
    
    setIsSaving(true);
    try {
      await onSave?.();
      // isSaved state is now managed by parent component through readingData
    } catch (error) {
      setErrorMessage("ไม่สามารถบันทึกการทำนายได้ กรุณาลองใหม่");
      setShowError(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      await onDelete?.();
    } catch (error) {
      setErrorMessage("ไม่สามารถลบการทำนายได้ กรุณาลองใหม่");
      setShowError(true);
      setIsDeleting(false); // Reset only on error, success will navigate away
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
          {/* Desktop Cards */}
          <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {readingData.cards.map((card, index) => (
              <div key={card.id} className="text-center">
                <div className="relative group mb-4 cursor-pointer" onClick={() => {
                  setSelectedCard(card);
                  setShowCardModal(true);
                }}>
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
                  {card.displayName || (card.name || '').split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                </motion.h3>
              </div>
            ))}
          </div>

          {/* Mobile Cards - Smaller with Modal */}
          <div className="md:hidden grid grid-cols-3 gap-3 max-w-sm mx-auto">
            {readingData.cards.map((card, index) => (
              <div key={card.id} className="text-center">
                <div className="relative group mb-3 cursor-pointer" onClick={() => {
                  setSelectedCard(card);
                  setShowCardModal(true);
                }}>
                  <motion.div
                    className="w-full aspect-[2/3] overflow-hidden rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
                    initial={{ scale: 0, rotateY: 180 }}
                    animate={{ scale: cardsRevealed ? 1 : 0, rotateY: cardsRevealed ? 0 : 180 }}
                    transition={{
                      duration: 0.8,
                      ease: "easeInOut",
                      delay: 1.2 + index * 0.6,
                    }}
                  >
                    <img
                      src={card.imageUrl}
                      alt={card.displayName}
                      className="w-full h-full object-contain bg-white"
                      onError={() => {}}
                    />
                  </motion.div>
                  <motion.div
                    className="absolute bottom-1 right-1 w-5 h-5 bg-primary/80 text-primary-content text-xs font-medium rounded-full flex items-center justify-center shadow-sm"
                    initial={{ scale: 0 }}
                    animate={{ scale: cardsRevealed ? 1 : 0 }}
                    transition={{
                      delay: 1.6 + index * 0.6,
                      duration: 0.3,
                      type: "spring",
                      stiffness: 300,
                    }}
                  >
                    {index + 1}
                  </motion.div>
                </div>
                <motion.h3
                  className="font-semibold text-base-content text-xs mb-2 leading-tight"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: cardsRevealed ? 1 : 0 }}
                  transition={{ delay: 2.4 + index * 0.6, duration: 0.3 }}
                >
                  {card.displayName || (card.name || '').split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                </motion.h3>
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
                  disabled={isSaved || isSaving}
                  className={`btn flex-1 ${
                    isSaved
                      ? "btn-ghost text-success"
                      : isSaving 
                      ? "btn-ghost text-neutral loading"
                      : "btn btn-ghost text-primary"
                  }`}
                  whileHover={{ scale: isSaving ? 1 : 1.02 }}
                  whileTap={{ scale: isSaving ? 1 : 0.98 }}
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
                </motion.button>

                <motion.button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className={`btn flex-1 ${
                    isDeleting 
                    ? "btn-ghost text-neutral loading"
                    : "btn-ghost text-error"
                  }`}
                  whileHover={{ scale: isDeleting ? 1 : 1.02 }}
                  whileTap={{ scale: isDeleting ? 1 : 0.98 }}
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
                  disabled={isSaved || isSaving}
                  className={`btn btn-sm ${
                    isSaved
                      ? "btn-ghost text-success"
                      : isSaving
                      ? "btn-ghost text-neutral loading"
                      : "btn btn-ghost text-primary"
                  }`}
                  whileHover={{ scale: isSaving ? 1 : 1.02 }}
                  whileTap={{ scale: isSaving ? 1 : 0.98 }}
                >
                  {isSaving ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <span className="text-xs">{isSaved ? "✓" : "💾"}</span>
                  )}
                  <span className="text-xs">
                    {isSaving ? "บันทึก..." : isSaved ? "บันทึกแล้ว" : "บันทึก"}
                  </span>
                </motion.button>

                <motion.button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className={`btn btn-sm ${
                    isDeleting 
                    ? "btn-ghost text-neutral loading"
                    : "btn-ghost text-error"
                  }`}
                  whileHover={{ scale: isDeleting ? 1 : 1.02 }}
                  whileTap={{ scale: isDeleting ? 1 : 0.98 }}
                >
                  {isDeleting ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <span className="text-xs">🗑️</span>
                  )}
                  <span className="text-xs">
                    {isDeleting ? "ลบ..." : "ลบ"}
                  </span>
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

      {/* Card Detail Modal for Mobile */}
      <AnimatePresence>
        {showCardModal && selectedCard && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowCardModal(false);
              setSelectedCard(null);
            }}
          >
            <motion.div
              className="relative w-full max-w-xs bg-base-100 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowCardModal(false);
                  setSelectedCard(null);
                }}
                className="absolute top-3 right-3 z-10 btn btn-circle btn-ghost btn-sm bg-white/90 hover:bg-white shadow-md"
              >
                <X className="w-4 h-4" />
              </button>
              
              {/* Card Image - Smaller */}
              <div className="relative bg-white p-4">
                <div className="w-32 h-48 mx-auto">
                  <img 
                    src={selectedCard.imageUrl}
                    alt={selectedCard.displayName}
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
              </div>

              {/* Card Info - Compact */}
              <div className="p-4 space-y-3">
                <h3 className="text-lg font-bold text-base-content text-center">
                  {selectedCard.displayName || (selectedCard.name || '').split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                </h3>
                
                {selectedCard.keywords && (
                  <div>
                    <h4 className="font-semibold text-base-content mb-2 text-sm">
                      Keywords
                    </h4>
                    <p className="text-base-content/70 text-sm leading-relaxed">
                      {selectedCard.keywords}
                    </p>
                  </div>
                )}
                
                <button
                  onClick={() => {
                    setShowCardModal(false);
                    setSelectedCard(null);
                  }}
                  className="btn btn-primary w-full btn-sm"
                >
                  ปิด
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
