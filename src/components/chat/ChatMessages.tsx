'use client'

import { Message } from './ChatContainer'
import { UserMessage } from './UserMessage'
import { AssistantMessage } from './AssistantMessage'
import { CardsMessage } from './CardsMessage'
import { ReadingMessage } from './ReadingMessage'

export interface ChatMessagesProps {
  messages: Message[]
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      {messages.map((message) => {
        switch (message.type) {
          case 'user':
            return (
              <UserMessage 
                key={message.id}
                content={message.content}
                timestamp={message.timestamp}
              />
            )
          
          case 'assistant':
          case 'system':
            return (
              <AssistantMessage 
                key={message.id}
                content={message.content}
                timestamp={message.timestamp}
              />
            )
          
          case 'cards':
            return (
              <CardsMessage 
                key={message.id}
                content={message.content}
                cards={message.data}
                timestamp={message.timestamp}
              />
            )
          
          case 'reading':
            return (
              <ReadingMessage 
                key={message.id}
                content={message.content}
                data={message.data}
                timestamp={message.timestamp}
              />
            )
          
          default:
            return null
        }
      })}
    </div>
  )
}