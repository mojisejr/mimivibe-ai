/**
 * Backend Error Handler
 * 
 * Specialized error handling for API routes and server-side operations.
 * Provides structured error responses, logging, and monitoring integration.
 */

import { NextResponse } from 'next/server';
import { categorizeError, createCategorizedErrorResponse, ErrorCategory } from '../categories';

export interface BackendErrorContext {
  path: string;
  method: string;
  userId?: string;
  requestId?: string;
  userAgent?: string;
  ip?: string;
}

export interface BackendErrorHandlerOptions {
  logError?: boolean;
  includeStack?: boolean;
  notifyMonitoring?: boolean;
  customMessage?: string;
}

/**
 * Handle backend API errors with structured responses and logging
 * @param error - Error object or error code
 * @param context - Request context information
 * @param options - Configuration options for error handling
 * @returns NextResponse with structured error data
 */
export function handleBackendError(
  error: Error | string,
  context: BackendErrorContext,
  options: BackendErrorHandlerOptions = {}
): NextResponse {
  const {
    logError = true,
    includeStack = process.env.NODE_ENV === 'development',
    notifyMonitoring = process.env.NODE_ENV === 'production',
    customMessage
  } = options;

  let errorCode: string;
  let errorMessage: string | undefined;
  let stack: string | undefined;

  // Extract error information
  if (error instanceof Error) {
    errorCode = error.name || 'UNKNOWN_ERROR';
    errorMessage = error.message;
    stack = error.stack;
  } else {
    errorCode = error;
    errorMessage = customMessage;
  }

  // Create categorized error response
  const errorResponse = createCategorizedErrorResponse(
    errorCode,
    context.path,
    errorMessage
  );

  // Add stack trace in development
  if (includeStack && stack) {
    (errorResponse as any).stack = stack;
  }

  // Add request context
  (errorResponse as any).context = {
    method: context.method,
    userId: context.userId,
    requestId: context.requestId,
    timestamp: new Date().toISOString()
  };

  // Log error details
  if (logError) {
    const logData = {
      error: errorCode,
      message: errorMessage,
      category: errorResponse.category,
      path: context.path,
      method: context.method,
      userId: context.userId,
      requestId: context.requestId,
      userAgent: context.userAgent,
      ip: context.ip,
      timestamp: errorResponse.timestamp
    };

    if (errorResponse.category === ErrorCategory.SYSTEM) {
      console.error('Backend System Error:', logData, stack ? { stack } : {});
    } else {
      console.warn('Backend Error:', logData);
    }
  }

  // Notify monitoring service in production
  if (notifyMonitoring && errorResponse.category === ErrorCategory.SYSTEM) {
    // Note: This would integrate with your monitoring service (e.g., Sentry, DataDog)
    console.info('Monitoring notification would be sent for:', {
      error: errorCode,
      category: errorResponse.category,
      path: context.path,
      userId: context.userId
    });
  }

  // Determine HTTP status code based on error category
  const statusCode = getHttpStatusCode(errorResponse.category, errorCode);

  return NextResponse.json(errorResponse, { status: statusCode });
}

/**
 * Get appropriate HTTP status code for error category
 * @param category - Error category
 * @param errorCode - Specific error code
 * @returns HTTP status code
 */
function getHttpStatusCode(category: ErrorCategory, errorCode: string): number {
  switch (category) {
    case ErrorCategory.VALIDATION:
      return 400; // Bad Request
    case ErrorCategory.AUTHENTICATION:
      if (errorCode === 'AUTHENTICATION_REQUIRED') {
        return 401; // Unauthorized
      }
      if (errorCode === 'INSUFFICIENT_CREDITS') {
        return 402; // Payment Required
      }
      return 403; // Forbidden
    case ErrorCategory.RATE_LIMIT:
      return 429; // Too Many Requests
    case ErrorCategory.AI_PROCESSING:
      if (errorCode === 'AI_TIMEOUT') {
        return 408; // Request Timeout
      }
      return 503; // Service Unavailable
    case ErrorCategory.SYSTEM:
      if (errorCode === 'MAINTENANCE_MODE') {
        return 503; // Service Unavailable
      }
      return 500; // Internal Server Error
    default:
      return 500; // Internal Server Error
  }
}

/**
 * Create error context from Next.js request
 * @param request - Next.js request object
 * @param path - API path
 * @param userId - Optional user ID
 * @returns BackendErrorContext object
 */
export function createErrorContext(
  request: Request,
  path: string,
  userId?: string
): BackendErrorContext {
  const url = new URL(request.url);
  
  return {
    path,
    method: request.method,
    userId,
    requestId: request.headers.get('x-request-id') || undefined,
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.headers.get('x-forwarded-for') || 
        request.headers.get('x-real-ip') || 
        'unknown'
  };
}

/**
 * Middleware error handler for unhandled errors
 * @param error - Unhandled error
 * @param context - Request context
 * @returns NextResponse with error details
 */
export function handleUnhandledError(
  error: unknown,
  context: BackendErrorContext
): NextResponse {
  console.error('Unhandled Backend Error:', error);

  // Convert unknown error to Error object
  let processedError: Error;
  if (error instanceof Error) {
    processedError = error;
  } else {
    processedError = new Error(String(error));
    processedError.name = 'UNHANDLED_ERROR';
  }

  return handleBackendError(processedError, context, {
    logError: true,
    includeStack: true,
    notifyMonitoring: true
  });
}

/**
 * Validation error helper
 * @param validationErrors - Array of validation error messages
 * @param context - Request context
 * @returns NextResponse with validation error details
 */
export function handleValidationError(
  validationErrors: string[],
  context: BackendErrorContext
): NextResponse {
  const errorMessage = validationErrors.join(', ');
  
  return handleBackendError('VALIDATION_ERROR', context, {
    customMessage: errorMessage,
    logError: true
  });
}

/**
 * Rate limit error helper
 * @param retryAfter - Seconds to wait before retry
 * @param context - Request context
 * @returns NextResponse with rate limit error
 */
export function handleRateLimitError(
  retryAfter: number,
  context: BackendErrorContext
): NextResponse {
  const response = handleBackendError('RATE_LIMIT_EXCEEDED', context);
  
  // Add Retry-After header
  response.headers.set('Retry-After', retryAfter.toString());
  
  return response;
}

/**
 * Authentication error helper
 * @param errorCode - Specific auth error code
 * @param context - Request context
 * @returns NextResponse with authentication error
 */
export function handleAuthError(
  errorCode: 'AUTHENTICATION_REQUIRED' | 'INSUFFICIENT_CREDITS' | 'USER_SUSPENDED',
  context: BackendErrorContext
): NextResponse {
  return handleBackendError(errorCode, context, {
    logError: true,
    notifyMonitoring: errorCode === 'USER_SUSPENDED'
  });
}