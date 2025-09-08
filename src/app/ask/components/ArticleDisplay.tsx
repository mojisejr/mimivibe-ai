"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ReadingResponse } from "@/types/reading";
import { CardFallback } from "@/components/cards/CardFallback";

interface CardImageProps {
  src: string;
  alt: string;
  position: number;
}

function CardImage({ src, alt, position }: CardImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="relative group">
        <CardFallback className="w-full transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute bottom-1 right-1 w-6 h-6 bg-primary/80 text-primary-content text-xs font-medium rounded-full flex items-center justify-center shadow-sm">
          {position}
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="w-full aspect-[2/3] overflow-hidden rounded-lg shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-[1.02]">
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      </div>
      <div className="absolute bottom-1 right-1 w-6 h-6 bg-primary/80 text-primary-content text-xs font-medium rounded-full flex items-center justify-center shadow-sm">
        {position}
      </div>
    </div>
  );
}

interface ArticleDisplayProps {
  readingData: ReadingResponse["data"];
  onSave?: () => void;
  onDelete?: () => void;
  onAskAgain?: () => void;
}

export function ArticleDisplay({
  readingData,
  onSave,
  onDelete,
  onAskAgain,
}: ArticleDisplayProps) {
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onSave?.();
    setIsSaved(true);
  };

  return (
    <div className="min-h-screen bg-base-100 pt-20 lg:pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Article Header */}
        <motion.header
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-base-content mb-6 leading-tight">
              {readingData.reading.header}
            </h1>
            <div className="w-16 h-px bg-gradient-to-r from-primary to-accent mx-auto"></div>
          </div>

          {/* Question */}
          <div className="max-w-2xl mx-auto mb-8">
            <p className="text-lg md:text-xl text-neutral-content italic border-l-4 border-primary/30 pl-6 py-2 leading-relaxed">
              &ldquo;{readingData.question}&rdquo;
            </p>
          </div>

          {/* Reading Meta Info - Chip Style */}
          <div className="flex flex-wrap justify-center items-center gap-3 mb-8">
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
            {/* Rewards - Chip Style */}
            {readingData.rewards && (
              <>
                <div className="px-4 py-2 rounded-full border border-warning/20 bg-warning/5 text-warning text-sm font-medium">
                  <span className="mr-2">⭐</span>
                  <span>+{readingData.rewards.exp} EXP</span>
                </div>
                <div className="px-4 py-2 rounded-full border border-accent/20 bg-accent/5 text-accent text-sm font-medium">
                  <span className="mr-2">🪙</span>
                  <span>+{readingData.rewards.coins} เหรียญ</span>
                </div>
              </>
            )}
          </div>
        </motion.header>

        {/* Cards Section */}
        <section className="mb-12">
          <h2 className="heading-2 text-base-content mb-8 text-center">
            ไพ่ที่หยิบได้
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {readingData.cards.map((card, index) => (
              <div key={card.id} className="text-center">
                <div className="relative group mb-4">
                  <CardImage
                    src={card.imageUrl}
                    alt={card.displayName}
                    position={index + 1}
                  />
                </div>
                <h3 className="font-semibold text-base-content text-sm sm:text-base mb-2">
                  {card.displayName}
                </h3>
                <p className="text-xs text-neutral-content leading-relaxed">
                  {card.shortMeaning}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Main Reading Content */}
        <article className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Main Reading */}
          <motion.section
            className="mb-12 border-l-4 border-primary/50 pl-8 py-6"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="heading-2 text-base-content mb-6">การทำนาย</h2>
            <div className="body-normal text-base-content leading-relaxed whitespace-pre-line">
              {readingData.reading.reading}
            </div>
          </motion.section>

          {/* Suggestions */}
          {/* {readingData.reading.suggestions &&
            readingData.reading.suggestions.length > 0 && (
              <motion.section
                className="mb-12 border-l-4 border-info/50 pl-8 py-6"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
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
            )} */}

          {/* Final Message */}
          {readingData.reading.final && (
            <motion.section
              className="mb-12 border-l-4 border-success/50 pl-8 py-6"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
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
              className="mb-12 text-center py-8 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="body-normal text-base-content leading-relaxed">
                {readingData.reading.end}
              </div>
            </motion.section>
          )}

          {/* Notice */}
          {readingData.reading.notice && (
            <motion.section
              className="mb-12 border-l-4 border-warning/50 pl-8 py-6"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="heading-3 mb-3 text-base-content">หมายเหตุ</h3>
              <p className="body-normal text-base-content leading-relaxed">
                {readingData.reading.notice}
              </p>
            </motion.section>
          )}

        </article>

        {/* Action Buttons - Improved Mobile UX */}
        <div className="pb-8">
          {/* Desktop Action Buttons */}
          <div className="hidden sm:block sticky bottom-8 max-w-2xl mx-auto">
            <motion.div
              className="card card-mystical p-6 shadow-xl bg-base-100/95 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
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
                  onClick={onDelete}
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
            </motion.div>
          </div>

          {/* Mobile Action Buttons - Inline Layout */}
          <div className="sm:hidden max-w-2xl mx-auto px-4">
            <div className="space-y-4">
              {/* Primary Action - Ask Again */}
              <button
                onClick={onAskAgain}
                className="btn btn-accent w-full btn-lg shadow-lg"
              >
                <span>🔮</span>
                <span>ถามใหม่</span>
              </button>

              {/* Secondary Actions - Horizontal */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleSave}
                  disabled={isSaved}
                  className={`btn btn-sm ${
                    isSaved
                      ? "btn-ghost text-success"
                      : "btn btn-ghost text-primary"
                  }`}
                >
                  <span className="text-xs">{isSaved ? "✓" : "💾"}</span>
                  <span className="text-xs">
                    {isSaved ? "บันทึกแล้ว" : "บันทึก"}
                  </span>
                </button>

                <button
                  onClick={onDelete}
                  className="btn btn-sm btn-ghost text-error"
                >
                  <span className="text-xs">🗑️</span>
                  <span className="text-xs">ลบ</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
