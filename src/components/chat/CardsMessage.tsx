'use client'

import { Sparkles } from 'lucide-react'
import { TarotCardGrid } from '../cards/TarotCardGrid'
import { TarotCardData } from '../cards/TarotCard'

export interface CardsMessageProps {
  content: string
  cards: TarotCardData[]
  timestamp: Date
}

export function CardsMessage({ content, cards, timestamp }: CardsMessageProps) {
  return (
    <div className="flex items-start gap-3 max-w-4xl">
      <div className="avatar">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary-content" />
        </div>
      </div>
      
      <div className="flex-1">
        <div className="bg-base-200 rounded-2xl rounded-bl-sm p-4 shadow-sm">
          <div className="text-sm text-base-content mb-4">
            {content}
          </div>
          
          <TarotCardGrid 
            cards={cards} 
            isRevealed={true}
            className="mt-4"
          />
        </div>
        
        <div className="text-xs text-base-content/50 mt-1 px-1">
          MiMi • {timestamp.toLocaleTimeString('th-TH', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  )
}