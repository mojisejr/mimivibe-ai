/**
 * Centralized Error Types
 * 
 * Comprehensive type definitions for the error handling system.
 * Provides TypeScript interfaces and types for all error-related functionality.
 */

import type { ErrorCategory, CategorizedError } from './categories';

// Frontend Error Types
export interface ErrorState {
  hasError: boolean;
  error: string | null;
  category: ErrorCategory | null;
  isRetryable: boolean;
  retryCount: number;
  lastRetryAt: Date | null;
}

export interface ErrorDisplayOptions {
  showToast?: boolean;
  showModal?: boolean;
  showInline?: boolean;
  autoHide?: boolean;
  hideAfter?: number;
  position?: 'top' | 'bottom' | 'center';
  variant?: 'error' | 'warning' | 'info';
}

export interface FrontendErrorHandlerOptions {
  enableRetry?: boolean;
  maxRetries?: number;
  showUserFriendlyMessages?: boolean;
  logErrors?: boolean;
  trackAnalytics?: boolean;
  displayOptions?: ErrorDisplayOptions;
}

// Backend Error Types
export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  endpoint?: string;
  method?: string;
  userAgent?: string;
  ip?: string;
  timestamp?: Date;
  additionalData?: Record<string, any>;
}

export interface BackendErrorHandlerOptions {
  enableLogging?: boolean;
  enableMonitoring?: boolean;
  includeStackTrace?: boolean;
  sanitizeResponse?: boolean;
  logLevel?: 'error' | 'warn' | 'info' | 'debug';
  monitoringService?: 'sentry' | 'datadog' | 'custom';
}

export interface ErrorResponse {
  success: false;
  error: string;
  category: ErrorCategory;
  isRetryable: boolean;
  retryAfter?: number;
  requestId?: string;
  timestamp: string;
  details?: Record<string, any>;
}

// AI Error Types
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

// Generic Error Handler Types
export interface BaseErrorHandler<TContext = any, TOptions = any, TResult = any> {
  handle(error: Error | string, context?: TContext, options?: TOptions): TResult;
}

export interface RetryableError {
  isRetryable: boolean;
  retryAfter?: number;
  maxRetries?: number;
  retryCount?: number;
}

export interface LoggableError {
  shouldLog: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  logData?: Record<string, any>;
}

// Error Statistics Types
export interface ErrorStats {
  totalErrors: number;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsByCode: Record<string, number>;
  retryableErrors: number;
  resolvedErrors: number;
  averageResolutionTime: number;
  lastUpdated: Date;
}

export interface ErrorTrend {
  period: 'hour' | 'day' | 'week' | 'month';
  timestamp: Date;
  errorCount: number;
  category: ErrorCategory;
  code: string;
}

// Validation Error Types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: ValidationError[];
}

// Error Monitoring Types
export interface ErrorAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  errorCode: string;
  category: ErrorCategory;
  count: number;
  firstOccurrence: Date;
  lastOccurrence: Date;
  isResolved: boolean;
  resolvedAt?: Date;
  assignedTo?: string;
}

export interface ErrorMetrics {
  errorRate: number;
  errorCount: number;
  uniqueErrors: number;
  criticalErrors: number;
  averageResponseTime: number;
  uptime: number;
  period: {
    start: Date;
    end: Date;
  };
}

// Error Recovery Types
export interface RecoveryStrategy {
  type: 'retry' | 'fallback' | 'circuit_breaker' | 'graceful_degradation';
  config: Record<string, any>;
  isApplicable: (error: CategorizedError) => boolean;
  execute: (error: CategorizedError, context?: any) => Promise<any>;
}

export interface CircuitBreakerState {
  isOpen: boolean;
  failureCount: number;
  lastFailureTime: Date | null;
  nextAttemptTime: Date | null;
  successCount: number;
  state: 'closed' | 'open' | 'half_open';
}

// Error Reporting Types
export interface ErrorReport {
  id: string;
  timestamp: Date;
  error: CategorizedError;
  context: ErrorContext;
  stackTrace?: string;
  userAgent?: string;
  url?: string;
  userId?: string;
  sessionId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'investigating' | 'resolved' | 'ignored';
  tags: string[];
  metadata: Record<string, any>;
}

export interface ErrorReportSummary {
  totalReports: number;
  newReports: number;
  resolvedReports: number;
  criticalReports: number;
  topErrors: Array<{
    code: string;
    count: number;
    category: ErrorCategory;
  }>;
  timeRange: {
    start: Date;
    end: Date;
  };
}

// Utility Types
export type ErrorCode = string;
export type ErrorMessage = string;
export type ErrorHandler<T = any> = (error: Error | string, context?: T) => any;

// Type Guards
export function isValidationError(error: any): error is ValidationError {
  return error && typeof error.field === 'string' && typeof error.message === 'string';
}

export function isCategorizedError(error: any): error is CategorizedError {
  return error && 
         typeof error.code === 'string' && 
         typeof error.category === 'string' && 
         typeof error.isRetryable === 'boolean';
}

export function isErrorResponse(response: any): response is ErrorResponse {
  return response && 
         response.success === false && 
         typeof response.error === 'string' && 
         typeof response.category === 'string';
}

export function isAIErrorResult(result: any): result is AIErrorResult {
  return result && 
         result.success === false && 
         typeof result.shouldFallback === 'boolean' && 
         result.context && 
         typeof result.context.provider === 'string';
}

// Error Factory Types
export interface ErrorFactory {
  createValidationError(field: string, message: string, code?: string): ValidationError;
  createCategorizedError(code: string, message?: string): CategorizedError;
  createErrorResponse(error: CategorizedError, context?: ErrorContext): ErrorResponse;
  createAIError(error: string, context: AIErrorContext): AIErrorResult;
}

// Configuration Types
export interface ErrorHandlerConfig {
  enableGlobalErrorHandler: boolean;
  enableErrorReporting: boolean;
  enableErrorRecovery: boolean;
  enableCircuitBreaker: boolean;
  defaultRetryAttempts: number;
  defaultRetryDelay: number;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  reportingEndpoint?: string;
  monitoringService?: string;
  environment: 'development' | 'staging' | 'production';
}

// Event Types for Error System
export interface ErrorEvent {
  type: 'error_occurred' | 'error_resolved' | 'error_retried' | 'fallback_triggered';
  timestamp: Date;
  error: CategorizedError;
  context?: any;
  metadata?: Record<string, any>;
}

export type ErrorEventHandler = (event: ErrorEvent) => void;

// Re-export core types from categories
export type { ErrorCategory, CategorizedError };