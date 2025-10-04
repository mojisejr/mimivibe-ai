"use strict";
/**
 * Security middleware and logging utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.logSecurityEvent = logSecurityEvent;
exports.createSecurityEvent = createSecurityEvent;
/**
 * Log security events for monitoring and analysis
 */
function logSecurityEvent(event) {
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
function createSecurityEvent(type, severity, details, userId, ip, userAgent) {
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
//# sourceMappingURL=security.js.map