"use strict";
/**
 * Security Monitoring and Logging System for AI Prompt Access
 * Tracks all prompt access, decryption events, and potential security threats
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.promptSecurityMonitor = exports.PromptSecurityMonitor = void 0;
exports.createSecurityLogEntry = createSecurityLogEntry;
const prisma_1 = require("@/lib/prisma");
class PromptSecurityMonitor {
    static instance;
    logBuffer = [];
    alertBuffer = [];
    BUFFER_SIZE = 100;
    FLUSH_INTERVAL = 30000; // 30 seconds
    constructor() {
        // Start periodic log flushing
        setInterval(() => {
            this.flushLogs();
            this.flushAlerts();
        }, this.FLUSH_INTERVAL);
    }
    static getInstance() {
        if (!PromptSecurityMonitor.instance) {
            PromptSecurityMonitor.instance = new PromptSecurityMonitor();
        }
        return PromptSecurityMonitor.instance;
    }
    /**
     * Log prompt access event
     */
    async logPromptAccess(log) {
        const logEntry = {
            ...log,
            timestamp: new Date().toISOString(),
        };
        // Add to buffer
        this.logBuffer.push(logEntry);
        // Check for suspicious patterns
        await this.analyzeForThreats(logEntry);
        // Flush buffer if full
        if (this.logBuffer.length >= this.BUFFER_SIZE) {
            await this.flushLogs();
        }
    }
    /**
     * Create security alert
     */
    async createAlert(alert) {
        const alertEntry = {
            ...alert,
            timestamp: new Date().toISOString(),
        };
        this.alertBuffer.push(alertEntry);
        // Log critical alerts immediately
        if (alert.severity === "CRITICAL") {
            console.error(`🚨 CRITICAL SECURITY ALERT: ${alert.description}`, {
                type: alert.alertType,
                userId: alert.userId,
                ipAddress: alert.ipAddress,
                metadata: alert.metadata,
            });
            await this.flushAlerts();
        }
        // Flush buffer if full
        if (this.alertBuffer.length >= this.BUFFER_SIZE) {
            await this.flushAlerts();
        }
    }
    /**
     * Analyze access patterns for security threats
     */
    async analyzeForThreats(log) {
        // Check for multiple failed attempts from same IP
        if (!log.success && log.ipAddress) {
            const recentFailures = await this.getRecentFailures(log.ipAddress, 300); // 5 minutes
            if (recentFailures >= 5) {
                await this.createAlert({
                    alertType: "MULTIPLE_FAILED_ATTEMPTS",
                    severity: "HIGH",
                    description: `Multiple failed prompt access attempts from IP ${log.ipAddress}`,
                    ipAddress: log.ipAddress,
                    metadata: {
                        failureCount: recentFailures,
                        promptName: log.promptName,
                    },
                });
            }
        }
        // Check for suspicious access patterns
        if (log.promptName && log.userId) {
            const recentAccess = await this.getRecentUserAccess(log.userId, 60); // 1 minute
            if (recentAccess >= 20) {
                await this.createAlert({
                    alertType: "SUSPICIOUS_PATTERN",
                    severity: "MEDIUM",
                    description: `Unusually high prompt access rate for user ${log.userId}`,
                    userId: log.userId,
                    metadata: {
                        accessCount: recentAccess,
                        timeWindowMinutes: 1,
                    },
                });
            }
        }
        // Check for encryption failures
        if (log.accessType === "DECRYPT" && !log.success) {
            await this.createAlert({
                alertType: "ENCRYPTION_FAILURE",
                severity: "HIGH",
                description: `Prompt decryption failure for ${log.promptName}`,
                userId: log.userId,
                metadata: {
                    promptName: log.promptName,
                    errorMessage: log.errorMessage,
                },
            });
        }
    }
    /**
     * Get recent failures for an IP address
     */
    async getRecentFailures(ipAddress, secondsAgo) {
        try {
            const cutoffTime = new Date(Date.now() - secondsAgo * 1000);
            const count = await prisma_1.prisma.promptAccessLog.count({
                where: {
                    ipAddress,
                    success: false,
                    createdAt: {
                        gte: cutoffTime,
                    },
                },
            });
            return count;
        }
        catch (error) {
            console.error("Error querying recent failures:", error);
            return 0;
        }
    }
    /**
     * Get recent access count for a user
     */
    async getRecentUserAccess(userId, secondsAgo) {
        try {
            const cutoffTime = new Date(Date.now() - secondsAgo * 1000);
            const count = await prisma_1.prisma.promptAccessLog.count({
                where: {
                    userId,
                    createdAt: {
                        gte: cutoffTime,
                    },
                },
            });
            return count;
        }
        catch (error) {
            console.error("Error querying recent user access:", error);
            return 0;
        }
    }
    /**
     * Flush logs to database
     */
    async flushLogs() {
        if (this.logBuffer.length === 0)
            return;
        try {
            const logsToFlush = [...this.logBuffer];
            this.logBuffer = [];
            await prisma_1.prisma.promptAccessLog.createMany({
                data: logsToFlush.map((log) => ({
                    promptName: log.promptName,
                    accessType: log.accessType,
                    userId: log.userId,
                    ipAddress: log.ipAddress,
                    userAgent: log.userAgent,
                    success: log.success,
                    errorMessage: log.errorMessage,
                    executionTimeMs: log.executionTimeMs,
                    metadata: log.metadata,
                })),
            });
        }
        catch (error) {
            console.error("Error flushing prompt access logs:", error);
            // Re-add logs to buffer if flush failed
            this.logBuffer.unshift(...this.logBuffer);
        }
    }
    /**
     * Flush alerts to database
     */
    async flushAlerts() {
        if (this.alertBuffer.length === 0)
            return;
        try {
            const alertsToFlush = [...this.alertBuffer];
            this.alertBuffer = [];
            await prisma_1.prisma.securityAlert.createMany({
                data: alertsToFlush.map((alert) => ({
                    alertType: alert.alertType,
                    severity: alert.severity,
                    description: alert.description,
                    userId: alert.userId,
                    ipAddress: alert.ipAddress,
                    metadata: alert.metadata,
                })),
            });
        }
        catch (error) {
            console.error("Error flushing security alerts:", error);
            // Re-add alerts to buffer if flush failed
            this.alertBuffer.unshift(...this.alertBuffer);
        }
    }
    /**
     * Get security dashboard data
     */
    async getSecurityDashboard(hoursAgo = 24) {
        const cutoffTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
        try {
            const [totalAccess, failedAccess, uniqueUsers, uniqueIPs, recentAlerts, topAccessedPrompts,] = await Promise.all([
                prisma_1.prisma.promptAccessLog.count({
                    where: { createdAt: { gte: cutoffTime } },
                }),
                prisma_1.prisma.promptAccessLog.count({
                    where: {
                        createdAt: { gte: cutoffTime },
                        success: false,
                    },
                }),
                prisma_1.prisma.promptAccessLog.findMany({
                    where: {
                        createdAt: { gte: cutoffTime },
                        userId: { not: null },
                    },
                    select: { userId: true },
                    distinct: ["userId"],
                }),
                prisma_1.prisma.promptAccessLog.findMany({
                    where: {
                        createdAt: { gte: cutoffTime },
                        ipAddress: { not: null },
                    },
                    select: { ipAddress: true },
                    distinct: ["ipAddress"],
                }),
                prisma_1.prisma.securityAlert.findMany({
                    where: { createdAt: { gte: cutoffTime } },
                    orderBy: { createdAt: "desc" },
                    take: 10,
                }),
                prisma_1.prisma.promptAccessLog.groupBy({
                    by: ["promptName"],
                    where: { createdAt: { gte: cutoffTime } },
                    _count: { promptName: true },
                    orderBy: { _count: { promptName: "desc" } },
                    take: 5,
                }),
            ]);
            return {
                totalAccess,
                failedAccess,
                uniqueUsers: uniqueUsers.length,
                uniqueIPs: uniqueIPs.length,
                recentAlerts,
                topAccessedPrompts,
            };
        }
        catch (error) {
            console.error("Error generating security dashboard:", error);
            return {
                totalAccess: 0,
                failedAccess: 0,
                uniqueUsers: 0,
                uniqueIPs: 0,
                recentAlerts: [],
                topAccessedPrompts: [],
            };
        }
    }
    /**
     * Cleanup old logs (retain for 30 days)
     */
    async cleanupOldLogs() {
        const cutoffTime = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
        try {
            const [deletedLogs, deletedAlerts] = await Promise.all([
                prisma_1.prisma.promptAccessLog.deleteMany({
                    where: { createdAt: { lt: cutoffTime } },
                }),
                prisma_1.prisma.securityAlert.deleteMany({
                    where: { createdAt: { lt: cutoffTime } },
                }),
            ]);
            console.log(`Cleaned up ${deletedLogs.count} old access logs and ${deletedAlerts.count} old alerts`);
        }
        catch (error) {
            console.error("Error cleaning up old logs:", error);
        }
    }
}
exports.PromptSecurityMonitor = PromptSecurityMonitor;
// Export singleton instance
exports.promptSecurityMonitor = PromptSecurityMonitor.getInstance();
// Helper function for middleware integration
function createSecurityLogEntry(req, promptName, accessType, success, executionTimeMs, errorMessage) {
    return {
        promptName,
        accessType,
        userId: req.auth?.userId || undefined,
        ipAddress: req.ip || req.connection?.remoteAddress || undefined,
        userAgent: req.headers?.["user-agent"] || undefined,
        success,
        executionTimeMs,
        errorMessage,
        metadata: {
            endpoint: req.url,
            method: req.method,
        },
    };
}
//# sourceMappingURL=prompt-security-monitor.js.map