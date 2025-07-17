"use client";

import { useState, useEffect } from "react";
import { Logo } from "@/components/ui";
import { safeFormatDistanceToNow } from "@/lib/utils/dateUtils";
import { ReviewModal, ReviewData } from "@/components/modals/ReviewModal";
import { useToast } from "@/components/ui/ToastContainer";

interface Card {
  id: number;
  name: string;
  nameTh: string;
  imageUrl: string;
  keywords: string;
  keywordsTh: string;
  meaning: string;
  meaningTh: string;
  category: string;
}

interface ReadingStructure {
  header: string;
  cards_reading: any[];
  reading: string;
  suggestions: string[];
  next_questions: string[];
  final: string;
  end: string;
  notice: string;
}

interface Reading {
  id: string;
  question: string;
  cards: Card[];
  analysis: {
    mood: string;
    topic: string;
    timeframe: string;
  };
  answer: ReadingStructure; // Changed from 'reading: string' to full structure
  createdAt: string;
  expEarned: number;
  coinsEarned: number;
  isReviewed?: boolean; // Add review status
  reviewAccuracy?: number; // Add review percentage (0-100)
  reviewComment?: string; // Add review comment
}

interface ReadingDetailModalProps {
  reading: Reading | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (readingId: string) => void;
}

// Enhanced Card Display Component with error handling
const EnhancedCardDisplay = ({
  card,
  onClick,
}: {
  card: Card;
  onClick: () => void;
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="relative cursor-pointer hover:scale-105 transition-transform duration-200"
      onClick={onClick}
      title={card.nameTh || card.name}
    >
      {card.imageUrl && !imageError ? (
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden border border-base-300 bg-base-200 shadow-md hover:shadow-lg transition-shadow duration-200">
          <img
            src={card.imageUrl}
            alt={card.nameTh || card.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            loading="lazy"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-primary/10 opacity-0 hover:opacity-100 transition-opacity duration-200" />
        </div>
      ) : (
        <div className="aspect-[2/3] bg-gradient-to-br from-primary/20 to-secondary/30 rounded-lg border border-primary/30 flex items-center justify-center transition-colors duration-200 hover:from-primary/30 hover:to-secondary/40 shadow-md hover:shadow-lg">
          <div className="text-primary text-2xl">🔮</div>
        </div>
      )}
    </div>
  );
};

// Card Detail Image Component with error handling
const CardDetailImage = ({ card }: { card: Card }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="w-48 h-auto mx-auto">
      {card.imageUrl && !imageError ? (
        <img
          src={card.imageUrl}
          alt={card.nameTh || card.name}
          className="w-full h-auto rounded-lg shadow-lg"
          onError={() => setImageError(true)}
          loading="lazy"
        />
      ) : (
        <div className="aspect-[2/3] bg-gradient-to-br from-primary/20 to-secondary/30 rounded-lg border border-primary/30 flex items-center justify-center shadow-lg">
          <div className="text-center">
            <div className="text-primary text-4xl mb-2">🔮</div>
            <p className="text-sm text-neutral-content">
              {card.nameTh || card.name}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export const ReadingDetailModal = ({
  reading,
  isOpen,
  onClose,
  onDelete,
}: ReadingDetailModalProps) => {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const { addToast } = useToast();

  // Update review status when reading changes
  useEffect(() => {
    if (reading) {
      // Check if reading actually has review data, not just isReviewed flag
      const actuallyReviewed = reading.isReviewed === true && reading.reviewAccuracy !== undefined;
      setHasReviewed(actuallyReviewed);
    }
  }, [reading]);

  const handleReviewSubmit = async (reviewData: ReviewData) => {
    if (!reading) return;

    setIsSubmittingReview(true);

    try {
      const response = await fetch(`/api/reviews/${reading.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit review");
      }

      // Update local state with proper review data
      setHasReviewed(true);
      setIsReviewModalOpen(false);
      
      // Update reading object with review data for immediate display
      if (reading) {
        reading.isReviewed = true;
        reading.reviewAccuracy = reviewData.accurateLevel;
        reading.reviewComment = reviewData.comment;
      }

      // Show success toast
      addToast({
        type: "success",
        title: "รีวิวสำเร็จ!",
        message:
          "ขอบคุณสำหรับรีวิวของคุณ คุณได้รับรางวัล +10 EXP และ +2 เหรียญแล้ว",
        duration: 4000,
      });
    } catch (error) {
      console.error("Review submission error:", error);

      // Show error toast
      addToast({
        type: "error",
        title: "เกิดข้อผิดพลาด",
        message:
          error instanceof Error
            ? error.message
            : "ไม่สามารถส่งรีวิวได้ กรุณาลองใหม่อีกครั้ง",
        duration: 5000,
      });

      throw error; // Re-throw to let ReviewModal handle the error
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (!isOpen || !reading) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-8 bg-base-100 rounded-lg shadow-2xl z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <div className="flex items-center space-x-2">
            <Logo size="sm" showText />
            <span className="text-sm text-neutral-content">
              Reading Details
            </span>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-ghost btn-circle">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Question & Meta */}
          <div className="card card-mystical">
            <div className="card-body">
              <div className="flex items-start justify-between mb-4">
                <h2 className="heading-3 flex-1 mr-4">{reading.question}</h2>
                <div className="text-right text-sm text-neutral-content">
                  <p>
                    {safeFormatDistanceToNow(
                      reading.createdAt,
                      "ไม่ทราบวันที่"
                    )}
                  </p>
                </div>
              </div>

              {/* Analysis Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="badge badge-primary">
                  <span className="mr-1">😊</span>
                  {reading.analysis.mood}
                </div>
                <div className="badge badge-secondary">
                  <span className="mr-1">📖</span>
                  {reading.analysis.topic}
                </div>
                <div className="badge badge-accent">
                  <span className="mr-1">⏰</span>
                  {reading.analysis.timeframe}
                </div>
              </div>

              {/* Rewards */}
              <div className="flex items-center justify-end space-x-4 text-sm">
                <div className="flex items-center space-x-1 text-primary">
                  <span>⭐</span>
                  <span>+{reading.expEarned} EXP</span>
                </div>
                <div className="flex items-center space-x-1 text-warning">
                  <span>🪙</span>
                  <span>+{reading.coinsEarned} Coins</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cards */}
          <div className="card card-mystical">
            <div className="card-body">
              <h3 className="heading-3 mb-4">ไพ่ที่จั่วได้</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {reading.cards.map((card) => (
                  <EnhancedCardDisplay
                    key={card.id}
                    card={card}
                    onClick={() => setSelectedCard(card)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Main Reading */}
          <div className="card card-mystical">
            <div className="card-body">
              <h3 className="heading-3 mb-4">การทำนาย</h3>
              <div className="prose prose-sm max-w-none">
                {reading.answer.reading.split("\n").map(
                  (paragraph, index) =>
                    paragraph.trim() && (
                      <p
                        key={index}
                        className="body-normal mb-3 leading-relaxed"
                      >
                        {paragraph.trim()}
                      </p>
                    )
                )}
              </div>
            </div>
          </div>

          {/* Suggestions */}
          {reading.answer.suggestions &&
            reading.answer.suggestions.length > 0 && (
              <div className="card card-mystical">
                <div className="card-body">
                  <h3 className="heading-3 mb-4">คำแนะนำ</h3>
                  <div className="space-y-2">
                    {reading.answer.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-primary mt-1">•</span>
                        <p className="body-normal leading-relaxed">
                          {suggestion}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          {/* Final Thoughts */}
          {reading.answer.final && (
            <div className="card card-mystical">
              <div className="card-body">
                <h3 className="heading-3 mb-4">ข้อสรุป</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="body-normal leading-relaxed">
                    {reading.answer.final}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* End Message */}
          {reading.answer.end && (
            <div className="card card-mystical">
              <div className="card-body">
                <h3 className="heading-3 mb-4">Closing</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="body-normal leading-relaxed text-neutral-content">
                    {reading.answer.end}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notice */}
          {reading.answer.notice && (
            <div className="card card-mystical border-warning">
              <div className="card-body">
                <h3 className="heading-3 mb-4 text-warning">หมายเหตุ</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="body-normal leading-relaxed text-warning">
                    {reading.answer.notice}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Next Questions */}
          {reading.answer.next_questions &&
            reading.answer.next_questions.length > 0 && (
              <div className="card card-mystical">
                <div className="card-body">
                  <h3 className="heading-3 mb-4">Suggested Next Questions</h3>
                  <div className="space-y-2">
                    {reading.answer.next_questions.map((question, index) => (
                      <div
                        key={index}
                        className="p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors cursor-pointer"
                      >
                        <p className="body-normal">{question}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          {/* Review Status Display */}
          {hasReviewed && (
            <div className="card card-mystical border-success">
              <div className="card-body">
                <h3 className="heading-3 mb-4 text-success">รีวิวของคุณ</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="body-normal">ระดับความแม่นยำ:</span>
                    <div className="flex items-center space-x-2">
                      <div className="text-2xl">
                        {reading.reviewAccuracy === 0
                          ? "😞"
                          : reading.reviewAccuracy === 20
                          ? "🙁"
                          : reading.reviewAccuracy === 50
                          ? "😐"
                          : reading.reviewAccuracy === 80
                          ? "😊"
                          : "🤩"}
                      </div>
                      <span className="font-semibold text-success">
                        {reading.reviewAccuracy}%
                      </span>
                    </div>
                  </div>
                  {reading.reviewComment && (
                    <div className="border-t border-success/20 pt-3">
                      <h4 className="font-semibold mb-2">ความคิดเห็น:</h4>
                      <p className="body-normal bg-success/10 p-3 rounded-lg leading-relaxed">
                        {reading.reviewComment}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-base-300 p-4">
          <div className="flex justify-between items-center gap-2">
            {/* Delete Button */}
            {onDelete && (
              <button
                onClick={() => onDelete(reading.id)}
                className="btn btn-sm btn-outline btn-error"
              >
                <span>🗑️</span>
                <span className="hidden sm:inline">ลบการทำนาย</span>
              </button>
            )}

            {/* Review Button */}
            {!hasReviewed && (
              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="btn btn-sm btn-primary"
                disabled={isSubmittingReview}
              >
                <span>⭐</span>
                <span className="hidden sm:inline">รีวิวการทำนาย</span>
              </button>
            )}

            {hasReviewed && (
              <div className="flex items-center text-sm text-success">
                <span className="mr-1">✅</span>
                <span className="hidden sm:inline">รีวิวแล้ว</span>
              </div>
            )}

            {/* Close Button */}
            <div className="flex space-x-2 ml-auto">
              <button onClick={onClose} className="btn btn-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Card Detail Modal */}
      {selectedCard && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60"
            onClick={() => setSelectedCard(null)}
          />
          <div className="fixed inset-4 md:inset-16 bg-base-100 rounded-lg shadow-2xl z-70 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="heading-2">{selectedCard.nameTh}</h3>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="btn btn-sm btn-ghost btn-circle"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="text-center">
                  <CardDetailImage card={selectedCard} />
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Keywords</h4>
                    <p className="text-neutral-content">
                      {selectedCard.keywordsTh}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Meaning</h4>
                    <p className="text-neutral-content leading-relaxed">
                      {selectedCard.meaningTh}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Category</h4>
                    <div className="badge badge-outline">
                      {selectedCard.category}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Review Modal */}
      <ReviewModal
        readingId={reading?.id || null}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmit={handleReviewSubmit}
        isSubmitting={isSubmittingReview}
      />
    </>
  );
};
