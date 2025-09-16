/**
 * Enhanced Error Display Component for MiMiVibes AI Tarot Platform
 * 
 * This component provides a comprehensive error display system with:
 * - User-friendly error messages in Thai and English
 * - Recovery suggestions and action buttons
 * - Accessibility features and proper ARIA labels
 * - Responsive design with beautiful animations
 * - Support for different error severities and categories
 * 
 * Created: 2025-09-16 17:40:29
 * Issue: #176 - Error Message Improvements
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  RefreshCw, 
  CreditCard, 
  LogIn, 
  Clock,
  ExternalLink,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  EnhancedError, 
  ErrorCategory, 
  ErrorSeverity, 
  ErrorCode 
} from '@/types/errors';
import { getRecoverySuggestions } from '@/lib/errors/error-mapper';
import { getErrorMessage, Language } from '@/lib/errors/error-dictionary';

interface ErrorDisplayProps {
  error: EnhancedError;
  language?: Language;
  onRetry?: () => void;
  onDismiss?: () => void;
  onPurchaseCredits?: () => void;
  onSignIn?: () => void;
  className?: string;
  showDetails?: boolean;
  compact?: boolean;
}

// Error Icon Mapping
const getErrorIcon = (severity: ErrorSeverity, category: ErrorCategory) => {
  if (severity === ErrorSeverity.HIGH) {
    return AlertTriangle;
  }
  if (category === ErrorCategory.RATE_LIMIT) {
    return Clock;
  }
  if (category === ErrorCategory.AUTHORIZATION) {
    return CreditCard;
  }
  if (category === ErrorCategory.AUTHENTICATION) {
    return LogIn;
  }
  return AlertCircle;
};

// Error Color Mapping
const getErrorColors = (severity: ErrorSeverity) => {
  switch (severity) {
    case ErrorSeverity.HIGH:
      return {
        bg: 'bg-red-50 dark:bg-red-950/20',
        border: 'border-red-200 dark:border-red-800',
        text: 'text-red-800 dark:text-red-200',
        icon: 'text-red-600 dark:text-red-400',
        button: 'bg-red-600 hover:bg-red-700 text-white'
      };
    case ErrorSeverity.MEDIUM:
      return {
        bg: 'bg-yellow-50 dark:bg-yellow-950/20',
        border: 'border-yellow-200 dark:border-yellow-800',
        text: 'text-yellow-800 dark:text-yellow-200',
        icon: 'text-yellow-600 dark:text-yellow-400',
        button: 'bg-yellow-600 hover:bg-yellow-700 text-white'
      };
    case ErrorSeverity.LOW:
      return {
        bg: 'bg-blue-50 dark:bg-blue-950/20',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-800 dark:text-blue-200',
        icon: 'text-blue-600 dark:text-blue-400',
        button: 'bg-blue-600 hover:bg-blue-700 text-white'
      };
    default:
      return {
        bg: 'bg-gray-50 dark:bg-gray-950/20',
        border: 'border-gray-200 dark:border-gray-800',
        text: 'text-gray-800 dark:text-gray-200',
        icon: 'text-gray-600 dark:text-gray-400',
        button: 'bg-gray-600 hover:bg-gray-700 text-white'
      };
  }
};

// Format time remaining for rate limits
const formatTimeRemaining = (resetTime: string, language: Language): string => {
  const now = new Date();
  const reset = new Date(resetTime);
  const diffMs = reset.getTime() - now.getTime();
  
  if (diffMs <= 0) {
    return language === 'th' ? 'สามารถลองใหม่ได้แล้ว' : 'Can retry now';
  }
  
  const diffMinutes = Math.ceil(diffMs / (1000 * 60));
  
  if (diffMinutes < 60) {
    return language === 'th' 
      ? `อีก ${diffMinutes} นาที` 
      : `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
  }
  
  const diffHours = Math.ceil(diffMinutes / 60);
  return language === 'th' 
    ? `อีก ${diffHours} ชั่วโมง` 
    : `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
};

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  language = 'th',
  onRetry,
  onDismiss,
  onPurchaseCredits,
  onSignIn,
  className = '',
  showDetails = false,
  compact = false
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(showDetails);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  const ErrorIcon = getErrorIcon(error.severity, error.category);
  const colors = getErrorColors(error.severity);
  const errorMessage = getErrorMessage(error.code, language);
  const suggestions = getRecoverySuggestions(error, language);

  // Update time remaining for rate limits
  useEffect(() => {
    if (error.rateLimitDetails?.resetTime) {
      const updateTime = () => {
        setTimeRemaining(formatTimeRemaining(error.rateLimitDetails!.resetTime, language));
      };
      
      updateTime();
      const interval = setInterval(updateTime, 1000);
      return () => clearInterval(interval);
    }
  }, [error.rateLimitDetails?.resetTime, language]);

  // Get primary action based on error category
  const getPrimaryAction = () => {
    switch (error.category) {
      case ErrorCategory.AUTHENTICATION:
        return onSignIn ? {
          label: language === 'th' ? 'เข้าสู่ระบบ' : 'Sign In',
          action: onSignIn,
          icon: LogIn
        } : null;
        
      case ErrorCategory.AUTHORIZATION:
        if (error.code === ErrorCode.INSUFFICIENT_CREDITS && onPurchaseCredits) {
          return {
            label: language === 'th' ? 'ซื้อเครดิต' : 'Buy Credits',
            action: onPurchaseCredits,
            icon: CreditCard
          };
        }
        return null;
        
      case ErrorCategory.RATE_LIMIT:
      case ErrorCategory.AI_SERVICE:
      case ErrorCategory.SYSTEM:
        return onRetry ? {
          label: language === 'th' ? 'ลองใหม่' : 'Retry',
          action: onRetry,
          icon: RefreshCw
        } : null;
        
      default:
        return onRetry ? {
          label: language === 'th' ? 'ลองใหม่' : 'Retry',
          action: onRetry,
          icon: RefreshCw
        } : null;
    }
  };

  const primaryAction = getPrimaryAction();

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`
          flex items-center gap-3 p-3 rounded-lg border
          ${colors.bg} ${colors.border} ${className}
        `}
        role="alert"
        aria-live="polite"
      >
        <ErrorIcon className={`w-5 h-5 ${colors.icon} flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${colors.text} truncate`}>
            {errorMessage.title}
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 ${colors.text}`}
            aria-label={language === 'th' ? 'ปิด' : 'Dismiss'}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`
          rounded-xl border shadow-sm overflow-hidden
          ${colors.bg} ${colors.border} ${className}
        `}
        role="alert"
        aria-live="polite"
      >
        {/* Header */}
        <div className="p-4 sm:p-6">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-lg ${colors.icon} bg-white/50 dark:bg-black/20`}>
              <ErrorIcon className="w-6 h-6" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className={`text-lg font-semibold ${colors.text} mb-2`}>
                {errorMessage.title}
              </h3>
              
              <p className={`text-sm ${colors.text} opacity-90 leading-relaxed`}>
                {errorMessage.description}
              </p>

              {/* Rate Limit Info */}
              {error.rateLimitDetails && (
                <div className={`mt-3 p-3 rounded-lg bg-white/50 dark:bg-black/20`}>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4" />
                    <span className={colors.text}>
                      {language === 'th' ? 'เวลาที่เหลือ: ' : 'Time remaining: '}
                      <strong>{timeRemaining}</strong>
                    </span>
                  </div>
                  <div className={`text-xs ${colors.text} opacity-75 mt-1`}>
                    {language === 'th' 
                      ? `ใช้งาน ${error.rateLimitDetails.limit - error.rateLimitDetails.remaining}/${error.rateLimitDetails.limit} ครั้ง`
                      : `Used ${error.rateLimitDetails.limit - error.rateLimitDetails.remaining}/${error.rateLimitDetails.limit} requests`
                    }
                  </div>
                </div>
              )}

              {/* AI Service Info */}
              {error.aiServiceDetails && (
                <div className={`mt-3 p-3 rounded-lg bg-white/50 dark:bg-black/20`}>
                  <div className={`text-xs ${colors.text} opacity-75`}>
                    {language === 'th' ? 'ผู้ให้บริการ AI: ' : 'AI Provider: '}
                    <span className="font-medium">{error.aiServiceDetails.provider}</span>
                    {error.aiServiceDetails.fallbackAttempted && (
                      <span className="ml-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded text-xs">
                        {language === 'th' ? 'ใช้ระบบสำรอง' : 'Fallback Used'}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {onDismiss && (
              <button
                onClick={onDismiss}
                className={`p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 ${colors.text}`}
                aria-label={language === 'th' ? 'ปิด' : 'Dismiss'}
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Actions */}
          {(primaryAction || suggestions.length > 0) && (
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {primaryAction && (
                <button
                  onClick={primaryAction.action}
                  className={`
                    inline-flex items-center gap-2 px-4 py-2 rounded-lg
                    font-medium text-sm transition-colors
                    ${colors.button}
                  `}
                >
                  <primaryAction.icon className="w-4 h-4" />
                  {primaryAction.label}
                </button>
              )}

              {suggestions.length > 0 && (
                <button
                  onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                  className={`
                    inline-flex items-center gap-2 px-4 py-2 rounded-lg
                    border border-current text-sm font-medium
                    ${colors.text} hover:bg-black/5 dark:hover:bg-white/5
                    transition-colors
                  `}
                >
                  <Info className="w-4 h-4" />
                  {language === 'th' ? 'ดูคำแนะนำ' : 'View Suggestions'}
                  {isDetailsOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Suggestions */}
        <AnimatePresence>
          {isDetailsOpen && suggestions.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`border-t ${colors.border} bg-white/30 dark:bg-black/10`}
            >
              <div className="p-4 sm:p-6">
                <h4 className={`text-sm font-semibold ${colors.text} mb-3`}>
                  {language === 'th' ? 'คำแนะนำในการแก้ไข:' : 'Suggested Solutions:'}
                </h4>
                <ul className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${colors.icon} mt-2 flex-shrink-0`} />
                      <span className={`text-sm ${colors.text} opacity-90`}>
                        {suggestion}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Support Contact */}
                <div className="mt-4 pt-4 border-t border-current/10">
                  <p className={`text-xs ${colors.text} opacity-75`}>
                    {language === 'th' 
                      ? 'หากปัญหายังคงอยู่ กรุณาติดต่อทีมสนับสนุน: '
                      : 'If the problem persists, please contact support: '
                    }
                    <a 
                      href="mailto:support@mimivibes.com"
                      className="underline hover:no-underline inline-flex items-center gap-1"
                    >
                      support@mimivibes.com
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Development Details */}
        {process.env.NODE_ENV === 'development' && error.stackTrace && (
          <details className={`border-t ${colors.border} bg-gray-50 dark:bg-gray-900/50`}>
            <summary className="p-4 cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-400">
              Development Details
            </summary>
            <div className="p-4 pt-0">
              <pre className="text-xs text-gray-500 dark:text-gray-400 overflow-auto">
                <code>{error.stackTrace}</code>
              </pre>
            </div>
          </details>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ErrorDisplay;