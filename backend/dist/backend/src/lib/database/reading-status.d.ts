/**
 * Database operations for reading status management
 * Part of Task #243: Async Reading System Implementation
 */
/**
 * Get pending readings from the database
 */
export declare function getPendingReadings(limit?: number): Promise<{
    type: string;
    userId: string;
    question: string;
    status: import(".prisma/client").$Enums.ReadingStatus;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    answer: import("@prisma/client/runtime/library").JsonValue | null;
    isDeleted: boolean;
    isReviewed: boolean;
    errorMessage: string | null;
    processingCompletedAt: Date | null;
    processingStartedAt: Date | null;
}[]>;
/**
 * Mark a reading as processing
 */
export declare function markReadingAsProcessing(readingId: string): Promise<{
    type: string;
    userId: string;
    question: string;
    status: import(".prisma/client").$Enums.ReadingStatus;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    answer: import("@prisma/client/runtime/library").JsonValue | null;
    isDeleted: boolean;
    isReviewed: boolean;
    errorMessage: string | null;
    processingCompletedAt: Date | null;
    processingStartedAt: Date | null;
} | null>;
/**
 * Mark a reading as completed with the reading data
 */
export declare function markReadingAsCompleted(readingId: string, readingData: any): Promise<{
    type: string;
    userId: string;
    question: string;
    status: import(".prisma/client").$Enums.ReadingStatus;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    answer: import("@prisma/client/runtime/library").JsonValue | null;
    isDeleted: boolean;
    isReviewed: boolean;
    errorMessage: string | null;
    processingCompletedAt: Date | null;
    processingStartedAt: Date | null;
}>;
/**
 * Mark a reading as failed with error message
 */
export declare function markReadingAsFailed(readingId: string, errorMessage: string): Promise<{
    type: string;
    userId: string;
    question: string;
    status: import(".prisma/client").$Enums.ReadingStatus;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    answer: import("@prisma/client/runtime/library").JsonValue | null;
    isDeleted: boolean;
    isReviewed: boolean;
    errorMessage: string | null;
    processingCompletedAt: Date | null;
    processingStartedAt: Date | null;
}>;
/**
 * Deduct credits for a reading
 */
export declare function deductCreditsForReading(userId: string, readingId: string, questionLength: number, questionAnalysis: any): Promise<{
    deltaFreePoint: number;
    deltaStars: number;
}>;
/**
 * Refund credits for a failed reading
 */
export declare function refundCreditsForReading(userId: string, readingId: string, reason: string): Promise<{
    refundFreePoint: number;
    refundStars: number;
    transactionId: any;
} | null>;
//# sourceMappingURL=reading-status.d.ts.map