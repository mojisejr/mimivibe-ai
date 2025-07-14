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

      if (!response.ok) {
        throw new Error("Failed to get reading");
      }

      // Handle SSE streaming
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.event === "progress") {
                  // Update typing indicator with progress
                  setIsTyping(true);
                }

                if (data.event === "reading") {
                  setIsTyping(false);

                  // Add cards message
                  const cardsMessage: Message = {
                    id: `cards-${Date.now()}`,
                    type: "cards",
                    content: "ไพ่ที่เลือกสำหรับคุณ",
                    timestamp: new Date(),
                    data: data.data.cards,
                  };

                  // Add reading message
                  const readingMessage: Message = {
                    id: `reading-${Date.now()}`,
                    type: "reading",
                    content: data.data.reading.reading,
                    timestamp: new Date(),
                    data: {
                      reading: data.data.reading,
                      questionAnalysis: data.data.questionAnalysis,
                      rewards: data.data.rewards,
                    },
                  };

                  setMessages((prev) => [
                    ...prev,
                    cardsMessage,
                    readingMessage,
                  ]);
                }

                if (data.event === "complete") {
                  setIsTyping(false);
                  setIsProcessing(false);
                }

                if (data.event === "error") {
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
                console.error("Error parsing SSE data:", error);
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
