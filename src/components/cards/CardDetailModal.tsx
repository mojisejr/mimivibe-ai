'use client'

import { X, Sparkles, Tag } from 'lucide-react'
import { TarotCardData } from './TarotCard'

export interface CardDetailModalProps {
  card: TarotCardData
  isOpen: boolean
  onClose: () => void
}

export function CardDetailModal({ card, isOpen, onClose }: CardDetailModalProps) {
  if (!isOpen) return null

  const keywords = Array.isArray(card.keywords) 
    ? card.keywords 
    : (card.keywords || '').split(',').map(k => k.trim()).filter(Boolean)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-base-100 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 btn btn-circle btn-ghost btn-sm"
          >
            <X className="w-4 h-4" />
          </button>
          
          {/* Card Image */}
          <div className="relative h-64 bg-gradient-to-br from-purple-100 to-indigo-100">
            {card.imageUrl ? (
              <img 
                src={card.imageUrl}
                alt={card.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Sparkles className="w-16 h-16 text-purple-400" />
              </div>
            )}
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            
            {/* Position badge */}
            <div className="absolute bottom-4 left-4">
              <div className="badge badge-primary">
                ไพ่ใบที่ {card.position}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <h2 className="text-xl font-bold text-base-content mb-1">
              {card.displayName}
            </h2>
            <div className="flex items-center gap-2 text-sm text-base-content/70">
              <span>{card.arcana} Arcana</span>
              <span>•</span>
              <span>{card.name}</span>
            </div>
          </div>

          {/* Meaning */}
          <div>
            <h3 className="font-semibold text-base-content mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              ความหมาย
            </h3>
            <p className="text-base-content/80 leading-relaxed">
              {card.shortMeaning}
            </p>
          </div>

          {/* Keywords */}
          {keywords.length > 0 && (
            <div>
              <h3 className="font-semibold text-base-content mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" />
                คำสำคัญ
              </h3>
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, index) => (
                  <span 
                    key={index}
                    className="badge badge-outline badge-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Close button */}
          <div className="pt-4 border-t border-base-300">
            <button
              onClick={onClose}
              className="btn btn-primary btn-block"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}