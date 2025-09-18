import { useCallback } from 'react';
import { getErrorMessage } from '@/lib/utils/error-messages';

export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
  errorKey?: string;
  timestamp: string;
  path: string;
  validationReason?: string;
  isValid?: boolean;
}

export interface ProcessedError {
  title: string;
  message: string;
  suggestion?: string;
  canRetry: boolean;
  originalError: string;
  validationReason?: string;
  isValid?: boolean;
}

/**
 * Custom hook for handling API error responses
 * Converts error responses to Thai messages using error mapping
 */
export function useErrorHandler() {
  
  /**
   * Process error response from API
   * @param error - Error object or response data
   * @param response - Optional fetch response object
   * @returns Processed error with Thai messages
   */
  const processError = useCallback((
    error: any, 
    response?: Response
  ): ProcessedError => {
    let errorKey = '';
    let originalMessage = '';
    let canRetry = true;
    let validationReason: string | undefined;
    let isValid: boolean | undefined;

    // Handle different error types
    if (error instanceof Error) {
      // JavaScript Error object
      originalMessage = error.message;
      errorKey = 'Unknown error';
    } else if (error && typeof error === 'object') {
      // API Error response
      if (error.error) {
        originalMessage = error.error;
        errorKey = error.errorKey || error.error;
      } else if (error.message) {
        originalMessage = error.message;
        errorKey = error.errorKey || 'Unknown error';
      }
      
      // Extract validation information
      validationReason = error.validationReason;
      isValid = error.isValid;
    } else if (typeof error === 'string') {
      // String error
      originalMessage = error;
      errorKey = 'Unknown error';
    }

    // Determine retry capability based on status code
    if (response) {
      const status = response.status;
      // Don't retry for client errors (400-499) except timeout-related
      if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
        canRetry = false;
      }
    }

    // Map specific error messages to error keys
    const errorKeyMapping: { [key: string]: string } = {
      'การทำนายล้มเหลว': 'Processing error',
      'ไม่สามารถทำนายได้': 'Processing error',
      'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ': 'Unknown error',
      'Invalid question': 'Invalid question',
      'Processing error': 'Processing error',
      'Gateway timeout': 'Gateway timeout',
      'Upstream error': 'Upstream error',
      'Reading timeout': 'Reading timeout'
    };

    // Try to find a better error key
    const mappedKey = errorKeyMapping[originalMessage] || errorKeyMapping[errorKey];
    if (mappedKey) {
      errorKey = mappedKey;
    }

    // Get Thai error message
    const thaiError = getErrorMessage(errorKey, originalMessage);

    return {
      title: thaiError.title,
      message: thaiError.message,
      suggestion: thaiError.suggestion,
      canRetry,
      originalError: originalMessage,
      validationReason,
      isValid
    };
  }, []);

  /**
   * Process fetch response and extract error information
   * @param response - Fetch response object
   * @returns Processed error or null if response is ok
   */
  const processResponse = useCallback(async (
    response: Response
  ): Promise<ProcessedError | null> => {
    if (response.ok) {
      return null;
    }

    try {
      const data = await response.json();
      return processError(data, response);
    } catch (parseError) {
      // Failed to parse JSON response
      return processError({
        error: `HTTP ${response.status}: ${response.statusText}`,
        errorKey: 'Upstream error'
      }, response);
    }
  }, [processError]);

  /**
   * Handle reading API errors specifically
   * @param error - Error from reading API
   * @param response - Optional response object
   * @returns Processed error for reading operations
   */
  const processReadingError = useCallback((
    error: any,
    response?: Response
  ): ProcessedError => {
    const processed = processError(error, response);
    
    // Special handling for reading-specific errors
    if (response?.status === 400 && processed.originalError.includes('question')) {
      return {
        ...processed,
        canRetry: false // Don't retry invalid questions
      };
    }

    if (response?.status === 504 || processed.originalError.includes('timeout')) {
      return {
        ...processed,
        canRetry: true // Always allow retry for timeouts
      };
    }

    return processed;
  }, [processError]);

  return {
    processError,
    processResponse,
    processReadingError
  };
}

/**
 * Utility function to create error state for components
 * @param error - Processed error object
 * @returns Error state object for component state
 */
export function createErrorState(error: ProcessedError) {
  return {
    message: error.message,
    canRetry: error.canRetry,
    title: error.title,
    suggestion: error.suggestion,
    validationReason: error.validationReason,
    isValid: error.isValid
  };
}