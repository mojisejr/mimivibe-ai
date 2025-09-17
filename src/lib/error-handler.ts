// Centralized Error Handling Utilities
// Provides consistent error handling across all API routes and components

import { NextResponse } from 'next/server';
import { 
  ErrorCode, 
  StandardizedError, 
  createErrorResponse, 
  ERROR_STATUS_CODES,
  toLegacyError 
} from '@/types/error';

// Enhanced error handler for API routes
export function handleAPIError(
  error: unknown,
  path: string,
  useLegacyFormat: boolean = false
): NextResponse {
  let errorResponse: StandardizedError;
  
  // Handle different error types
  if (error instanceof APIError) {
    errorResponse = createErrorResponse(
      error.code,
      path,
      error.details,
      error.field,
      error.retryAfter
    );
  } else if (error instanceof Error) {
    // Map common error messages to appropriate codes
    const code = mapErrorMessageToCode(error.message);
    errorResponse = createErrorResponse(code, path, error.message);
  } else {
    // Unknown error type
    errorResponse = createErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      path,
      String(error)
    );
  }
  
  const statusCode = ERROR_STATUS_CODES[errorResponse.error.code];
  
  // Return legacy format for backward compatibility if requested
  if (useLegacyFormat) {
    return NextResponse.json(toLegacyError(errorResponse), { status: statusCode });
  }
  
  return NextResponse.json(errorResponse, { status: statusCode });
}

// Custom API Error class for structured error handling
export class APIError extends Error {
  constructor(
    public code: ErrorCode,
    public details?: string,
    public field?: string,
    public retryAfter?: number
  ) {
    super(details || code);
    this.name = 'APIError';
  }
}

// Validation error handler
export function createValidationError(
  field: string,
  message: string,
  path: string
): StandardizedError {
  return createErrorResponse(
    ErrorCode.INVALID_INPUT,
    path,
    message,
    field
  );
}

// Rate limit error handler
export function createRateLimitError(
  path: string,
  retryAfter: number,
  type: 'normal' | 'strict' | 'abuse' = 'normal'
): StandardizedError {
  const codeMap = {
    normal: ErrorCode.RATE_LIMITED,
    strict: ErrorCode.RATE_LIMITED_STRICT,
    abuse: ErrorCode.RATE_LIMITED_ABUSE
  };
  
  return createErrorResponse(
    codeMap[type],
    path,
    undefined,
    undefined,
    retryAfter
  );
}

// AI error handler
export function createAIError(
  type: 'generation' | 'timeout' | 'unavailable' | 'parsing',
  path: string,
  details?: string
): StandardizedError {
  const codeMap = {
    generation: ErrorCode.AI_GENERATION_FAILED,
    timeout: ErrorCode.AI_TIMEOUT,
    unavailable: ErrorCode.AI_PROVIDER_UNAVAILABLE,
    parsing: ErrorCode.AI_PARSING_ERROR
  };
  
  return createErrorResponse(codeMap[type], path, details);
}

// Database error handler
export function createDatabaseError(
  path: string,
  details?: string,
  isTransaction: boolean = false
): StandardizedError {
  const code = isTransaction ? ErrorCode.TRANSACTION_FAILED : ErrorCode.DATABASE_ERROR;
  return createErrorResponse(code, path, details);
}

// Question validation with standardized errors
export function validateQuestion(question: string, path: string): StandardizedError | null {
  if (!question || typeof question !== 'string') {
    return createErrorResponse(ErrorCode.MISSING_QUESTION, path);
  }
  
  const trimmed = question.trim();
  
  if (trimmed.length < 10) {
    return createErrorResponse(
      ErrorCode.QUESTION_TOO_SHORT,
      path,
      `คำถามมี ${trimmed.length} ตัวอักษร ต้องการอย่างน้อย 10 ตัวอักษร`
    );
  }
  
  if (trimmed.length > 500) {
    return createErrorResponse(
      ErrorCode.QUESTION_TOO_LONG,
      path,
      `คำถามมี ${trimmed.length} ตัวอักษร เกินขีดจำกัด 500 ตัวอักษร`
    );
  }
  
  return null; // Valid question
}

// Credit validation
export function validateCredits(
  userCredits: { stars: number; freePoint: number },
  path: string
): StandardizedError | null {
  if (userCredits.stars <= 0 && userCredits.freePoint <= 0) {
    return createErrorResponse(
      ErrorCode.INSUFFICIENT_CREDITS,
      path,
      `เครดิตปัจจุบัน: ${userCredits.stars} ดาว, ${userCredits.freePoint} คะแนนฟรี`
    );
  }
  
  return null; // Sufficient credits
}

// Map common error messages to appropriate error codes
function mapErrorMessageToCode(message: string): ErrorCode {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
    return ErrorCode.AI_TIMEOUT;
  }
  
  if (lowerMessage.includes('unauthorized') || lowerMessage.includes('auth')) {
    return ErrorCode.UNAUTHORIZED;
  }
  
  if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many')) {
    return ErrorCode.RATE_LIMITED;
  }
  
  if (lowerMessage.includes('database') || lowerMessage.includes('prisma')) {
    return ErrorCode.DATABASE_ERROR;
  }
  
  if (lowerMessage.includes('ai') || lowerMessage.includes('llm') || lowerMessage.includes('generation')) {
    return ErrorCode.AI_GENERATION_FAILED;
  }
  
  if (lowerMessage.includes('parsing') || lowerMessage.includes('json')) {
    return ErrorCode.AI_PARSING_ERROR;
  }
  
  return ErrorCode.INTERNAL_ERROR;
}

// Security error handler for prompt injection and abuse
export function createSecurityError(
  path: string,
  details?: string
): StandardizedError {
  return createErrorResponse(ErrorCode.SECURITY_VIOLATION, path, details);
}

// Content moderation error handler
export function createContentError(
  path: string,
  details?: string
): StandardizedError {
  return createErrorResponse(ErrorCode.INAPPROPRIATE_CONTENT, path, details);
}

// Helper to check if error should use legacy format (for backward compatibility)
export function shouldUseLegacyFormat(userAgent?: string): boolean {
  // For now, always use new format unless specifically requested
  // This can be expanded to check for old client versions
  return false;
}