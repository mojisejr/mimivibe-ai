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

interface Reading {
  id: string;
  question: string;
  cards: Card[];
  analysis: {
    mood: string;
    topic: string;
    timeframe: string;
  };
  reading: string;
  createdAt: string;
  expEarned: number;
  coinsEarned: number;
}

interface ReadingCardProps {
  reading: Reading;
  onClick: () => void;
}

export const ReadingCard = ({ reading, onClick }: ReadingCardProps) => {
  const truncateReading = (text: string, maxLength = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  const getTopicEmoji = (topic: string) => {
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
    
    const lowerTopic = topic.toLowerCase();
    for (const [key, emoji] of Object.entries(topicEmojis)) {
      if (lowerTopic.includes(key)) return emoji;
    }
    return "🔮";
  };

  return (
    <div 
      className="card card-mystical cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
      onClick={onClick}
    >
      <div className="card-body">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="heading-3 line-clamp-2 flex-1 mr-2">
            {reading.question}
          </h3>
          <div className="text-2xl">
            {getTopicEmoji(reading.analysis.topic)}
          </div>
        </div>

        {/* Date and Analysis */}
        <div className="flex items-center justify-between mb-3">
          <p className="body-small text-neutral-content">
            {safeFormatDistanceToNow(reading.createdAt, 'ไม่ทราบวันที่')}
          </p>
          <div className="badge badge-outline badge-sm">
            {reading.analysis.topic}
          </div>
        </div>

        {/* Cards Preview */}
        <div className="flex items-center space-x-1 mb-3">
          <span className="text-xs text-neutral-content mr-2">Cards:</span>
          <div className="flex -space-x-1">
            {reading.cards.slice(0, 3).map((card, index) => (
              <div 
                key={card.id}
                className="w-6 h-9 rounded-sm overflow-hidden border border-base-300 bg-base-200"
                style={{ zIndex: reading.cards.length - index }}
              >
                <img 
                  src={card.imageUrl} 
                  alt={card.nameTh}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {reading.cards.length > 3 && (
              <div className="w-6 h-9 rounded-sm bg-base-300 border border-base-400 flex items-center justify-center text-xs font-bold">
                +{reading.cards.length - 3}
              </div>
            )}
          </div>
        </div>

        {/* Reading Preview */}
        <p className="body-normal text-neutral-content mb-4 line-clamp-3">
          {truncateReading(reading.reading)}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 text-sm">
            <div className="flex items-center space-x-1 text-primary">
              <span>⭐</span>
              <span>+{reading.expEarned}</span>
            </div>
            <div className="flex items-center space-x-1 text-warning">
              <span>🪙</span>
              <span>+{reading.coinsEarned}</span>
            </div>
          </div>
          <button className="btn btn-sm btn-outline btn-primary">
            View Full Reading
          </button>
        </div>
      </div>
    </div>
  );
};