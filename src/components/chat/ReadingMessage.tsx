'use client'

import { Sparkles, Gift, Star, Coins } from 'lucide-react'

export interface ReadingData {
  reading: {
    header: string
    reading: string
    suggestions: string[]
    final: string[]
    end: string
    notice: string
  }
  questionAnalysis: {
    mood: string
    topic: string
    period: string
  }
  rewards?: {
    exp: number
    coins: number
  }
}

export interface ReadingMessageProps {
  content: string
  data: ReadingData
  timestamp: Date
}

export function ReadingMessage({ content, data, timestamp }: ReadingMessageProps) {
  const { reading, questionAnalysis, rewards } = data

  return (
    <div className="flex items-start gap-3 max-w-4xl">
      <div className="avatar">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary-content" />
        </div>
      </div>
      
      <div className="flex-1">
        <div className="bg-gradient-to-br from-base-200 to-base-300/50 rounded-2xl rounded-bl-sm p-6 shadow-lg">
          {/* Question Analysis */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="badge badge-primary badge-sm">
              💭 {questionAnalysis.mood}
            </div>
            <div className="badge badge-secondary badge-sm">
              📋 {questionAnalysis.topic}
            </div>
            <div className="badge badge-accent badge-sm">
              ⏰ {questionAnalysis.period}
            </div>
          </div>

          {/* Header */}
          {reading.header && (
            <div className="text-base font-medium text-primary mb-4 border-l-4 border-primary pl-4">
              {reading.header}
            </div>
          )}

          {/* Main Reading */}
          <div className="prose prose-sm max-w-none text-base-content mb-6">
            <div className="whitespace-pre-wrap leading-relaxed">
              {reading.reading}
            </div>
          </div>

          {/* Suggestions */}
          {reading.suggestions && reading.suggestions.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-base-content mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                คำแนะนำ
              </h4>
              <ul className="space-y-2">
                {reading.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-base-content/80">
                    <span className="text-primary font-bold mt-0.5">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Final Thoughts */}
          {reading.final && reading.final.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-base-content mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" />
                ข้อคิด
              </h4>
              <div className="space-y-2">
                {reading.final.map((thought, index) => (
                  <p key={index} className="text-sm text-base-content/80 italic">
                    &ldquo;{thought}&rdquo;
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* End Message */}
          {reading.end && (
            <div className="text-sm text-primary font-medium mb-4 text-center bg-primary/10 rounded-lg p-3">
              {reading.end}
            </div>
          )}

          {/* Notice */}
          {reading.notice && (
            <div className="text-xs text-base-content/60 text-center mb-4 border-t border-base-300 pt-4">
              {reading.notice}
            </div>
          )}

          {/* Rewards */}
          {rewards && (rewards.exp > 0 || rewards.coins > 0) && (
            <div className="bg-success/10 border border-success/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-4 h-4 text-success" />
                <span className="text-sm font-semibold text-success">คุณได้รับรางวัล!</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                {rewards.exp > 0 && (
                  <div className="flex items-center gap-1 text-success">
                    <Star className="w-3 h-3" />
                    <span>+{rewards.exp} EXP</span>
                  </div>
                )}
                {rewards.coins > 0 && (
                  <div className="flex items-center gap-1 text-success">
                    <Coins className="w-3 h-3" />
                    <span>+{rewards.coins} เหรียญ</span>
                  </div>
                )}
              </div>
            </div>
          )}
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