export interface ErrorMapping {
    [key: string]: {
        title: string;
        message: string;
        suggestion?: string;
    };
}
export declare const ERROR_MESSAGES: ErrorMapping;
/**
 * Get Thai error message from error key
 * @param errorKey - Error key from API response
 * @param fallbackMessage - Optional fallback message if key not found
 * @returns Thai error message object
 */
export declare function getErrorMessage(errorKey: string, fallbackMessage?: string): {
    title: string;
    message: string;
    suggestion?: string;
};
/**
 * Check if error key exists in mapping
 * @param errorKey - Error key to check
 * @returns boolean indicating if key exists
 */
export declare function hasErrorMapping(errorKey: string): boolean;
/**
 * Get all available error keys
 * @returns Array of all error keys
 */
export declare function getAvailableErrorKeys(): string[];
//# sourceMappingURL=error-messages.d.ts.map