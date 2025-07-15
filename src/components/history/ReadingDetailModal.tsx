"use client";

import { useState } from "react";
import { TarotCard } from "@/components/cards/TarotCard";
import { Logo } from "@/components/ui";
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
  analysis: {
    mood: string;
    topic: string;
    timeframe: string;
  };
  answer: ReadingStructure; // Changed from 'reading: string' to full structure
  createdAt: string;
  expEarned: number;
  coinsEarned: number;
}

interface ReadingDetailModalProps {
  reading: Reading | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReadingDetailModal = ({
  reading,
  isOpen,
  onClose,
}: ReadingDetailModalProps) => {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

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
            <span className="text-sm text-neutral-content">Reading Details</span>
          </div>
          <button 
            onClick={onClose}
            className="btn btn-sm btn-ghost btn-circle"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                  <p>{safeFormatDistanceToNow(reading.createdAt, 'ไม่ทราบวันที่')}</p>
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
              <h3 className="heading-3 mb-4">Cards Drawn</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {reading.cards.map((card) => (
                  <TarotCard
                    key={card.id}
                    card={{
                      id: card.id,
                      name: card.name,
                      displayName: card.nameTh,
                      arcana: card.category,
                      shortMeaning: card.keywordsTh,
                      keywords: card.keywordsTh,
                      imageUrl: card.imageUrl,
                      position: 0,
                    }}
                    isRevealed={true}
                    onClick={() => setSelectedCard(card)}
                    className="cursor-pointer hover:scale-105 transition-transform"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Reading Header */}
          {reading.answer.header && (
            <div className="card card-mystical">
              <div className="card-body">
                <h3 className="heading-3 mb-4">Reading Summary</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="body-large font-medium text-primary mb-4">
                    {reading.answer.header}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Main Reading */}
          <div className="card card-mystical">
            <div className="card-body">
              <h3 className="heading-3 mb-4">Your Reading</h3>
              <div className="prose prose-sm max-w-none">
                {reading.answer.reading.split('\n').map((paragraph, index) => (
                  paragraph.trim() && (
                    <p key={index} className="body-normal mb-3 leading-relaxed">
                      {paragraph.trim()}
                    </p>
                  )
                ))}
              </div>
            </div>
          </div>

          {/* Suggestions */}
          {reading.answer.suggestions && reading.answer.suggestions.length > 0 && (
            <div className="card card-mystical">
              <div className="card-body">
                <h3 className="heading-3 mb-4">Suggestions</h3>
                <div className="space-y-2">
                  {reading.answer.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="text-primary mt-1">•</span>
                      <p className="body-normal leading-relaxed">{suggestion}</p>
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
                <h3 className="heading-3 mb-4">Final Thoughts</h3>
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
                <h3 className="heading-3 mb-4 text-warning">Important Notice</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="body-normal leading-relaxed text-warning">
                    {reading.answer.notice}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Next Questions */}
          {reading.answer.next_questions && reading.answer.next_questions.length > 0 && (
            <div className="card card-mystical">
              <div className="card-body">
                <h3 className="heading-3 mb-4">Suggested Next Questions</h3>
                <div className="space-y-2">
                  {reading.answer.next_questions.map((question, index) => (
                    <div key={index} className="p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors cursor-pointer">
                      <p className="body-normal">{question}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-base-300 p-4">
          <div className="flex justify-end space-x-2">
            <button onClick={onClose} className="btn btn-primary">
              Close
            </button>
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
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="text-center">
                  <img 
                    src={selectedCard.imageUrl} 
                    alt={selectedCard.nameTh}
                    className="w-48 h-auto mx-auto rounded-lg shadow-lg"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Keywords</h4>
                    <p className="text-neutral-content">{selectedCard.keywordsTh}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Meaning</h4>
                    <p className="text-neutral-content leading-relaxed">{selectedCard.meaningTh}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Category</h4>
                    <div className="badge badge-outline">{selectedCard.category}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};