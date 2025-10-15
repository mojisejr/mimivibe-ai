/**
 * Error Categories Utility for Ask Feature
 *
 * Provides structured error categorization, Thai user messages, and
 * standardized error response functions for the MiMiVibes Ask system.
 *
 * This utility builds upon the existing error-messages.ts system while
 * adding categorization and retry logic for improved user experience.
 */
export declare enum ErrorCategory {
    VALIDATION = "validation",
    AI_PROCESSING = "ai_processing",
    RATE_LIMIT = "rate_limit",
    AUTHENTICATION = "authentication",
    SYSTEM = "system"
}
export interface CategorizedError {
    code: string;
    category: ErrorCategory;
    isRetryable: boolean;
    title: string;
    message: string;
    suggestion?: string;
    retryAfter?: number;
}
export declare const ERROR_MAPPINGS: Record<string, CategorizedError>;
/**
 * Categorize an error based on error code or message
 * @param errorCode - Error code from API response
 * @param errorMessage - Optional error message for fallback categorization
 * @returns CategorizedError object with category and retry information
 */
export declare function categorizeError(errorCode: string, errorMessage?: string): CategorizedError;
/**
 * Create a standardized categorized error response
 * @param errorCode - Error code
 * @param path - API path where error occurred
 * @param validationReason - Optional validation reason
 * @returns Structured error response compatible with ReadingError interface
 */
export declare function createCategorizedErrorResponse(errorCode: string, path: string, validationReason?: string): {
    success: false;
    error: string;
    message: string;
    category: ErrorCategory;
    isRetryable: boolean;
    retryAfter: number | undefined;
    timestamp: string;
    path: string;
    validationReason: string | undefined;
    isValid: boolean;
    title: string;
    suggestion: string | undefined;
};
/**
 * Get all error codes for a specific category
 * @param category - Error category to filter by
 * @returns Array of error codes in the specified category
 */
export declare function getErrorCodesByCategory(category: ErrorCategory): string[];
/**
 * Check if an error is retryable
 * @param errorCode - Error code to check
 * @returns boolean indicating if the error is retryable
 */
export declare function isErrorRetryable(errorCode: string): boolean;
/**
 * Get retry delay for an error
 * @param errorCode - Error code to check
 * @returns number of seconds to wait before retry, or undefined if not retryable
 */
export declare function getRetryDelay(errorCode: string): number | undefined;
/**
 * Get all available error categories
 * @returns Array of all error categories
 */
export declare function getAvailableCategories(): ErrorCategory[];
/**
 * Get error statistics by category
 * @returns Object with count of errors per category
 */
export declare function getErrorStatsByCategory(): Record<ErrorCategory, number>;
//# sourceMappingURL=error-categories.d.ts.map