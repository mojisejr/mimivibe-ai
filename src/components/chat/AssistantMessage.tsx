'use client'

import { Sparkles } from 'lucide-react'

export interface AssistantMessageProps {
  content: string
  timestamp: Date
}

export function AssistantMessage({ content, timestamp }: AssistantMessageProps) {
  return (
    <div className="flex items-start gap-3 max-w-3xl">
      <div className="avatar">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary-content" />
        </div>
      </div>
      
      <div className="flex-1">
        <div className="bg-base-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-base-content">
            {content}
          </div>
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