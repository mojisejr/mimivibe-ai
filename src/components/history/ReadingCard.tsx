"use client";

import { useState } from "react";
import { safeFormatDistanceToNow } from "@/lib/utils/dateUtils";
import { ReadingStatus } from "@/types/reading";

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
  analysis?: {
    mood?: string;
    topic?: string;
    timeframe?: string;
  };
  answer: ReadingStructure | null; // Can be null for pending/processing readings
  status: ReadingStatus; // Add reading status
  createdAt: string;
  expEarned: number;
  coinsEarned: number;
  isReviewed?: boolean; // Add review status
  reviewAccuracy?: number; // Add review percentage (0-100)
}

interface ReadingCardProps {
  reading: Reading;
  onClick: () => void;
  onDelete?: (readingId: string) => void;
}

// Card Preview Component with error handling
const CardPreview = ({
  card,
  index,
  totalCards,
}: {
  card: Card;
  index: number;
  totalCards: number;
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="relative w-6 h-9 rounded-sm overflow-hidden border border-base-300 bg-base-200 group"
      style={{ zIndex: totalCards - index }}
      title={card.nameTh || card.name}
    >
      {card.imageUrl && !imageError ? (
        <img
          src={card.imageUrl}
          alt={card.nameTh || card.name}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
          onError={() => setImageError(true)}
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/30 rounded border border-primary/30 flex items-center justify-center transition-colors duration-200 group-hover:from-primary/30 group-hover:to-secondary/40">
          <div className="text-primary text-xs">🔮</div>
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
    </div>
  );
};

export const ReadingCard = ({
  reading,
  onClick,
  onDelete,
}: ReadingCardProps) => {
  const getTopicEmoji = (topic: string | undefined) => {
    const topicEmojis: { [key: string]: string } = {
      love: "💕",
      career: "💼",
      health: "🌿",
      finance: "💰",
      family: "👨‍👩‍👧‍👦",
      personal: "🌟",
      spiritual: "🔮",
      travel: "✈️",
      education: "📚",
    };

    const lowerTopic = (topic || "general").toLowerCase();
    for (const [key, emoji] of Object.entries(topicEmojis)) {
      if (lowerTopic.includes(key)) return emoji;
    }
    return "🔮";
  };

  const getStatusDisplay = (status: ReadingStatus) => {
    switch (status) {
      case ReadingStatus.PENDING:
        return {
          text: "รอการประมวลผล",
          emoji: "⏳",
          color: "text-warning",
          bgColor: "bg-warning/10",
          borderColor: "border-warning/30",
        };
      case ReadingStatus.PROCESSING:
        return {
          text: "กำลังประมวลผล",
          emoji: "🔮",
          color: "text-info",
          bgColor: "bg-info/10",
          borderColor: "border-info/30",
        };
      case ReadingStatus.COMPLETED:
        return {
          text: "เสร็จสมบูรณ์",
          emoji: "✅",
          color: "text-success",
          bgColor: "bg-success/10",
          borderColor: "border-success/30",
        };
      case ReadingStatus.FAILED:
        return {
          text: "ประมวลผลไม่สำเร็จ",
          emoji: "❌",
          color: "text-error",
          bgColor: "bg-error/10",
          borderColor: "border-error/30",
        };
      default:
        return {
          text: "ไม่ทราบสถานะ",
          emoji: "❓",
          color: "text-neutral",
          bgColor: "bg-neutral/10",
          borderColor: "border-neutral/30",
        };
    }
  };

  const statusDisplay = getStatusDisplay(reading.status);
  const isClickable = reading.status === ReadingStatus.COMPLETED;
  const isProcessing =
    reading.status === ReadingStatus.PROCESSING ||
    reading.status === ReadingStatus.PENDING;

  return (
    <div
      className={`card bg-base-100 shadow-md transition-all duration-300 h-full flex flex-col border ${
        isClickable
          ? "hover:shadow-xl hover:scale-[1.02] cursor-pointer border-base-300/50 hover:border-primary/30"
          : `cursor-not-allowed opacity-75 ${statusDisplay.borderColor}`
      } ${statusDisplay.bgColor}`}
      onClick={isClickable ? onClick : undefined}
    >
      <div className="card-body flex-1 flex flex-col">
        {/* Header */}
        <div className="flex flex-col items-start justify-between mb-3">
          <h3 className="font-semibold text-base-content line-clamp-2 flex-1 mr-3 text-sm md:text-base leading-tight">
            {reading.question}
          </h3>
          <div className="flex items-center space-x-2">
            {reading.analysis?.topic && (
              <div className="badge badge-primary badge-sm text-xs">
                {reading.analysis.topic}
              </div>
            )}
          </div>
          {/* <div className="text-xl md:text-2xl flex-shrink-0 bg-primary/10 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center">
            {getTopicEmoji(reading.analysis?.topic)}
          </div> */}
        </div>

        {/* Status Display */}
        <div
          className={`flex items-center justify-center mb-3 px-3 py-2 rounded-lg border ${statusDisplay.borderColor} ${statusDisplay.bgColor}`}
        >
          <span className="text-lg mr-2">{statusDisplay.emoji}</span>
          <span className={`text-sm font-medium ${statusDisplay.color}`}>
            {statusDisplay.text}
          </span>
          {isProcessing && (
            <div className="ml-2 loading loading-spinner loading-xs"></div>
          )}
        </div>

        {/* Cards Preview */}
        <div className="flex items-center space-x-1 mb-3">
          <span className="text-xs text-neutral-content mr-2">ไพ่:</span>
          <div className="flex -space-x-1">
            {(reading.cards || []).slice(0, 3).map((card, index) => (
              <CardPreview
                key={card.id}
                card={card}
                index={index}
                totalCards={reading.cards?.length || 0}
              />
            ))}
            {(reading.cards || []).length > 3 && (
              <div className="w-6 h-9 rounded-sm bg-gradient-to-br from-primary/10 to-secondary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">
                +{(reading.cards || []).length - 3}
              </div>
            )}
          </div>
        </div>

        {/* Date and Analysis */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <p className="text-xs text-neutral-content flex items-center">
              <span className="mr-1">🕐</span>
              {safeFormatDistanceToNow(reading.createdAt, "ไม่ทราบวันที่")}
            </p>
          </div>
        </div>

        {/* Reading Preview */}
        {/* <div className="flex-1 mb-4">
          <p className="body-normal text-neutral-content line-clamp-3 text-sm">
            {truncateReading(reading.answer.reading)}
          </p>
        </div> */}

        {/* Footer */}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3 text-xs md:text-sm">
              {/* <div className="flex items-center space-x-1">
                <span className="text-primary">⭐</span>
                <span className="text-neutral-content">
                  +{reading.expEarned}
                </span>
              </div> */}
              <div className="flex items-center space-x-1">
                <span className="text-warning">🪙</span>
                <span className="text-neutral-content">
                  +{reading.coinsEarned}
                </span>
              </div>
            </div>
          </div>
          {/* Review Status Display */}
          {reading.isReviewed && reading.reviewAccuracy !== undefined && (
            <div className="flex items-center justify-center mb-3">
              <div className="flex items-center space-x-2 text-xs text-success bg-success/10 px-3 py-1 rounded-full">
                <span className="text-sm">
                  {reading.reviewAccuracy === 0
                    ? "😞"
                    : reading.reviewAccuracy === 20
                    ? "🙁"
                    : reading.reviewAccuracy === 50
                    ? "😐"
                    : reading.reviewAccuracy === 80
                    ? "😊"
                    : "🤩"}
                </span>
                <span className="font-semibold">
                  รีวิวแล้ว {reading.reviewAccuracy}%
                </span>
              </div>
            </div>
          )}
          <div className="flex gap-2 items-center justify-between">
            {reading.status === ReadingStatus.COMPLETED ? (
              <button className="btn btn-sm btn-primary flex-1 text-primary-content">
                อ่านรายละเอียด
              </button>
            ) : reading.status === ReadingStatus.FAILED ? (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Navigate to ask page with the same question
                    window.location.href = `/ask?question=${encodeURIComponent(
                      reading.question
                    )}`;
                  }}
                  className="btn btn-sm btn-warning flex-1"
                >
                  ลองใหม่
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onDelete) onDelete(reading.id);
                  }}
                  className="btn btn-sm btn-error btn-square"
                  title="ลบการทำนาย"
                >
                  🗑️
                </button>
              </>
            ) : (
              <button className="btn btn-sm btn-disabled flex-1" disabled>
                {reading.status === ReadingStatus.PENDING
                  ? "รอการประมวลผล..."
                  : "กำลังประมวลผล..."}
              </button>
            )}

            {/* Delete Button for completed readings */}
            {reading.status === ReadingStatus.COMPLETED && onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(reading.id);
                }}
                className="btn btn-sm btn-ghost btn-square opacity-60 hover:opacity-100 hover:bg-error/10 hover:text-error"
                title="ลบการทำนาย"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
