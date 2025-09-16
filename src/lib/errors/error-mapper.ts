/**
 * Error Mapper for MiMiVibes AI Tarot Platform
 * 
 * This file contains functions to map various error types to standardized
 * error objects with user-friendly messages. It handles error transformation,
 * logging, and provides recovery suggestions.
 * 
 * Created: 2025-09-16 17:40:29
 * Issue: #176 - Error Message Improvements
 */

import { 
  ErrorCode, 
  ErrorCategory, 
  ErrorSeverity, 
  EnhancedError, 
  ApiErrorResponse,
  ValidationErrorDetails,
  AiServiceErrorDetails,
  RateLimitErrorDetails,
  ErrorContext,
  createBaseError
} from '@/types/errors';
import { getErrorMessage, Language } from './error-dictionary';

// HTTP Status Code to Error Code Mapping
const HTTP_STATUS_TO_ERROR_CODE: Record<number, ErrorCode> = {
  400: ErrorCode.INVALID_INPUT_FORMAT,
  401: ErrorCode.USER_NOT_AUTHENTICATED,
  403: ErrorCode.INSUFFICIENT_CREDITS,
  404: ErrorCode.INTERNAL_SERVER_ERROR,
  429: ErrorCode.TOO_MANY_REQUESTS,
  500: ErrorCode.INTERNAL_SERVER_ERROR,
  502: ErrorCode.AI_SERVICE_UNAVAILABLE,
  503: ErrorCode.SERVICE_MAINTENANCE,
  504: ErrorCode.AI_TIMEOUT
};

// Error Pattern Matchers
const ERROR_PATTERNS = {
  validation: /validation|invalid|required|format/i,
  authentication: /auth|login|signin|token|session/i,
  authorization: /permission|access|forbidden|credit/i,
  rateLimit: /rate|limit|quota|throttle/i,
  aiService: /ai|openai|google|gemini|llm|model/i,
  network: /network|connection|timeout|fetch/i,
  database: /database|db|sql|prisma/i
};

// Main Error Mapping Function
export const mapErrorToEnhanced = (
  error: any,
  context?: ErrorContext,
  language: Language = 'th'
): EnhancedError => {
  // Handle already enhanced errors
  if (error && typeof error === 'object' && error.code && error.category) {
    return error as EnhancedError;
  }

  // Handle HTTP Response Errors
  if (error?.response?.status) {
    return mapHttpErrorToEnhanced(error, context, language);
  }

  // Handle JavaScript Errors
  if (error instanceof Error) {
    return mapJavaScriptErrorToEnhanced(error, context, language);
  }

  // Handle String Errors
  if (typeof error === 'string') {
    return mapStringErrorToEnhanced(error, context, language);
  }

  // Handle API Error Responses
  if (error?.error && error?.success === false) {
    return error.error as EnhancedError;
  }

  // Fallback for unknown errors
  return createBaseError(
    ErrorCode.INTERNAL_SERVER_ERROR,
    ErrorCategory.SYSTEM,
    ErrorSeverity.HIGH,
    'Unknown error occurred',
    getErrorMessage(ErrorCode.INTERNAL_SERVER_ERROR, language).description,
    context
  );
};

// HTTP Error Mapping
export const mapHttpErrorToEnhanced = (
  error: any,
  context?: ErrorContext,
  language: Language = 'th'
): EnhancedError => {
  const status = error.response?.status || 500;
  const errorCode = HTTP_STATUS_TO_ERROR_CODE[status] || ErrorCode.INTERNAL_SERVER_ERROR;
  const category = getErrorCategoryFromCode(errorCode);
  const severity = getErrorSeverityFromStatus(status);
  
  const message = error.response?.data?.message || error.message || 'HTTP Error';
  const userMessage = getErrorMessage(errorCode, language);

  const enhancedError = createBaseError(
    errorCode,
    category,
    severity,
    message,
    userMessage.description,
    context
  );

  // Add rate limit details if applicable
  if (status === 429) {
    enhancedError.rateLimitDetails = {
      limit: error.response?.headers?.['x-ratelimit-limit'] || 100,
      remaining: error.response?.headers?.['x-ratelimit-remaining'] || 0,
      resetTime: error.response?.headers?.['x-ratelimit-reset'] || new Date(Date.now() + 3600000).toISOString(),
      retryAfter: error.response?.headers?.['retry-after'] || 60
    };
  }

  return enhancedError;
};

// JavaScript Error Mapping
export const mapJavaScriptErrorToEnhanced = (
  error: Error,
  context?: ErrorContext,
  language: Language = 'th'
): EnhancedError => {
  const errorMessage = error.message.toLowerCase();
  let errorCode = ErrorCode.INTERNAL_SERVER_ERROR;
  let category = ErrorCategory.SYSTEM;

  // Pattern matching for error categorization
  if (ERROR_PATTERNS.network.test(errorMessage)) {
    errorCode = ErrorCode.NETWORK_ERROR;
    category = ErrorCategory.SYSTEM;
  } else if (ERROR_PATTERNS.authentication.test(errorMessage)) {
    errorCode = ErrorCode.USER_NOT_AUTHENTICATED;
    category = ErrorCategory.AUTHENTICATION;
  } else if (ERROR_PATTERNS.validation.test(errorMessage)) {
    errorCode = ErrorCode.INVALID_INPUT_FORMAT;
    category = ErrorCategory.VALIDATION;
  } else if (ERROR_PATTERNS.aiService.test(errorMessage)) {
    errorCode = ErrorCode.AI_PROCESSING_FAILED;
    category = ErrorCategory.AI_SERVICE;
  } else if (ERROR_PATTERNS.database.test(errorMessage)) {
    errorCode = ErrorCode.DATABASE_ERROR;
    category = ErrorCategory.SYSTEM;
  }

  const severity = getErrorSeverityFromCategory(category);
  const userMessage = getErrorMessage(errorCode, language);

  const enhancedError = createBaseError(
    errorCode,
    category,
    severity,
    error.message,
    userMessage.description,
    context
  );

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    enhancedError.stackTrace = error.stack;
  }

  return enhancedError;
};

// String Error Mapping
export const mapStringErrorToEnhanced = (
  error: string,
  context?: ErrorContext,
  language: Language = 'th'
): EnhancedError => {
  const errorMessage = error.toLowerCase();
  let errorCode = ErrorCode.INTERNAL_SERVER_ERROR;
  let category = ErrorCategory.SYSTEM;

  // Common string error patterns
  if (errorMessage.includes('question too short')) {
    errorCode = ErrorCode.QUESTION_TOO_SHORT;
    category = ErrorCategory.VALIDATION;
  } else if (errorMessage.includes('question too long')) {
    errorCode = ErrorCode.QUESTION_TOO_LONG;
    category = ErrorCategory.VALIDATION;
  } else if (errorMessage.includes('inappropriate')) {
    errorCode = ErrorCode.QUESTION_INAPPROPRIATE;
    category = ErrorCategory.VALIDATION;
  } else if (errorMessage.includes('insufficient credits')) {
    errorCode = ErrorCode.INSUFFICIENT_CREDITS;
    category = ErrorCategory.AUTHORIZATION;
  } else if (errorMessage.includes('not authenticated')) {
    errorCode = ErrorCode.USER_NOT_AUTHENTICATED;
    category = ErrorCategory.AUTHENTICATION;
  }

  const severity = getErrorSeverityFromCategory(category);
  const userMessage = getErrorMessage(errorCode, language);

  return createBaseError(
    errorCode,
    category,
    severity,
    error,
    userMessage.description,
    context
  );
};

// Validation Error Mapping
export const mapValidationErrorToEnhanced = (
  validationErrors: ValidationErrorDetails[],
  context?: ErrorContext,
  language: Language = 'th'
): EnhancedError => {
  const firstError = validationErrors[0];
  let errorCode = ErrorCode.INVALID_INPUT_FORMAT;

  // Determine specific validation error code
  if (firstError?.field === 'question') {
    if (firstError.constraint.includes('min')) {
      errorCode = ErrorCode.QUESTION_TOO_SHORT;
    } else if (firstError.constraint.includes('max')) {
      errorCode = ErrorCode.QUESTION_TOO_LONG;
    }
  }

  const userMessage = getErrorMessage(errorCode, language);
  const enhancedError = createBaseError(
    errorCode,
    ErrorCategory.VALIDATION,
    ErrorSeverity.MEDIUM,
    `Validation failed: ${validationErrors.map(e => e.constraint).join(', ')}`,
    userMessage.description,
    context
  );

  enhancedError.validationDetails = validationErrors;
  return enhancedError;
};

// AI Service Error Mapping
export const mapAiServiceErrorToEnhanced = (
  aiError: any,
  provider: 'openai' | 'google' | 'fallback',
  model: string,
  context?: ErrorContext,
  language: Language = 'th'
): EnhancedError => {
  let errorCode = ErrorCode.AI_PROCESSING_FAILED;

  // Determine specific AI error code
  if (aiError?.message?.includes('timeout')) {
    errorCode = ErrorCode.AI_TIMEOUT;
  } else if (aiError?.status === 503 || aiError?.message?.includes('unavailable')) {
    errorCode = ErrorCode.AI_SERVICE_UNAVAILABLE;
  } else if (aiError?.message?.includes('generation failed')) {
    errorCode = ErrorCode.READING_GENERATION_FAILED;
  }

  const userMessage = getErrorMessage(errorCode, language);
  const enhancedError = createBaseError(
    errorCode,
    ErrorCategory.AI_SERVICE,
    ErrorSeverity.HIGH,
    aiError?.message || 'AI service error',
    userMessage.description,
    context
  );

  enhancedError.aiServiceDetails = {
    provider,
    model,
    tokenCount: aiError?.tokenCount,
    processingTime: aiError?.processingTime,
    fallbackAttempted: provider === 'fallback'
  };

  return enhancedError;
};

// Rate Limit Error Mapping
export const mapRateLimitErrorToEnhanced = (
  limit: number,
  remaining: number,
  resetTime: string,
  retryAfter: number,
  context?: ErrorContext,
  language: Language = 'th'
): EnhancedError => {
  const errorCode = remaining === 0 ? ErrorCode.DAILY_LIMIT_EXCEEDED : ErrorCode.TOO_MANY_REQUESTS;
  const userMessage = getErrorMessage(errorCode, language);

  const enhancedError = createBaseError(
    errorCode,
    ErrorCategory.RATE_LIMIT,
    ErrorSeverity.MEDIUM,
    `Rate limit exceeded: ${remaining}/${limit} remaining`,
    userMessage.description,
    context
  );

  enhancedError.rateLimitDetails = {
    limit,
    remaining,
    resetTime,
    retryAfter
  };

  return enhancedError;
};

// API Response Creator
export const createApiErrorResponse = (
  error: EnhancedError,
  suggestions?: string[],
  retryAfter?: number,
  supportContact?: string
): ApiErrorResponse => {
  return {
    success: false,
    error,
    suggestions,
    retryAfter,
    supportContact: supportContact || 'support@mimivibes.com'
  };
};

// Helper Functions
const getErrorCategoryFromCode = (code: ErrorCode): ErrorCategory => {
  const validationCodes = [
    ErrorCode.QUESTION_TOO_SHORT,
    ErrorCode.QUESTION_TOO_LONG,
    ErrorCode.QUESTION_INAPPROPRIATE,
    ErrorCode.INVALID_INPUT_FORMAT
  ];

  const authCodes = [
    ErrorCode.USER_NOT_AUTHENTICATED,
    ErrorCode.SESSION_EXPIRED,
    ErrorCode.INVALID_CREDENTIALS
  ];

  const authzCodes = [
    ErrorCode.INSUFFICIENT_CREDITS,
    ErrorCode.FEATURE_NOT_AVAILABLE,
    ErrorCode.ACCOUNT_SUSPENDED
  ];

  const rateLimitCodes = [
    ErrorCode.TOO_MANY_REQUESTS,
    ErrorCode.DAILY_LIMIT_EXCEEDED
  ];

  const aiCodes = [
    ErrorCode.AI_SERVICE_UNAVAILABLE,
    ErrorCode.AI_PROCESSING_FAILED,
    ErrorCode.AI_TIMEOUT,
    ErrorCode.READING_GENERATION_FAILED
  ];

  if (validationCodes.includes(code)) return ErrorCategory.VALIDATION;
  if (authCodes.includes(code)) return ErrorCategory.AUTHENTICATION;
  if (authzCodes.includes(code)) return ErrorCategory.AUTHORIZATION;
  if (rateLimitCodes.includes(code)) return ErrorCategory.RATE_LIMIT;
  if (aiCodes.includes(code)) return ErrorCategory.AI_SERVICE;
  
  return ErrorCategory.SYSTEM;
};

const getErrorSeverityFromStatus = (status: number): ErrorSeverity => {
  if (status >= 500) return ErrorSeverity.HIGH;
  if (status >= 400) return ErrorSeverity.MEDIUM;
  return ErrorSeverity.LOW;
};

const getErrorSeverityFromCategory = (category: ErrorCategory): ErrorSeverity => {
  switch (category) {
    case ErrorCategory.VALIDATION:
      return ErrorSeverity.MEDIUM;
    case ErrorCategory.AUTHENTICATION:
      return ErrorSeverity.HIGH;
    case ErrorCategory.AUTHORIZATION:
      return ErrorSeverity.MEDIUM;
    case ErrorCategory.RATE_LIMIT:
      return ErrorSeverity.MEDIUM;
    case ErrorCategory.AI_SERVICE:
      return ErrorSeverity.HIGH;
    case ErrorCategory.SYSTEM:
      return ErrorSeverity.HIGH;
    default:
      return ErrorSeverity.MEDIUM;
  }
};

// Error Recovery Suggestions
export const getRecoverySuggestions = (error: EnhancedError, language: Language = 'th'): string[] => {
  const suggestions: string[] = [];

  switch (error.category) {
    case ErrorCategory.VALIDATION:
      if (language === 'th') {
        suggestions.push('ตรวจสอบและแก้ไขข้อมูลที่ป้อน');
        suggestions.push('อ่านคำแนะนำการใช้งาน');
      } else {
        suggestions.push('Check and correct the input data');
        suggestions.push('Read the usage guidelines');
      }
      break;

    case ErrorCategory.AUTHENTICATION:
      if (language === 'th') {
        suggestions.push('เข้าสู่ระบบใหม่');
        suggestions.push('ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
      } else {
        suggestions.push('Sign in again');
        suggestions.push('Check your internet connection');
      }
      break;

    case ErrorCategory.AUTHORIZATION:
      if (language === 'th') {
        suggestions.push('ซื้อเครดิตเพิ่ม');
        suggestions.push('ตรวจสอบสถานะบัญชี');
      } else {
        suggestions.push('Purchase more credits');
        suggestions.push('Check account status');
      }
      break;

    case ErrorCategory.RATE_LIMIT:
      if (language === 'th') {
        suggestions.push('รอสักครู่แล้วลองใหม่');
        suggestions.push('ซื้อเครดิตเพื่อเพิ่มขีดจำกัด');
      } else {
        suggestions.push('Wait a moment and try again');
        suggestions.push('Purchase credits to increase limits');
      }
      break;

    case ErrorCategory.AI_SERVICE:
      if (language === 'th') {
        suggestions.push('ลองใหม่ในอีกสักครู่');
        suggestions.push('ลองถามด้วยคำถามที่ง่ายกว่า');
      } else {
        suggestions.push('Try again in a moment');
        suggestions.push('Try asking with a simpler question');
      }
      break;

    case ErrorCategory.SYSTEM:
      if (language === 'th') {
        suggestions.push('รีเฟรชหน้าเว็บ');
        suggestions.push('ติดต่อทีมสนับสนุน');
      } else {
        suggestions.push('Refresh the page');
        suggestions.push('Contact support team');
      }
      break;
  }

  return suggestions;
};