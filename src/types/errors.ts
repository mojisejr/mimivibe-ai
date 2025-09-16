/**
 * Comprehensive Error Types for MiMiVibes AI Tarot Platform
 * 
 * This file defines all error types, interfaces, and enums used throughout
 * the application for type-safe error handling and user-friendly messaging.
 * 
 * Created: 2025-09-16 17:40:29
 * Issue: #176 - Error Message Improvements
 */

// Base Error Categories
export enum ErrorCategory {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication', 
  AUTHORIZATION = 'authorization',
  RATE_LIMIT = 'rate_limit',
  AI_SERVICE = 'ai_service',
  SYSTEM = 'system'
}

// Specific Error Codes
export enum ErrorCode {
  // Validation Errors
  QUESTION_TOO_SHORT = 'question_too_short',
  QUESTION_TOO_LONG = 'question_too_long',
  QUESTION_INAPPROPRIATE = 'question_inappropriate',
  INVALID_INPUT_FORMAT = 'invalid_input_format',
  
  // Authentication Errors
  USER_NOT_AUTHENTICATED = 'user_not_authenticated',
  SESSION_EXPIRED = 'session_expired',
  INVALID_CREDENTIALS = 'invalid_credentials',
  
  // Authorization Errors
  INSUFFICIENT_CREDITS = 'insufficient_credits',
  FEATURE_NOT_AVAILABLE = 'feature_not_available',
  ACCOUNT_SUSPENDED = 'account_suspended',
  
  // Rate Limiting
  TOO_MANY_REQUESTS = 'too_many_requests',
  DAILY_LIMIT_EXCEEDED = 'daily_limit_exceeded',
  
  // AI Service Errors
  AI_SERVICE_UNAVAILABLE = 'ai_service_unavailable',
  AI_PROCESSING_FAILED = 'ai_processing_failed',
  AI_TIMEOUT = 'ai_timeout',
  READING_GENERATION_FAILED = 'reading_generation_failed',
  
  // System Errors
  DATABASE_ERROR = 'database_error',
  NETWORK_ERROR = 'network_error',
  INTERNAL_SERVER_ERROR = 'internal_server_error',
  SERVICE_MAINTENANCE = 'service_maintenance'
}

// Error Severity Levels
export enum ErrorSeverity {
  LOW = 'low',        // User can continue with minor inconvenience
  MEDIUM = 'medium',  // User action blocked but recoverable
  HIGH = 'high',      // Critical error requiring immediate attention
  CRITICAL = 'critical' // System-wide issue
}

// Base Error Interface
export interface BaseError {
  code: ErrorCode;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  timestamp: string;
  requestId?: string;
  userId?: string;
}

// API Error Response Interface
export interface ApiErrorResponse {
  success: false;
  error: BaseError;
  details?: Record<string, any>;
  suggestions?: string[];
  retryAfter?: number; // seconds
  supportContact?: string;
}

// Frontend Error State Interface
export interface ErrorState {
  hasError: boolean;
  error: BaseError | null;
  isRetrying: boolean;
  retryCount: number;
  maxRetries: number;
}

// Error Context for Enhanced Debugging
export interface ErrorContext {
  component?: string;
  action?: string;
  userAgent?: string;
  url?: string;
  httpStatus?: number;
  additionalData?: Record<string, any>;
}

// Validation Error Details
export interface ValidationErrorDetails {
  field: string;
  value: any;
  constraint: string;
  expectedFormat?: string;
}

// AI Service Error Details
export interface AiServiceErrorDetails {
  provider: 'openai' | 'google' | 'fallback';
  model: string;
  tokenCount?: number;
  processingTime?: number;
  fallbackAttempted?: boolean;
}

// Rate Limit Error Details
export interface RateLimitErrorDetails {
  limit: number;
  remaining: number;
  resetTime: string;
  retryAfter: number;
}

// Enhanced Error Interface with Details
export interface EnhancedError extends BaseError {
  context?: ErrorContext;
  validationDetails?: ValidationErrorDetails[];
  aiServiceDetails?: AiServiceErrorDetails;
  rateLimitDetails?: RateLimitErrorDetails;
  stackTrace?: string; // Only in development
}

// Error Handler Function Type
export type ErrorHandler = (error: EnhancedError) => void;

// Error Recovery Action Interface
export interface ErrorRecoveryAction {
  label: string;
  action: () => void | Promise<void>;
  isPrimary?: boolean;
  isDestructive?: boolean;
}

// User-Facing Error Display Interface
export interface ErrorDisplayProps {
  error: BaseError;
  onRetry?: () => void;
  onDismiss?: () => void;
  recoveryActions?: ErrorRecoveryAction[];
  showDetails?: boolean;
  className?: string;
}

// Error Boundary State Interface
export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
  errorId: string;
}

// Type Guards
export const isApiErrorResponse = (obj: any): obj is ApiErrorResponse => {
  return obj && typeof obj === 'object' && obj.success === false && obj.error;
};

export const isEnhancedError = (obj: any): obj is EnhancedError => {
  return obj && typeof obj === 'object' && obj.code && obj.category && obj.severity;
};

// Error Creation Helpers
export const createBaseError = (
  code: ErrorCode,
  category: ErrorCategory,
  severity: ErrorSeverity,
  message: string,
  userMessage: string,
  context?: ErrorContext
): EnhancedError => ({
  code,
  category,
  severity,
  message,
  userMessage,
  timestamp: new Date().toISOString(),
  context
});

// Common Error Types for Type Safety
export type ValidationError = EnhancedError & {
  category: ErrorCategory.VALIDATION;
  validationDetails: ValidationErrorDetails[];
};

export type AuthenticationError = EnhancedError & {
  category: ErrorCategory.AUTHENTICATION;
};

export type AuthorizationError = EnhancedError & {
  category: ErrorCategory.AUTHORIZATION;
};

export type RateLimitError = EnhancedError & {
  category: ErrorCategory.RATE_LIMIT;
  rateLimitDetails: RateLimitErrorDetails;
};

export type AiServiceError = EnhancedError & {
  category: ErrorCategory.AI_SERVICE;
  aiServiceDetails: AiServiceErrorDetails;
};

export type SystemError = EnhancedError & {
  category: ErrorCategory.SYSTEM;
};