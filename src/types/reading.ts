// Reading types for Round 7A: Database Schema & API Overhaul

export interface CardReading {
  id: number;
  name: string;
  displayName: string;
  imageUrl: string;
  position: number;
  shortMeaning: string;
  keywords: string;
}

export interface ReadingStructure {
  header: string;
  cards_reading: CardReading[];
  reading: string;
  suggestions: string[];
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
    createdAt: string;
  };
}

export interface ReadingError {
  success: false;
  error: string;
  message: string;
  timestamp: string;
  path: string;
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
  answer: ReadingStructure; // JSON field
  type: string;
  isDeleted: boolean;
  isReviewed: boolean;
  createdAt: Date;
  updatedAt: Date;
}