'use client'

import { User } from 'lucide-react'
import { useUser } from '@clerk/nextjs'

export interface UserMessageProps {
  content: string
  timestamp: Date
}

export function UserMessage({ content, timestamp }: UserMessageProps) {
  const { user } = useUser()

  return (
    <div className="flex items-start gap-3 justify-end">
      <div className="max-w-3xl">
        <div className="bg-primary text-primary-content rounded-2xl rounded-br-sm px-4 py-3 shadow-sm">
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {content}
          </div>
        </div>
        
        <div className="text-xs text-base-content/50 text-right mt-1 px-1">
          {timestamp.toLocaleTimeString('th-TH', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
      
      <div className="avatar">
        <div className="w-8 h-8 rounded-full">
          {user?.imageUrl ? (
            <img 
              src={user.imageUrl} 
              alt={user.firstName || 'You'} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-primary/20 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}