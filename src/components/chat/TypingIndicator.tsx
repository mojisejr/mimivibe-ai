'use client'

import { Sparkles } from 'lucide-react'

export function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 max-w-3xl">
      <div className="avatar">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary-content" />
        </div>
      </div>
      
      <div className="bg-base-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          <span className="text-sm text-base-content/70">MiMi กำลังดูดวง</span>
          <div className="flex gap-1 ml-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}