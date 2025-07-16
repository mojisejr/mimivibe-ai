"use client";

import { useState } from "react";
import { safeFormatDistanceToNow } from "@/lib/utils/dateUtils";
import { CardFallback } from "@/components/cards/CardFallback";

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
  answer: ReadingStructure; // Changed from 'reading: any' to full structure
  createdAt: string;
  expEarned: number;
  coinsEarned: number;
  isReviewed?: boolean; // Add review status
}

interface ReadingCardProps {
  reading: Reading;
  onClick: () => void;
  onDelete?: (readingId: string) => void;
}

// Card Preview Component with error handling
const CardPreview = ({ card, index, totalCards }: { card: Card; index: number; totalCards: number }) => {
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
  const truncateReading = (text: string, maxLength = 120) => {
    // Handle string input for reading preview
    const textString = String(text || "");

    if (textString.length <= maxLength) return textString;
    return textString.substring(0, maxLength).trim() + "...";
  };

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

  return (
    <div
      className="card bg-base-100 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer h-full flex flex-col border border-base-300/50 hover:border-primary/30"
      onClick={onClick}
    >
      <div className="card-body flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-semibold text-base-content line-clamp-2 flex-1 mr-3 text-sm md:text-base leading-tight">
            {reading.question}
          </h3>
          <div className="text-xl md:text-2xl flex-shrink-0 bg-primary/10 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center">
            {getTopicEmoji(reading.analysis?.topic)}
          </div>
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
            {/* Review Status Indicator */}
            {reading.isReviewed && (
              <div className="flex items-center text-xs text-success">
                <span className="mr-1">⭐</span>
                <span className="hidden sm:inline">รีวิวแล้ว</span>
              </div>
            )}
          </div>
          
          {reading.analysis?.topic && (
            <div className="badge badge-outline badge-xs text-xs">
              {reading.analysis.topic}
            </div>
          )}
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
              <div className="flex items-center space-x-1">
                <span className="text-primary">⭐</span>
                <span className="text-neutral-content">+{reading.expEarned}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-warning">🪙</span>
                <span className="text-neutral-content">+{reading.coinsEarned}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 items-center justify-between">
            <button className="btn btn-sm btn-primary flex-1 text-primary-content">
              อ่านรายละเอียด
            </button>
            {/* Delete Button */}
            {onDelete && (
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
