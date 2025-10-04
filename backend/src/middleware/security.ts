/**
 * Security middleware and logging utilities
 */

export interface SecurityEvent {
  type: 'PROMPT_INJECTION' | 'SUSPICIOUS_ACTIVITY' | 'RATE_LIMIT' | 'VALIDATION_ERROR' | 'AI_ABUSE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  userId?: string;
  ip?: string;
  userAgent?: string;
  details: Record<string, any>;
  timestamp: Date;
}

/**
 * Log security events for monitoring and analysis
 */
export function logSecurityEvent(event: SecurityEvent): void {
  const logEntry = {
    ...event,
    timestamp: event.timestamp.toISOString(),
  };

  // Log to console with appropriate level
  switch (event.severity) {
    case 'CRITICAL':
    case 'HIGH':
      console.error('🚨 [SECURITY]', logEntry);
      break;
    case 'MEDIUM':
      console.warn('⚠️ [SECURITY]', logEntry);
      break;
    case 'LOW':
    default:
      console.log('ℹ️ [SECURITY]', logEntry);
      break;
  }

  // In production, you might want to send this to a security monitoring service
  // Example: await sendToSecurityService(logEntry);
}

/**
 * Create a security event
 */
export function createSecurityEvent(
  type: SecurityEvent['type'],
  severity: SecurityEvent['severity'],
  details: Record<string, any>,
  userId?: string,
  ip?: string,
  userAgent?: string
): SecurityEvent {
  return {
    type,
    severity,
    userId,
    ip,
    userAgent,
    details,
    timestamp: new Date(),
  };
}