// Reading types for backend
// Updated for Async Reading System (Task #243)

export enum ReadingStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export interface CardReading {
  id: number;
  name: string;
  displayName: string;
  imageUrl: string;
  position: number;
  shortMeaning: string;
  keywords: string;
}

export interface ParsedReadingStructure {
  questionAnalysis: {
    mood: string;
    topic: string;
    period: string;
  };
  cards: {
    id: number;
    name: string;
    displayName: string;
    imageUrl: string;
    position: string;
    shortMeaning: string;
    keywords: string;
  }[];
  reading: ReadingStructure;
  selectedCards: {
    id: number;
    name: string;
    displayName: string;
    arcana: string;
    shortMeaning: string;
    keywords: string;
    imageUrl: string;
    position: number;
  }[];
  createdAt: string;
}

export interface ReadingStructure {
  header: string;
  cards_reading: CardReading[];
  reading: string;
  suggestions: string[];
  next_questions: string[];
  final: string;
  end: string;
  notice: string;
}

export interface QuestionAnalysis {
  mood: string;
  topic: string;
  period: string;
}

export interface ReadingResponse {
  success: true;
  data: {
    readingId: string;
    question: string;
    questionAnalysis: QuestionAnalysis;
    cards: CardReading[]; // For UI display
    reading: ReadingStructure; // Complete reading structure
    rewards: {
      exp: number;
      coins: number;
    };
    transactionId: string; // For saving the reading later
    selectedCards: Array<{
      id: number;
      name: string;
      displayName: string;
      arcana: string;
      shortMeaning: string;
      keywords: string;
      imageUrl: string;
      position: number;
    }>; // Complete database card records for UI display
    createdAt: string;
    isSaved: boolean; // Track if reading is saved to database
  };
}

export interface ReadingError {
  success: false;
  error: string;
  message: string;
  timestamp: string;
  path: string;
  validationReason?: string;
  isValid?: boolean;

  // เพิ่ม fields ใหม่ (optional เพื่อ backward compatibility)
  category?:
    | "validation"
    | "ai_processing"
    | "rate_limit"
    | "authentication"
    | "system";
  isRetryable?: boolean;
}

// Historical reading format for display
export interface HistoricalReading {
  id: string;
  question: string;
  answer: ReadingStructure; // Now JSON object instead of string
  createdAt: string;
  isReviewed: boolean;
  cards: Array<{
    name: string;
    displayName: string;
    imageUrl: string;
  }>;
}

// Database types (matching Prisma schema)
export interface ReadingRecord {
  id: string;
  userId: string;
  question: string;
  answer: ReadingStructure | null; // JSON field, nullable for pending readings
  type: string;
  status: ReadingStatus;
  createdAt: Date;
  updatedAt: Date;
  expEarned: number;
  coinsEarned: number;
}