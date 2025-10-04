/**
 * Background job processor for async reading generation
 * Part of Task #243: Async Reading System Implementation
 */
/**
 * Process a single pending reading
 */
export declare function processReading(readingId: string): Promise<boolean>;
/**
 * Process multiple pending readings in batch
 */
export declare function processPendingReadings(batchSize?: number): Promise<{
    processed: number;
    successful: number;
    failed: number;
}>;
/**
 * Continuous processing loop for background job
 */
export declare function startReadingProcessor(options?: {
    batchSize?: number;
    intervalMs?: number;
    maxRetries?: number;
}): Promise<void>;
//# sourceMappingURL=reading-processor.d.ts.map