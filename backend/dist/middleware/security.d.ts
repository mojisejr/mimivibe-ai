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
export declare function logSecurityEvent(event: SecurityEvent): void;
/**
 * Create a security event
 */
export declare function createSecurityEvent(type: SecurityEvent['type'], severity: SecurityEvent['severity'], details: Record<string, any>, userId?: string, ip?: string, userAgent?: string): SecurityEvent;
//# sourceMappingURL=security.d.ts.map