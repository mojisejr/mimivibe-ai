'use client'

import { useState, useEffect } from 'react'
import { TarotCard, TarotCardData } from './TarotCard'
import { CardDetailModal } from './CardDetailModal'

export interface TarotCardGridProps {
  cards: TarotCardData[]
  isRevealed?: boolean
  className?: string
}

export function TarotCardGrid({ cards, isRevealed = false, className = '' }: TarotCardGridProps) {
  const [selectedCard, setSelectedCard] = useState<TarotCardData | null>(null)
  const [revealedCards, setRevealedCards] = useState(new Set<number>())

  useEffect(() => {
    if (isRevealed && cards.length > 0) {
      // Reveal cards one by one with staggered animation
      cards.forEach((card, index) => {
        setTimeout(() => {
          setRevealedCards(prev => new Set(Array.from(prev).concat(card.id)))
        }, index * 300)
      })
    }
  }, [isRevealed, cards])

  const handleCardClick = (card: TarotCardData) => {
    setSelectedCard(card)
  }

  // Determine grid layout based on number of cards
  const getGridClass = () => {
    switch (cards.length) {
      case 1:
        return 'grid-cols-1 max-w-xs mx-auto'
      case 2:
        return 'grid-cols-2 max-w-md mx-auto'
      case 3:
        return 'grid-cols-3 max-w-2xl mx-auto'
      case 4:
        return 'grid-cols-2 md:grid-cols-4 max-w-3xl mx-auto'
      case 5:
        return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5 max-w-4xl mx-auto'
      default:
        return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-5xl mx-auto'
    }
  }

  return (
    <>
      <div className={`w-full ${className}`}>
        <div className={`grid gap-4 ${getGridClass()}`}>
          {cards.map((card, index) => {
            const isCardRevealed = revealedCards.has(card.id)
            
            return (
              <div key={card.id} className="aspect-[3/4] w-full">
                <TarotCard
                  card={card}
                  isRevealed={isCardRevealed}
                  delay={index * 300}
                  onClick={() => handleCardClick(card)}
                  className="w-full h-full"
                />
              </div>
            )
          })}
        </div>
        
        {cards.length > 0 && (
          <div className="text-center mt-6">
            <p className="text-sm text-base-content/70">
              {isRevealed 
                ? "คลิกที่ไพ่เพื่อดูรายละเอียด" 
                : `ไพ่ทั้งหมด ${cards.length} ใบกำลังถูกเปิดผนึก...`
              }
            </p>
          </div>
        )}
      </div>

      {/* Card Detail Modal */}
      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          isOpen={!!selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </>
  )
}