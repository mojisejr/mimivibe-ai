# UI-COMPONENTS.md

## 🧩 Core UI Components

สำหรับ Round 4: Chat UI & Reading Flow Components

---

## Chat Interface Components

### Chat Container Layout

```typescript
// src/components/chat/ChatContainer.tsx
import { ReactNode } from "react";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";

interface ChatContainerProps {
  user: User;
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export function ChatContainer({
  user,
  messages,
  onSendMessage,
  isLoading,
}: ChatContainerProps) {
  return (
    <div className="flex flex-col h-screen bg-base-100">
      {/* Header */}
      <ChatHeader user={user} />

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <ChatWelcome onSuggestedQuestion={onSendMessage} />
        ) : (
          <ChatMessages messages={messages} />
        )}
      </main>

      {/* Input Area */}
      <ChatInput
        onSendMessage={onSendMessage}
        disabled={isLoading}
        className="sticky bottom-0 safe-area-bottom"
      />
    </div>
  );
}
```

### Chat Header Component

```typescript
// src/components/chat/ChatHeader.tsx
import { UserButton } from "@clerk/nextjs";
import { User } from "@/types";
import { Logo } from "@/components/ui/Logo";

interface ChatHeaderProps {
  user: User;
}

export function ChatHeader({ user }: ChatHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-base-100/80 backdrop-blur-md border-b border-base-300 safe-area-top">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          {/* Logo Integration */}
          <Logo size="md" showText={false} />

          <div>
            <h1 className="font-semibold text-base-content">แม่หมอมีมี่</h1>
            <p className="text-sm text-neutral-content">หมอดูไพ่ทาโรต์ AI</p>
          </div>
        </div>

        {/* User Avatar & Status */}
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-2 text-sm">
            <span className="text-primary">⭐ {user.stars}</span>
            <span className="text-accent">🪙 {user.coins}</span>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}
```

### Chat Welcome Screen

```typescript
// src/components/chat/ChatWelcome.tsx
import { Logo } from "@/components/ui/Logo";

interface ChatWelcomeProps {
  onSuggestedQuestion: (question: string) => void;
}

export function ChatWelcome({ onSuggestedQuestion }: ChatWelcomeProps) {
  const suggestedQuestions = [
    "ความรักของฉันเป็นยังไงบ้าง?",
    "งานการเงินจะดีขึ้นไหม?",
    "ฉันควรทำอะไรดีในช่วงนี้?",
    "สิ่งที่รอคอยจะมาถึงเมื่อไหร่?",
  ];

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-8">
      <div className="text-center max-w-md space-y-6">
        {/* Logo + Mimi Avatar Combination */}
        <div className="relative">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <Logo size="lg" showText={true} />
            <div className="text-2xl">✨</div>
          </div>

          <img
            src="/mimi-welcome.webp"
            alt="แม่หมอมีมี่"
            className="w-32 h-32 mx-auto rounded-full shadow-2xl"
          />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-success rounded-full border-4 border-base-100 flex items-center justify-center">
            <span className="text-xs">✨</span>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-base-content">
            สวัสดีค่ะ ฉันแม่หมอมีมี่
          </h2>
          <p className="text-neutral-content leading-relaxed">
            ถามเรื่องอะไรก็ได้ที่คุณอยากรู้ แม่หมอจะดูให้ด้วยไพ่ทาโรต์
            และให้คำแนะนำที่จะช่วยให้คุณเดินทางต่อไปได้อย่างมั่นใจ
          </p>
        </div>

        {/* Suggested Questions */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-neutral-content">
            คำถามยอดนิยม:
          </p>
          <div className="space-y-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => onSuggestedQuestion(question)}
                className="btn btn-outline btn-sm w-full text-left justify-start hover:btn-primary"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Highlight */}
        <div className="bg-base-200 rounded-lg p-4 text-sm text-neutral-content">
          <p className="flex items-center justify-center space-x-2">
            <span>🔮</span>
            <span>การดูดวงทุกครั้งจะใช้ 1 Star</span>
          </p>
        </div>
      </div>
    </div>
  );
}
```

### Chat Messages Component

```typescript
// src/components/chat/ChatMessages.tsx
import { Message } from "@/types";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

interface ChatMessagesProps {
  messages: Message[];
  isTyping?: boolean;
}

export function ChatMessages({ messages, isTyping }: ChatMessagesProps) {
  return (
    <div className="px-4 py-6 space-y-6">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {isTyping && <TypingIndicator />}
    </div>
  );
}
```

### Message Bubble Component

```typescript
// src/components/chat/MessageBubble.tsx
import { Message } from "@/types";
import { Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import { TarotCardGrid } from "../cards/TarotCardGrid";
import { ReadingContent } from "./ReadingContent";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isAI = message.role === "assistant";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-3xl">
          <div className="bg-primary text-primary-content rounded-2xl rounded-tr-md p-4">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
          <div className="flex justify-end mt-2">
            <span className="text-xs text-neutral-content">ส่งแล้ว</span>
          </div>
        </div>
      </div>
    );
  }

  if (isAI) {
    return (
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <img
            src="/mimi-avatar.webp"
            alt="แม่หมอมีมี่"
            className="w-8 h-8 rounded-full"
          />
        </div>

        <div className="flex-1 max-w-3xl space-y-4">
          {/* Text Content */}
          <div className="bg-base-200 rounded-2xl rounded-tl-md p-4">
            {message.type === "reading" ? (
              <ReadingContent content={message.content} />
            ) : (
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            )}
          </div>

          {/* Cards Display */}
          {message.cards && message.cards.length > 0 && (
            <TarotCardGrid cards={message.cards} />
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-neutral-content">เมื่อกี้นี้</span>
            <button className="btn btn-ghost btn-xs" title="คัดลอก">
              <Copy className="w-3 h-3" />
            </button>
            <button className="btn btn-ghost btn-xs" title="ถูกต้อง">
              <ThumbsUp className="w-3 h-3" />
            </button>
            <button className="btn btn-ghost btn-xs" title="ไม่ถูกต้อง">
              <ThumbsDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
```

### Typing Indicator

```typescript
// src/components/chat/TypingIndicator.tsx
export function TypingIndicator() {
  return (
    <div className="flex items-start space-x-3">
      <img
        src="/mimi-avatar.webp"
        alt="แม่หมอมีมี่"
        className="w-8 h-8 rounded-full"
      />
      <div className="bg-base-200 rounded-2xl rounded-tl-md p-4">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-neutral rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-neutral rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-neutral rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
```

### Chat Input Component

```typescript
// src/components/chat/ChatInput.tsx
import { useState } from "react";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder = "ถามคำถามเกี่ยวกับชีวิต ความรัก การงาน หรือสิ่งที่คุณสงสัย...",
  className = "",
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div
      className={`bg-base-100/80 backdrop-blur-md border-t border-base-300 p-4 ${className}`}
    >
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="textarea textarea-bordered w-full resize-none min-h-[3rem] max-h-32 pr-12 text-base"
              rows={1}
              style={{
                height: "auto",
                minHeight: "3rem",
              }}
            />
            <button
              type="submit"
              disabled={!message.trim() || disabled}
              className="absolute right-2 bottom-2 btn btn-circle btn-sm btn-primary disabled:btn-disabled"
            >
              {disabled ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Character Counter */}
        <div className="flex justify-between items-center mt-2 text-xs text-neutral-content">
          <span>กด Enter เพื่อส่ง, Shift+Enter เพื่อขึ้นบรรทัดใหม่</span>
          <span className={message.length > 450 ? "text-warning" : ""}>
            {message.length}/500
          </span>
        </div>
      </form>
    </div>
  );
}
```

---

## Tarot Card Components

### Tarot Card Grid

```typescript
// src/components/cards/TarotCardGrid.tsx
import { Card } from "@/types";
import { TarotCard } from "./TarotCard";

interface TarotCardGridProps {
  cards: Card[];
  revealed?: boolean;
  onCardClick?: (card: Card) => void;
}

export function TarotCardGrid({
  cards,
  revealed = true,
  onCardClick,
}: TarotCardGridProps) {
  const gridClass =
    cards.length === 3
      ? "grid grid-cols-3 gap-4 justify-items-center max-w-sm mx-auto"
      : "grid grid-cols-5 gap-2 md:gap-4 justify-items-center max-w-2xl mx-auto";

  return (
    <div className="py-6">
      <div className={gridClass}>
        {cards.map((card, index) => (
          <TarotCard
            key={card.id}
            card={card}
            position={index + 1}
            revealed={revealed}
            onClick={() => onCardClick?.(card)}
            delay={index * 200}
          />
        ))}
      </div>
    </div>
  );
}
```

### Individual Tarot Card

```typescript
// src/components/cards/TarotCard.tsx
import { useState, useEffect } from "react";
import { Card } from "@/types";

interface TarotCardProps {
  card: Card;
  position: number;
  revealed?: boolean;
  onClick?: () => void;
  delay?: number;
}

export function TarotCard({
  card,
  position,
  revealed = false,
  onClick,
  delay = 0,
}: TarotCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      if (revealed) {
        setTimeout(() => setIsRevealed(true), 300);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, revealed]);

  const handleClick = () => {
    if (!isRevealed && revealed) {
      setIsRevealed(true);
    }
    onClick?.();
  };

  return (
    <div
      className={`group perspective-1000 transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div
        className={`
          relative w-24 h-36 md:w-32 md:h-48 transform-style-preserve-3d transition-transform duration-700 cursor-pointer
          ${isRevealed ? "rotate-y-180" : ""}
          hover:scale-105
        `}
        onClick={handleClick}
      >
        {/* Card Back */}
        <div className="absolute inset-0 w-full h-full backface-hidden">
          <div className="w-full h-full bg-gradient-to-br from-primary to-secondary rounded-lg border-2 border-primary/20 shadow-lg">
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-white">
                <div className="text-2xl mb-2">✨</div>
                <div className="text-xs font-medium">#{position}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Card Front */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
          <div className="w-full h-full bg-white rounded-lg border-2 border-base-300 shadow-lg overflow-hidden">
            <img
              src={card.imageUrl}
              alt={card.displayName}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
              <p className="text-white text-xs font-medium text-center truncate">
                {card.displayName}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Card Position Label */}
      <div className="text-center mt-2">
        <span className="text-xs text-neutral-content">
          ตำแหน่งที่ {position}
        </span>
      </div>
    </div>
  );
}
```

### Card Detail Modal

```typescript
// src/components/cards/CardDetailModal.tsx
import { Card } from "@/types";
import { X } from "lucide-react";

interface CardDetailModalProps {
  card: Card;
  position: number;
  isOpen: boolean;
  onClose: () => void;
}

export function CardDetailModal({
  card,
  position,
  isOpen,
  onClose,
}: CardDetailModalProps) {
  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <form method="dialog">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </form>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Card Image */}
          <div className="flex justify-center">
            <div className="w-48 h-72 bg-white rounded-lg shadow-lg overflow-hidden">
              <img
                src={card.imageUrl}
                alt={card.displayName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Card Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-base-content">
                {card.displayName}
              </h3>
              <p className="text-sm text-neutral-content">
                {card.arcana} • ตำแหน่งที่ {position}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-base-content mb-2">
                ความหมายโดยย่อ
              </h4>
              <p className="text-sm text-base-content leading-relaxed">
                {card.shortMeaning}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-base-content mb-2">
                ความหมายละเอียด
              </h4>
              <p className="text-sm text-base-content leading-relaxed">
                {card.longMeaning}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-base-content mb-2">คำสำคัญ</h4>
              <div className="flex flex-wrap gap-2">
                {card.keywords.split(",").map((keyword, index) => (
                  <span key={index} className="badge badge-primary badge-sm">
                    {keyword.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}
```

---

## Reading Content Components

### Reading Content Display

```typescript
// src/components/chat/ReadingContent.tsx
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ReadingContentProps {
  content: string; // JSON string from AI
}

export function ReadingContent({ content }: ReadingContentProps) {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    suggestions: false,
    final: false,
  });

  let reading;
  try {
    reading = JSON.parse(content);
  } catch {
    return <p className="text-error">ไม่สามารถแสดงผลคำทำนายได้</p>;
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {reading.header && (
        <div className="prose prose-sm max-w-none">
          <p className="text-base leading-relaxed">{reading.header}</p>
        </div>
      )}

      {/* Main Reading */}
      {reading.reading && (
        <div className="bg-primary/5 border-l-4 border-primary rounded-r-lg p-4">
          <h4 className="font-semibold text-primary mb-3">🔮 คำทำนาย</h4>
          <div className="prose prose-sm max-w-none">
            <p className="text-base-content leading-relaxed whitespace-pre-line">
              {reading.reading}
            </p>
          </div>
        </div>
      )}

      {/* Suggestions */}
      {reading.suggestions && reading.suggestions.length > 0 && (
        <div className="bg-accent/5 border-l-4 border-accent rounded-r-lg p-4">
          <button
            onClick={() => toggleSection("suggestions")}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-semibold text-accent">💡 คำแนะนำ</h4>
            {expandedSections.suggestions ? (
              <ChevronUp className="w-4 h-4 text-accent" />
            ) : (
              <ChevronDown className="w-4 h-4 text-accent" />
            )}
          </button>

          {expandedSections.suggestions && (
            <div className="mt-3 space-y-2">
              {reading.suggestions.map((suggestion: string, index: number) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="text-accent text-sm mt-1">•</span>
                  <p className="text-sm text-base-content leading-relaxed">
                    {suggestion}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Final Message */}
      {reading.final && reading.final.length > 0 && (
        <div className="bg-success/5 border-l-4 border-success rounded-r-lg p-4">
          <button
            onClick={() => toggleSection("final")}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-semibold text-success">✨ ข้อความสำคัญ</h4>
            {expandedSections.final ? (
              <ChevronUp className="w-4 h-4 text-success" />
            ) : (
              <ChevronDown className="w-4 h-4 text-success" />
            )}
          </button>

          {expandedSections.final && (
            <div className="mt-3 space-y-2">
              {reading.final.map((finalMsg: string, index: number) => (
                <p
                  key={index}
                  className="text-sm text-base-content leading-relaxed"
                >
                  {finalMsg}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* End Message */}
      {reading.end && (
        <div className="prose prose-sm max-w-none">
          <p className="text-base text-neutral-content leading-relaxed italic">
            {reading.end}
          </p>
        </div>
      )}

      {/* Notice */}
      {reading.notice && (
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
          <p className="text-xs text-warning-content leading-relaxed">
            ⚠️ {reading.notice}
          </p>
        </div>
      )}
    </div>
  );
}
```

---

## Navigation Components

### Mobile Bottom Navigation

```typescript
// src/components/navigation/BottomNavigation.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, History, User, CreditCard } from "lucide-react";

export function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/ask", label: "ถามดวง", icon: MessageCircle },
    { href: "/history", label: "ประวัติ", icon: History },
    { href: "/packages", label: "เติมเครดิต", icon: CreditCard },
    { href: "/profile", label: "โปรไฟล์", icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-base-100/95 backdrop-blur-md border-t border-base-300 z-50 safe-area-bottom">
      <div className="flex">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-2 px-1 transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-neutral-content hover:text-primary"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs mt-1 truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
```

### Desktop Sidebar Navigation

```typescript
// src/components/navigation/Sidebar.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageCircle,
  History,
  User,
  CreditCard,
  Settings,
  LogOut,
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";

export function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useClerk();

  const navItems = [
    { href: "/ask", label: "ถามดวง", icon: MessageCircle },
    { href: "/history", label: "ประวัติคำทำนาย", icon: History },
    { href: "/packages", label: "เติมเครดิต", icon: CreditCard },
    { href: "/profile", label: "โปรไฟล์", icon: User },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-base-200 border-r border-base-300 h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-base-300">
        <Link href="/" className="flex items-center space-x-3">
          <img src="/mimi-logo.webp" alt="MiMiVibes" className="w-10 h-10" />
          <h1 className="text-xl font-bold text-primary">MiMiVibes</h1>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-primary-content"
                      : "text-base-content hover:bg-base-300"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-base-300">
        <ul className="space-y-2">
          <li>
            <Link
              href="/settings"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base-content hover:bg-base-300 transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>ตั้งค่า</span>
            </Link>
          </li>
          <li>
            <button
              onClick={() => signOut()}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base-content hover:bg-base-300 transition-colors w-full text-left"
            >
              <LogOut className="w-5 h-5" />
              <span>ออกจากระบบ</span>
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
}
```

---

## Modal Components

### Reward Modal

```typescript
// src/components/modals/RewardModal.tsx
import { Gift, Star, Coins } from "lucide-react";

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewards: {
    exp: number;
    coins: number;
    stars?: number;
  };
  title?: string;
  description?: string;
}

export function RewardModal({
  isOpen,
  onClose,
  rewards,
  title = "ยินดีด้วย!",
  description = "คุณได้รับรางวัล:",
}: RewardModalProps) {
  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box text-center max-w-md">
        {/* Icon */}
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mb-4 animate-bounce">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-base-content">{title}</h3>
        </div>

        {/* Description */}
        <p className="text-neutral-content mb-6">{description}</p>

        {/* Rewards */}
        <div className="flex justify-center space-x-4 mb-8">
          {rewards.exp > 0 && (
            <div className="bg-primary/10 rounded-lg p-4">
              <div className="text-2xl mb-1">⚡</div>
              <p className="text-lg font-bold text-primary">
                +{rewards.exp} EXP
              </p>
              <p className="text-xs text-neutral-content">ประสบการณ์</p>
            </div>
          )}

          {rewards.coins > 0 && (
            <div className="bg-accent/10 rounded-lg p-4">
              <Coins className="w-6 h-6 mx-auto mb-1 text-accent" />
              <p className="text-lg font-bold text-accent">
                +{rewards.coins} Coins
              </p>
              <p className="text-xs text-neutral-content">เหรียญ</p>
            </div>
          )}

          {rewards.stars && rewards.stars > 0 && (
            <div className="bg-warning/10 rounded-lg p-4">
              <Star className="w-6 h-6 mx-auto mb-1 text-warning" />
              <p className="text-lg font-bold text-warning">
                +{rewards.stars} Stars
              </p>
              <p className="text-xs text-neutral-content">ดวงดาว</p>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button className="btn btn-primary btn-wide" onClick={onClose}>
          เยี่ยม!
        </button>
      </div>
    </dialog>
  );
}
```

### Save Reading Modal

```typescript
// src/components/modals/SaveReadingModal.tsx
import { useState } from "react";
import { Save, X } from "lucide-react";

interface SaveReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (save: boolean) => void;
  readingQuestion: string;
}

export function SaveReadingModal({
  isOpen,
  onClose,
  onSave,
  readingQuestion,
}: SaveReadingModalProps) {
  const [saving, setSaving] = useState(false);

  const handleSave = async (save: boolean) => {
    setSaving(true);
    await onSave(save);
    setSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <form method="dialog">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </form>

        <h3 className="text-lg font-bold mb-4">บันทึกคำทำนาย</h3>

        <div className="space-y-4">
          <div className="bg-base-200 rounded-lg p-4">
            <p className="text-sm text-neutral-content mb-2">คำถาม:</p>
            <p className="font-medium">{readingQuestion}</p>
          </div>

          <p className="text-sm text-neutral-content">
            คุณต้องการบันทึกคำทำนายนี้เพื่อติดตามความแม่นยำในอนาคตหรือไม่?
            การบันทึกจะช่วยให้คุณสามารถรีวิวและให้คะแนนความแม่นยำได้ในภายหลัง
          </p>

          <div className="bg-info/10 border border-info/30 rounded-lg p-3">
            <p className="text-xs text-info-content">
              💡 การรีวิวความแม่นยำจะช่วยให้คุณได้รับ EXP และ Coins เพิ่มเติม
            </p>
          </div>
        </div>

        <div className="modal-action">
          <button
            className="btn btn-ghost"
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            ไม่บันทึก
          </button>
          <button
            className="btn btn-primary"
            onClick={() => handleSave(true)}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                กำลังบันทึก...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                บันทึก
              </>
            )}
          </button>
        </div>
      </div>
    </dialog>
  );
}
```

---

## Loading Components

### AI Processing Animation

```typescript
// src/components/loading/AIProcessingLoader.tsx
export function AIProcessingLoader() {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      {/* Mystical Symbol Animation */}
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <div className="absolute inset-2 w-12 h-12 border-4 border-accent/30 border-b-accent rounded-full animate-spin animate-reverse"></div>
        <div className="absolute inset-4 w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full animate-pulse"></div>
      </div>

      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-base-content">
          แม่หมอกำลังดูดวงให้คุณ...
        </p>
        <p className="text-sm text-neutral-content">กรุณารอสักครู่ ✨</p>
      </div>
    </div>
  );
}
```

### Card Shuffling Animation

```typescript
// src/components/loading/CardShufflingLoader.tsx
export function CardShufflingLoader() {
  return (
    <div className="flex justify-center items-center space-x-2 p-8">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-16 h-24 bg-gradient-to-br from-primary to-secondary rounded-lg border-2 border-primary/20 shadow-lg flex items-center justify-center"
          style={{
            animation: `shuffle 1.5s infinite ${i * 0.1}s`,
            transform: `translateY(${Math.sin(Date.now() / 1000 + i) * 10}px)`,
          }}
        >
          <div className="text-white text-2xl">✨</div>
        </div>
      ))}

      <style jsx>{`
        @keyframes shuffle {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-10px) rotate(2deg);
          }
          75% {
            transform: translateY(5px) rotate(-1deg);
          }
        }
      `}</style>
    </div>
  );
}
```

---

## Error Components

### Error Boundary

```typescript
// src/components/error/ErrorBoundary.tsx
import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-error mb-4" />
            <h2 className="text-xl font-bold text-base-content mb-2">
              เกิดข้อผิดพลาด
            </h2>
            <p className="text-neutral-content mb-6 max-w-md">
              ขออภัย เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง
            </p>
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              โหลดหน้าใหม่
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

---

## Toast Notifications

### Toast Provider

```typescript
// src/components/toast/ToastProvider.tsx
import { createContext, useContext, ReactNode } from "react";
import { CheckCircle, XCircle, Info, AlertTriangle } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  // Toast implementation here...

  return (
    <ToastContext.Provider
      value={{ addToast: () => {}, removeToast: () => {} }}
    >
      {children}
      <div className="toast toast-top toast-center">
        {/* Toast components */}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};
```

---

**File Purpose**: Core UI Components for Chat & Cards  
**Round Usage**: Round 4 (Chat UI & Reading Flow)  
**Dependencies**: React, Tailwind, DaisyUI, Lucide Icons  
**Estimated Tokens**: ~3,000
