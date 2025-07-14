"use client";

import { useState, useRef, useEffect } from "react";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";

export interface Message {
  id: string;
  type: "user" | "assistant" | "system" | "cards" | "reading";
  content: string;
  timestamp: Date;
  data?: any;
}

export interface ChatContainerProps {
  className?: string;
}

export function ChatContainer({ className = "" }: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "assistant",
      content:
        "สวัสดีค่ะ! ฉันคือ MiMi ผู้ช่วยดูดวงยิปซีของคุณ ✨\n\nถามคำถามอะไรก็ได้เกี่ยวกับชีวิต ความรัก การงาน หรือสิ่งที่คุณอยากรู้ ฉันจะช่วยเลือกไพ่ยิปซีและให้คำแนะนำที่เหมาะกับคุณค่ะ",
      timestamp: new Date(),
    },
  ]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isProcessing) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);
    setIsTyping(true);

    try {
      console.log('📡 Starting SSE request for question:', content.trim())
      
      // Call the reading API with streaming
      const response = await fetch("/api/readings/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: content.trim(),
          useStream: true,
        }),
      });

      console.log('📡 SSE Response received:', response.status, response.statusText)
      console.log('📡 SSE Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        throw new Error("Failed to get reading");
      }

      // Handle SSE streaming
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      console.log('📡 SSE Reader created:', !!reader)

      if (reader) {
        console.log('📡 Starting SSE stream reading...')
        let chunkCount = 0
        
        while (true) {
          const { value, done } = await reader.read();
          chunkCount++
          
          console.log(`📡 SSE Chunk ${chunkCount}:`, { hasValue: !!value, done, valueLength: value?.length })
          
          if (done) {
            console.log('📡 SSE Stream finished')
            break;
          }

          const chunk = decoder.decode(value);
          console.log('📡 SSE Decoded chunk:', chunk)
          
          const lines = chunk.split("\n");
          console.log('📡 SSE Lines:', lines)

          let currentEvent = '';
          
          for (const line of lines) {
            console.log('📡 SSE Processing line:', line)
            
            if (line.startsWith("event: ")) {
              currentEvent = line.slice(7).trim();
              console.log('📡 SSE Event type:', currentEvent)
            }
            
            if (line.startsWith("data: ")) {
              try {
                const dataStr = line.slice(6)
                console.log('📡 SSE Data string:', dataStr)
                
                const data = JSON.parse(dataStr);
                console.log('📡 SSE Parsed data:', data)

                if (currentEvent === "progress") {
                  console.log('📡 SSE Progress event:', data)
                  // Update typing indicator with progress
                  setIsTyping(true);
                }

                if (currentEvent === "reading") {
                  console.log('📡 SSE Reading event:', data)
                  setIsTyping(false);

                  // Check if we have cards to display
                  if (data.cards && data.cards.length > 0) {
                    // Add cards message
                    const cardsMessage: Message = {
                      id: `cards-${Date.now()}`,
                      type: "cards",
                      content: "ไพ่ที่เลือกสำหรับคุณ",
                      timestamp: new Date(),
                      data: data.cards,
                    };

                    // Add reading message
                    const readingMessage: Message = {
                      id: `reading-${Date.now()}`,
                      type: "reading",
                      content: data.reading.reading,
                      timestamp: new Date(),
                      data: {
                        reading: data.reading,
                        questionAnalysis: data.questionAnalysis,
                        rewards: data.rewards,
                      },
                    };

                    console.log('📡 SSE Adding messages with cards:', { cardsMessage, readingMessage })

                    setMessages((prev) => [
                      ...prev,
                      cardsMessage,
                      readingMessage,
                    ]);
                  } else {
                    // No cards, just add reading message
                    const readingMessage: Message = {
                      id: `reading-${Date.now()}`,
                      type: "reading",
                      content: data.reading.reading,
                      timestamp: new Date(),
                      data: {
                        reading: data.reading,
                        questionAnalysis: data.questionAnalysis,
                        rewards: data.rewards,
                      },
                    };

                    console.log('📡 SSE Adding reading message without cards:', { readingMessage })

                    setMessages((prev) => [
                      ...prev,
                      readingMessage,
                    ]);
                  }
                }

                if (currentEvent === "complete") {
                  console.log('📡 SSE Complete event')
                  setIsTyping(false);
                  setIsProcessing(false);
                }

                if (currentEvent === "error") {
                  console.log('📡 SSE Error event:', data)
                  setIsTyping(false);
                  setIsProcessing(false);

                  const errorMessage: Message = {
                    id: `error-${Date.now()}`,
                    type: "assistant",
                    content:
                      "ขออภัยค่ะ เกิดข้อผิดพลาดในการดูดวง กรุณาลองใหม่อีกครั้งค่ะ",
                    timestamp: new Date(),
                  };

                  setMessages((prev) => [...prev, errorMessage]);
                }
              } catch (error) {
                console.error("❌ Error parsing SSE data:", error, "Line:", line);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setIsTyping(false);
      setIsProcessing(false);

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: "assistant",
        content:
          "ขออภัยค่ะ เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและลองใหม่อีกครั้งค่ะ",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <div
      className={`flex flex-col h-full bg-gradient-to-b from-base-100 to-base-200 ${className}`}
    >
      <ChatHeader />

      <div className="flex-1 overflow-hidden flex flex-col">
        <ChatMessages messages={messages} />

        {isTyping && (
          <div className="px-4 pb-2">
            <TypingIndicator />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-base-300 bg-base-100/80 backdrop-blur-sm">
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isProcessing}
          placeholder={
            isProcessing ? "กำลังดูดวง..." : "พิมพ์คำถามของคุณที่นี่..."
          }
        />
      </div>
    </div>
  );
}
