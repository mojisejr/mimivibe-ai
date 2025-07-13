'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { Send, Loader2 } from 'lucide-react'

export interface ChatInputProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "พิมพ์คำถามของคุณที่นี่..." 
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = () => {
    if (!message.trim() || disabled) return
    
    onSendMessage(message.trim())
    setMessage('')
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    
    // Auto-resize textarea
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  }

  return (
    <div className="p-4">
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="textarea textarea-bordered w-full min-h-[48px] max-h-[120px] resize-none pr-12 
                     focus:border-primary focus:outline-none bg-base-100
                     placeholder:text-base-content/50"
            rows={1}
          />
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={disabled || !message.trim()}
            className="absolute right-2 bottom-2 btn btn-primary btn-sm btn-square
                     disabled:btn-disabled disabled:opacity-50"
          >
            {disabled ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
      
      <div className="text-xs text-base-content/60 text-center mt-2 max-w-4xl mx-auto">
        กด Enter เพื่อส่งข้อความ | Shift + Enter เพื่อขึ้นบรรทัดใหม่
      </div>
    </div>
  )
}