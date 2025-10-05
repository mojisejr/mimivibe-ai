export declare enum ReadingStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
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
        cards: CardReading[];
        reading: ReadingStructure;
        rewards: {
            exp: number;
            coins: number;
        };
        transactionId: string;
        selectedCards: Array<{
            id: number;
            name: string;
            displayName: string;
            arcana: string;
            shortMeaning: string;
            keywords: string;
            imageUrl: string;
            position: number;
        }>;
        createdAt: string;
        isSaved: boolean;
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
    category?: "validation" | "ai_processing" | "rate_limit" | "authentication" | "system";
    isRetryable?: boolean;
}
export interface HistoricalReading {
    id: string;
    question: string;
    answer: ReadingStructure;
    createdAt: string;
    isReviewed: boolean;
    cards: Array<{
        name: string;
        displayName: string;
        imageUrl: string;
    }>;
}
export interface ReadingRecord {
    id: string;
    userId: string;
    question: string;
    answer: ReadingStructure | null;
    type: string;
    status: ReadingStatus;
    createdAt: Date;
    updatedAt: Date;
    expEarned: number;
    coinsEarned: number;
}
//# sourceMappingURL=reading.d.ts.map