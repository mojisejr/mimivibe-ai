'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'

export interface TarotCardData {
  id: number
  name: string
  displayName: string
  arcana: string
  shortMeaning: string
  keywords: string | string[]
  imageUrl: string
  position: number
}

export interface TarotCardProps {
  card: TarotCardData
  isRevealed?: boolean
  delay?: number
  onClick?: () => void
  className?: string
}

export function TarotCard({ 
  card, 
  isRevealed = false, 
  delay = 0,
  onClick,
  className = ''
}: TarotCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleClick = () => {
    if (!isRevealed) return
    setIsFlipped(!isFlipped)
    onClick?.()
  }

  const keywords = Array.isArray(card.keywords) 
    ? card.keywords.join(', ')
    : card.keywords || ''

  return (
    <div 
      className={`perspective-1000 cursor-pointer ${className}`}
      onClick={handleClick}
      style={{ 
        animationDelay: `${delay}ms`,
        animation: isRevealed ? 'cardReveal 0.8s ease-out forwards' : 'none'
      }}
    >
      <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${
        isFlipped ? 'rotate-y-180' : ''
      }`}>
        {/* Card Back */}
        <div className="absolute inset-0 backface-hidden rounded-2xl bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 shadow-xl">
          <div className="w-full h-full rounded-2xl border-2 border-purple-400/30 p-4 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-purple-400/20 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-purple-200" />
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-purple-100 mb-2">
                MiMi Tarot
              </div>
              <div className="text-sm text-purple-200/80">
                ไพ่ใบที่ {card.position}
              </div>
            </div>
            
            {/* Mystical pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-400 via-transparent to-transparent"></div>
            </div>
          </div>
        </div>

        {/* Card Front */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl bg-gradient-to-br from-white to-purple-50 shadow-xl">
          <div className="w-full h-full rounded-2xl border-2 border-purple-200 overflow-hidden">
            {/* Card Image */}
            <div className="relative h-2/3 bg-gradient-to-br from-purple-100 to-indigo-100">
              {card.imageUrl ? (
                <img 
                  src={card.imageUrl}
                  alt={card.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-purple-400" />
                </div>
              )}
              
              {/* Arcana badge */}
              <div className="absolute top-2 right-2">
                <div className="badge badge-primary badge-sm">
                  {card.arcana}
                </div>
              </div>
            </div>
            
            {/* Card Info */}
            <div className="p-3 h-1/3 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-gray-800 mb-1 leading-tight">
                  {card.displayName}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-2 leading-tight">
                  {card.shortMeaning}
                </p>
              </div>
              
              {keywords && (
                <div className="text-xs text-purple-600 font-medium mt-1">
                  {keywords.length > 40 ? `${keywords.substring(0, 40)}...` : keywords}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}