/**
 * Error Handling System - Main Export File
 * 
 * Centralized exports for the error handling system with clean imports
 * and backward compatibility support.
 */

// Core error utilities
export { categorizeError, createCategorizedErrorResponse, ErrorCategory } from './categories';
export { getErrorMessage, ERROR_MESSAGES } from './messages';

// Type definitions
export type { 
  ErrorCategory as ErrorCategoryType,
  CategorizedError
} from './types';

// Handler-specific types
export type { FrontendErrorState, FrontendErrorHandlerOptions } from './handlers/frontend';
export type { BackendErrorContext, BackendErrorHandlerOptions } from './handlers/backend';
export type { AIErrorContext, AIErrorHandlerOptions, AIErrorResult } from './handlers/ai';

// Frontend error handlers
export {
  handleFrontendError,
  createRetryHandler,
  clearErrorState,
  isUserActionableError,
  requiresAuthentication,
  getDisplayMessage,
  getErrorSuggestion
} from './handlers/frontend';

// Backend error handlers
export {
  handleBackendError,
  createErrorContext,
  handleUnhandledError,
  handleValidationError,
  handleRateLimitError,
  handleAuthError
} from './handlers/backend';

// AI error handlers
export {
  handleAIError,
  createAIErrorContext,
  handleWorkflowError,
  handleProviderTimeout,
  isRecoverableError,
  getAIRetryDelay
} from './handlers/ai';

// Utility functions
export function isErrorRetryable(error: any): boolean {
  if (error?.isRetryable !== undefined) {
    return error.isRetryable;
  }
  
  const { categorizeError } = require('./categories');
  const category = categorizeError(error);
  return category !== 'VALIDATION_ERROR' && category !== 'AUTHENTICATION_ERROR';
}

export function getRetryDelay(retryCount: number = 0): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
  return Math.min(1000 * Math.pow(2, retryCount), 30000);
}

// Backward compatibility - legacy error categories
export const LEGACY_ERROR_CATEGORIES = {
  VALIDATION: 'validation' as const,
  AUTHENTICATION: 'authentication' as const,
  AUTHORIZATION: 'authorization' as const,
  RATE_LIMIT: 'rate_limit' as const,
  AI_PROVIDER: 'ai_provider' as const,
  DATABASE: 'database' as const,
  NETWORK: 'network' as const,
  SYSTEM: 'system' as const
};

/**
 * @deprecated Use specific handler functions instead
 * Legacy error handling function for backward compatibility
 */
export function handleError(
  error: Error | string,
  context: 'frontend' | 'backend' | 'ai' = 'frontend',
  options: any = {}
) {
  switch (context) {
    case 'frontend': {
      const { handleFrontendError } = require('./handlers/frontend');
      return handleFrontendError(error, options);
    }
    case 'backend': {
      const { handleBackendError } = require('./handlers/backend');
      return handleBackendError(error, options.context || {}, options);
    }
    case 'ai': {
      const { handleAIError } = require('./handlers/ai');
      return handleAIError(error, options.context || {}, options);
    }
    default:
      throw new Error(`Unknown error context: ${context}`);
  }
}

/**
 * @deprecated Use categorizeError from './categories' instead
 */
export function getErrorCategory(error: Error | string) {
  const { categorizeError } = require('./categories');
  return categorizeError(error);
}