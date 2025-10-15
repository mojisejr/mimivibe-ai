/**
 * Security Monitoring and Logging System for AI Prompt Access
 * Tracks all prompt access, decryption events, and potential security threats
 */
export interface PromptAccessLog {
    promptName: string;
    accessType: "READ" | "DECRYPT" | "UPDATE" | "DELETE";
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    success: boolean;
    errorMessage?: string;
    executionTimeMs?: number;
    metadata?: Record<string, any>;
}
export interface SecurityAlert {
    alertType: "UNAUTHORIZED_ACCESS" | "MULTIPLE_FAILED_ATTEMPTS" | "SUSPICIOUS_PATTERN" | "ENCRYPTION_FAILURE";
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    description: string;
    userId?: string;
    ipAddress?: string;
    metadata?: Record<string, any>;
}
export declare class PromptSecurityMonitor {
    private static instance;
    private logBuffer;
    private alertBuffer;
    private readonly BUFFER_SIZE;
    private readonly FLUSH_INTERVAL;
    private constructor();
    static getInstance(): PromptSecurityMonitor;
    /**
     * Log prompt access event
     */
    logPromptAccess(log: PromptAccessLog): Promise<void>;
    /**
     * Create security alert
     */
    createAlert(alert: SecurityAlert): Promise<void>;
    /**
     * Analyze access patterns for security threats
     */
    private analyzeForThreats;
    /**
     * Get recent failures for an IP address
     */
    private getRecentFailures;
    /**
     * Get recent access count for a user
     */
    private getRecentUserAccess;
    /**
     * Flush logs to database
     */
    private flushLogs;
    /**
     * Flush alerts to database
     */
    private flushAlerts;
    /**
     * Get security dashboard data
     */
    getSecurityDashboard(hoursAgo?: number): Promise<{
        totalAccess: number;
        failedAccess: number;
        uniqueUsers: number;
        uniqueIPs: number;
        recentAlerts: any[];
        topAccessedPrompts: any[];
    }>;
    /**
     * Cleanup old logs (retain for 30 days)
     */
    cleanupOldLogs(): Promise<void>;
}
export declare const promptSecurityMonitor: PromptSecurityMonitor;
export declare function createSecurityLogEntry(req: any, promptName: string, accessType: PromptAccessLog["accessType"], success: boolean, executionTimeMs?: number, errorMessage?: string): PromptAccessLog;
//# sourceMappingURL=prompt-security-monitor.d.ts.map