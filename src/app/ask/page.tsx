'use client'

import { ChatContainer } from '@/components/chat/ChatContainer'
import { BottomNavigation } from '@/components/navigation/BottomNavigation'

export default function AskPage() {
  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col pb-20 md:pb-0">
        <ChatContainer className="flex-1" />
      </div>
      
      {/* Bottom Navigation (Mobile Only) */}
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </div>
  )
}