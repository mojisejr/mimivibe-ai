/**
 * Frontend Error Handler
 * 
 * Specialized error handling for React components and client-side operations.
 * Provides user-friendly error messages, retry mechanisms, and UI state management.
 */

import { categorizeError, ErrorCategory } from '../categories';
import { getErrorMessage } from '../messages';

export interface FrontendErrorState {
  hasError: boolean;
  error: string | null;
  category: ErrorCategory | null;
  isRetryable: boolean;
  retryAfter?: number;
  title?: string;
  suggestion?: string;
}

export interface FrontendErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  trackAnalytics?: boolean;
  fallbackMessage?: string;
}

/**
 * Handle frontend errors with user-friendly messaging and state management
 * @param error - Error object or error code
 * @param options - Configuration options for error handling
 * @returns FrontendErrorState object for UI consumption
 */
export function handleFrontendError(
  error: Error | string,
  options: FrontendErrorHandlerOptions = {}
): FrontendErrorState {
  const {
    showToast = true,
    logToConsole = true,
    trackAnalytics = false,
    fallbackMessage = 'เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง'
  } = options;

  let errorCode: string;
  let errorMessage: string | undefined;

  // Extract error information
  if (error instanceof Error) {
    errorCode = error.name || 'UNKNOWN_ERROR';
    errorMessage = error.message;
    
    if (logToConsole) {
      console.error('Frontend Error:', error);
    }
  } else {
    errorCode = error;
    errorMessage = undefined;
  }

  // Categorize the error
  const categorizedError = categorizeError(errorCode, errorMessage);

  // Create error state
  const errorState: FrontendErrorState = {
    hasError: true,
    error: categorizedError.code,
    category: categorizedError.category,
    isRetryable: categorizedError.isRetryable,
    retryAfter: categorizedError.retryAfter,
    title: categorizedError.title,
    suggestion: categorizedError.suggestion
  };

  // Show toast notification if enabled
  if (showToast && typeof window !== 'undefined') {
    // Note: This would integrate with your toast system
    console.info('Toast:', categorizedError.title, categorizedError.message);
  }

  // Track analytics if enabled
  if (trackAnalytics && typeof window !== 'undefined') {
    // Note: This would integrate with your analytics system
    console.info('Analytics:', {
      event: 'frontend_error',
      error_code: errorCode,
      error_category: categorizedError.category,
      is_retryable: categorizedError.isRetryable
    });
  }

  return errorState;
}

/**
 * Create a retry handler for retryable errors
 * @param errorState - Current error state
 * @param retryFunction - Function to execute on retry
 * @returns Retry handler function
 */
export function createRetryHandler(
  errorState: FrontendErrorState,
  retryFunction: () => void | Promise<void>
) {
  return async () => {
    if (!errorState.isRetryable) {
      console.warn('Attempted to retry non-retryable error:', errorState.error);
      return;
    }

    if (errorState.retryAfter) {
      // Wait for the specified delay
      await new Promise(resolve => setTimeout(resolve, errorState.retryAfter! * 1000));
    }

    try {
      await retryFunction();
    } catch (retryError) {
      console.error('Retry failed:', retryError);
      // Could recursively handle the retry error
    }
  };
}

/**
 * Clear error state
 * @returns Clean error state
 */
export function clearErrorState(): FrontendErrorState {
  return {
    hasError: false,
    error: null,
    category: null,
    isRetryable: false
  };
}

/**
 * Check if error is user-actionable (validation errors)
 * @param errorState - Error state to check
 * @returns boolean indicating if user can fix the error
 */
export function isUserActionableError(errorState: FrontendErrorState): boolean {
  return errorState.category === ErrorCategory.VALIDATION;
}

/**
 * Check if error requires authentication
 * @param errorState - Error state to check
 * @returns boolean indicating if authentication is required
 */
export function requiresAuthentication(errorState: FrontendErrorState): boolean {
  return errorState.category === ErrorCategory.AUTHENTICATION;
}

/**
 * Get user-friendly error message for display
 * @param errorState - Error state
 * @returns Formatted error message for UI
 */
export function getDisplayMessage(errorState: FrontendErrorState): string {
  if (!errorState.hasError || !errorState.error) {
    return '';
  }

  const errorInfo = getErrorMessage(errorState.error);
  return errorInfo.message;
}

/**
 * Get error suggestion for user guidance
 * @param errorState - Error state
 * @returns Suggestion text or empty string
 */
export function getErrorSuggestion(errorState: FrontendErrorState): string {
  if (!errorState.hasError || !errorState.suggestion) {
    return '';
  }

  return errorState.suggestion;
}