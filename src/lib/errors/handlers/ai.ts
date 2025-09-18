/**
 * AI Error Handler
 * 
 * Specialized error handling for AI operations, LangGraph workflows, and LLM providers.
 * Provides fallback mechanisms, provider switching, and AI-specific error categorization.
 */

import { categorizeError, ErrorCategory } from '../categories';

export interface AIErrorContext {
  provider: 'openai' | 'gemini' | 'unknown';
  model?: string;
  operation: 'question_filter' | 'question_analysis' | 'card_selection' | 'reading_generation' | 'workflow';
  tokens?: number;
  retryCount?: number;
  workflowState?: string;
}

export interface AIErrorHandlerOptions {
  enableFallback?: boolean;
  maxRetries?: number;
  logAIErrors?: boolean;
  trackTokenUsage?: boolean;
}

export interface AIErrorResult {
  success: false;
  error: string;
  category: ErrorCategory;
  isRetryable: boolean;
  retryAfter?: number;
  shouldFallback: boolean;
  fallbackProvider?: 'openai' | 'gemini';
  context: AIErrorContext;
}

/**
 * Handle AI-specific errors with provider fallback and retry logic
 * @param error - Error object or error code
 * @param context - AI operation context
 * @param options - Configuration options for AI error handling
 * @returns AIErrorResult with fallback recommendations
 */
export function handleAIError(
  error: Error | string,
  context: AIErrorContext,
  options: AIErrorHandlerOptions = {}
): AIErrorResult {
  const {
    enableFallback = true,
    maxRetries = 3,
    logAIErrors = true,
    trackTokenUsage = true
  } = options;

  let errorCode: string;
  let errorMessage: string | undefined;

  // Extract error information
  if (error instanceof Error) {
    errorCode = error.name || 'AI_PROCESSING_ERROR';
    errorMessage = error.message;
  } else {
    errorCode = error;
  }

  // Map common AI provider errors to our error codes
  errorCode = mapProviderError(errorCode, errorMessage, context.provider);

  // Categorize the error
  const categorizedError = categorizeError(errorCode, errorMessage);

  // Determine if fallback should be used
  const shouldFallback = enableFallback && 
                        categorizedError.isRetryable && 
                        shouldUseFallbackProvider(errorCode, context);

  // Determine fallback provider
  const fallbackProvider = shouldFallback ? getFallbackProvider(context.provider) : undefined;

  // Log AI error details
  if (logAIErrors) {
    const logData = {
      error: errorCode,
      message: errorMessage,
      provider: context.provider,
      model: context.model,
      operation: context.operation,
      tokens: context.tokens,
      retryCount: context.retryCount,
      workflowState: context.workflowState,
      shouldFallback,
      fallbackProvider,
      timestamp: new Date().toISOString()
    };

    if (categorizedError.category === ErrorCategory.SYSTEM) {
      console.error('AI System Error:', logData);
    } else {
      console.warn('AI Error:', logData);
    }
  }

  // Track token usage if enabled
  if (trackTokenUsage && context.tokens) {
    console.info('AI Token Usage:', {
      provider: context.provider,
      operation: context.operation,
      tokens: context.tokens,
      error: errorCode,
      timestamp: new Date().toISOString()
    });
  }

  return {
    success: false,
    error: categorizedError.code,
    category: categorizedError.category,
    isRetryable: categorizedError.isRetryable,
    retryAfter: categorizedError.retryAfter,
    shouldFallback,
    fallbackProvider,
    context
  };
}

/**
 * Map provider-specific errors to our standardized error codes
 * @param errorCode - Original error code
 * @param errorMessage - Error message
 * @param provider - AI provider
 * @returns Mapped error code
 */
function mapProviderError(
  errorCode: string, 
  errorMessage: string | undefined, 
  provider: string
): string {
  // OpenAI specific error mapping
  if (provider === 'openai') {
    if (errorCode.includes('rate_limit') || errorMessage?.includes('rate limit')) {
      return 'RATE_LIMIT_EXCEEDED';
    }
    if (errorCode.includes('timeout') || errorMessage?.includes('timeout')) {
      return 'AI_TIMEOUT';
    }
    if (errorCode.includes('invalid_request') || errorMessage?.includes('invalid')) {
      return 'INVALID_QUESTION_FORMAT';
    }
    if (errorCode.includes('insufficient_quota') || errorMessage?.includes('quota')) {
      return 'AI_PROVIDER_ERROR';
    }
  }

  // Gemini specific error mapping
  if (provider === 'gemini') {
    if (errorCode.includes('RESOURCE_EXHAUSTED') || errorMessage?.includes('quota')) {
      return 'RATE_LIMIT_EXCEEDED';
    }
    if (errorCode.includes('DEADLINE_EXCEEDED') || errorMessage?.includes('deadline')) {
      return 'AI_TIMEOUT';
    }
    if (errorCode.includes('INVALID_ARGUMENT') || errorMessage?.includes('invalid')) {
      return 'INVALID_QUESTION_FORMAT';
    }
    if (errorCode.includes('UNAVAILABLE') || errorMessage?.includes('unavailable')) {
      return 'AI_PROVIDER_ERROR';
    }
  }

  // LangGraph workflow specific errors
  if (errorMessage?.includes('workflow') || errorMessage?.includes('state')) {
    return 'WORKFLOW_ERROR';
  }

  // Default to generic AI processing error
  return 'AI_PROCESSING_ERROR';
}

/**
 * Determine if fallback provider should be used
 * @param errorCode - Error code
 * @param context - AI context
 * @returns boolean indicating if fallback should be used
 */
function shouldUseFallbackProvider(errorCode: string, context: AIErrorContext): boolean {
  // Don't fallback for validation errors
  if (errorCode.includes('INVALID_') || errorCode.includes('INAPPROPRIATE_')) {
    return false;
  }

  // Don't fallback if already retried multiple times
  if (context.retryCount && context.retryCount >= 2) {
    return false;
  }

  // Fallback for provider-specific errors
  const fallbackErrors = [
    'AI_PROVIDER_ERROR',
    'AI_TIMEOUT',
    'RATE_LIMIT_EXCEEDED',
    'AI_PROCESSING_ERROR'
  ];

  return fallbackErrors.includes(errorCode);
}

/**
 * Get fallback provider for the current provider
 * @param currentProvider - Current AI provider
 * @returns Fallback provider or undefined
 */
function getFallbackProvider(currentProvider: string): 'openai' | 'gemini' | undefined {
  switch (currentProvider) {
    case 'openai':
      return 'gemini';
    case 'gemini':
      return 'openai';
    default:
      return 'openai'; // Default fallback
  }
}

/**
 * Create AI error context for workflow operations
 * @param provider - AI provider
 * @param operation - Current operation
 * @param additionalContext - Additional context data
 * @returns AIErrorContext object
 */
export function createAIErrorContext(
  provider: 'openai' | 'gemini',
  operation: AIErrorContext['operation'],
  additionalContext: Partial<AIErrorContext> = {}
): AIErrorContext {
  return {
    provider,
    operation,
    ...additionalContext
  };
}

/**
 * Handle workflow state errors
 * @param workflowState - Current workflow state
 * @param error - Error that occurred
 * @param context - AI context
 * @returns AIErrorResult with workflow-specific handling
 */
export function handleWorkflowError(
  workflowState: string,
  error: Error | string,
  context: Omit<AIErrorContext, 'workflowState'>
): AIErrorResult {
  const workflowContext: AIErrorContext = {
    ...context,
    workflowState,
    operation: 'workflow'
  };

  return handleAIError(error, workflowContext, {
    enableFallback: true,
    maxRetries: 2,
    logAIErrors: true
  });
}

/**
 * Handle provider timeout with automatic fallback
 * @param provider - Current provider
 * @param operation - Current operation
 * @param timeoutMs - Timeout duration in milliseconds
 * @returns AIErrorResult with timeout handling
 */
export function handleProviderTimeout(
  provider: 'openai' | 'gemini',
  operation: AIErrorContext['operation'],
  timeoutMs: number
): AIErrorResult {
  const context = createAIErrorContext(provider, operation, {
    retryCount: 1
  });

  return handleAIError('AI_TIMEOUT', context, {
    enableFallback: true,
    logAIErrors: true
  });
}

/**
 * Check if error is recoverable with retry
 * @param errorResult - AI error result
 * @returns boolean indicating if retry is recommended
 */
export function isRecoverableError(errorResult: AIErrorResult): boolean {
  return errorResult.isRetryable && 
         errorResult.category !== ErrorCategory.VALIDATION &&
         (errorResult.context.retryCount || 0) < 3;
}

/**
 * Get recommended retry delay for AI errors
 * @param errorResult - AI error result
 * @returns Delay in seconds
 */
export function getAIRetryDelay(errorResult: AIErrorResult): number {
  if (errorResult.retryAfter) {
    return errorResult.retryAfter;
  }

  // Exponential backoff based on retry count
  const retryCount = errorResult.context.retryCount || 0;
  const baseDelay = 5; // 5 seconds base delay
  
  return Math.min(baseDelay * Math.pow(2, retryCount), 120); // Max 2 minutes
}