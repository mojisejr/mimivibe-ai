"use client";

import { safeFormatDistanceToNow } from "@/lib/utils/dateUtils";

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
}

interface ReadingCardProps {
  reading: Reading;
  onClick: () => void;
  onDelete?: (readingId: string) => void;
}

export const ReadingCard = ({ reading, onClick, onDelete }: ReadingCardProps) => {
  const truncateReading = (text: string, maxLength = 120) => {
    // Handle string input for reading preview
    const textString = String(text || '');
    
    if (textString.length <= maxLength) return textString;
    return textString.substring(0, maxLength).trim() + "...";
  };

  const getTopicEmoji = (topic: string | undefined) => {
    const topicEmojis: { [key: string]: string } = {
      "love": "💕",
      "career": "💼",
      "health": "🌿",
      "finance": "💰",
      "family": "👨‍👩‍👧‍👦",
      "personal": "🌟",
      "spiritual": "🔮",
      "travel": "✈️",
      "education": "📚",
    };
    
    const lowerTopic = (topic || "general").toLowerCase();
    for (const [key, emoji] of Object.entries(topicEmojis)) {
      if (lowerTopic.includes(key)) return emoji;
    }
    return "🔮";
  };

  return (
    <div 
      className="card card-mystical cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] h-full flex flex-col"
      onClick={onClick}
    >
      <div className="card-body flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="heading-3 line-clamp-2 flex-1 mr-2 text-sm md:text-base">
            {reading.question}
          </h3>
          <div className="text-xl md:text-2xl flex-shrink-0">
            {getTopicEmoji(reading.analysis?.topic)}
          </div>
        </div>

        {/* Date and Analysis */}
        <div className="flex items-center justify-between mb-3">
          <p className="body-small text-neutral-content">
            {safeFormatDistanceToNow(reading.createdAt, 'ไม่ทราบวันที่')}
          </p>
          <div className="badge badge-outline badge-sm">
            {reading.analysis?.topic || 'general'}
          </div>
        </div>

        {/* Cards Preview */}
        <div className="flex items-center space-x-1 mb-3">
          <span className="text-xs text-neutral-content mr-2">Cards:</span>
          <div className="flex -space-x-1">
            {(reading.cards || []).slice(0, 3).map((card, index) => (
              <div 
                key={card.id}
                className="w-6 h-9 rounded-sm overflow-hidden border border-base-300 bg-base-200"
                style={{ zIndex: (reading.cards || []).length - index }}
              >
                <img 
                  src={card.imageUrl} 
                  alt={card.nameTh}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {(reading.cards || []).length > 3 && (
              <div className="w-6 h-9 rounded-sm bg-base-300 border border-base-400 flex items-center justify-center text-xs font-bold">
                +{(reading.cards || []).length - 3}
              </div>
            )}
          </div>
        </div>

        {/* Reading Preview */}
        <div className="flex-1 mb-4">
          <p className="body-normal text-neutral-content line-clamp-3 text-sm">
            {truncateReading(reading.answer.reading)}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 text-xs md:text-sm">
              <div className="flex items-center space-x-1 text-primary">
                <span>⭐</span>
                <span>+{reading.expEarned}</span>
              </div>
              <div className="flex items-center space-x-1 text-warning">
                <span>🪙</span>
                <span>+{reading.coinsEarned}</span>
              </div>
            </div>
            {/* Delete Button */}
            {onDelete && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(reading.id);
                }}
                className="btn btn-xs btn-outline btn-error opacity-60 hover:opacity-100"
                title="ลบการทำนาย"
              >
                🗑️
              </button>
            )}
          </div>
          <button className="btn btn-sm btn-outline btn-primary w-full">
            View Full Reading
          </button>
        </div>
      </div>
    </div>
  );
};