/**
 * Database operations for reading status management
 * Part of Task #243: Async Reading System Implementation
 */
/**
 * Get pending readings from the database
 */
export declare function getPendingReadings(limit?: number): Promise<any>;
/**
 * Mark a reading as processing
 */
export declare function markReadingAsProcessing(readingId: string): Promise<any>;
/**
 * Mark a reading as completed with the reading data
 */
export declare function markReadingAsCompleted(readingId: string, readingData: any): Promise<any>;
/**
 * Mark a reading as failed with error message
 */
export declare function markReadingAsFailed(readingId: string, errorMessage: string): Promise<any>;
/**
 * Deduct credits for a reading
 */
export declare function deductCreditsForReading(userId: string, readingId: string, questionLength: number, questionAnalysis: any): Promise<any>;
/**
 * Refund credits for a failed reading
 */
export declare function refundCreditsForReading(userId: string, readingId: string, reason: string): Promise<any>;
//# sourceMappingURL=reading-status.d.ts.map