/**
 * Security Monitoring and Logging System for AI Prompt Access
 * Tracks all prompt access, decryption events, and potential security threats
 */

import { prisma } from '@/lib/prisma';

export interface PromptAccessLog {
  promptName: string;
  accessType: 'READ' | 'DECRYPT' | 'UPDATE' | 'DELETE';
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
  executionTimeMs?: number;
  metadata?: Record<string, any>;
}

export interface SecurityAlert {
  alertType: 'UNAUTHORIZED_ACCESS' | 'MULTIPLE_FAILED_ATTEMPTS' | 'SUSPICIOUS_PATTERN' | 'ENCRYPTION_FAILURE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  userId?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

export class PromptSecurityMonitor {
  private static instance: PromptSecurityMonitor;
  private logBuffer: PromptAccessLog[] = [];
  private alertBuffer: SecurityAlert[] = [];
  private readonly BUFFER_SIZE = 100;
  private readonly FLUSH_INTERVAL = 30000; // 30 seconds
  
  private constructor() {
    // Start periodic log flushing
    setInterval(() => {
      this.flushLogs();
      this.flushAlerts();
    }, this.FLUSH_INTERVAL);
  }

  public static getInstance(): PromptSecurityMonitor {
    if (!PromptSecurityMonitor.instance) {
      PromptSecurityMonitor.instance = new PromptSecurityMonitor();
    }
    return PromptSecurityMonitor.instance;
  }

  /**
   * Log prompt access event
   */
  public async logPromptAccess(log: PromptAccessLog): Promise<void> {
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
  public async createAlert(alert: SecurityAlert): Promise<void> {
    const alertEntry = {
      ...alert,
      timestamp: new Date().toISOString(),
    };

    this.alertBuffer.push(alertEntry);

    // Log critical alerts immediately
    if (alert.severity === 'CRITICAL') {
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
  private async analyzeForThreats(log: PromptAccessLog): Promise<void> {
    // Check for multiple failed attempts from same IP
    if (!log.success && log.ipAddress) {
      const recentFailures = await this.getRecentFailures(log.ipAddress, 300); // 5 minutes
      
      if (recentFailures >= 5) {
        await this.createAlert({
          alertType: 'MULTIPLE_FAILED_ATTEMPTS',
          severity: 'HIGH',
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
          alertType: 'SUSPICIOUS_PATTERN',
          severity: 'MEDIUM',
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
    if (log.accessType === 'DECRYPT' && !log.success) {
      await this.createAlert({
        alertType: 'ENCRYPTION_FAILURE',
        severity: 'HIGH',
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
  private async getRecentFailures(ipAddress: string, secondsAgo: number): Promise<number> {
    try {
      const cutoffTime = new Date(Date.now() - secondsAgo * 1000);
      
      const count = await prisma.promptAccessLog.count({
        where: {
          ipAddress,
          success: false,
          createdAt: {
            gte: cutoffTime,
          },
        },
      });

      return count;
    } catch (error) {
      console.error('Error querying recent failures:', error);
      return 0;
    }
  }

  /**
   * Get recent access count for a user
   */
  private async getRecentUserAccess(userId: string, secondsAgo: number): Promise<number> {
    try {
      const cutoffTime = new Date(Date.now() - secondsAgo * 1000);
      
      const count = await prisma.promptAccessLog.count({
        where: {
          userId,
          createdAt: {
            gte: cutoffTime,
          },
        },
      });

      return count;
    } catch (error) {
      console.error('Error querying recent user access:', error);
      return 0;
    }
  }

  /**
   * Flush logs to database
   */
  private async flushLogs(): Promise<void> {
    if (this.logBuffer.length === 0) return;

    try {
      const logsToFlush = [...this.logBuffer];
      this.logBuffer = [];

      await prisma.promptAccessLog.createMany({
        data: logsToFlush.map(log => ({
          promptName: log.promptName,
          accessType: log.accessType,
          userId: log.userId,
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
          success: log.success,
          errorMessage: log.errorMessage,
          executionTimeMs: log.executionTimeMs,
          metadata: log.metadata as any,
        })),
      });

    } catch (error) {
      console.error('Error flushing prompt access logs:', error);
      // Re-add logs to buffer if flush failed
      this.logBuffer.unshift(...this.logBuffer);
    }
  }

  /**
   * Flush alerts to database
   */
  private async flushAlerts(): Promise<void> {
    if (this.alertBuffer.length === 0) return;

    try {
      const alertsToFlush = [...this.alertBuffer];
      this.alertBuffer = [];

      await prisma.securityAlert.createMany({
        data: alertsToFlush.map(alert => ({
          alertType: alert.alertType,
          severity: alert.severity,
          description: alert.description,
          userId: alert.userId,
          ipAddress: alert.ipAddress,
          metadata: alert.metadata as any,
        })),
      });

    } catch (error) {
      console.error('Error flushing security alerts:', error);
      // Re-add alerts to buffer if flush failed
      this.alertBuffer.unshift(...this.alertBuffer);
    }
  }

  /**
   * Get security dashboard data
   */
  public async getSecurityDashboard(hoursAgo: number = 24): Promise<{
    totalAccess: number;
    failedAccess: number;
    uniqueUsers: number;
    uniqueIPs: number;
    recentAlerts: any[];
    topAccessedPrompts: any[];
  }> {
    const cutoffTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

    try {
      const [
        totalAccess,
        failedAccess,
        uniqueUsers,
        uniqueIPs,
        recentAlerts,
        topAccessedPrompts
      ] = await Promise.all([
        prisma.promptAccessLog.count({
          where: { createdAt: { gte: cutoffTime } }
        }),
        prisma.promptAccessLog.count({
          where: { 
            createdAt: { gte: cutoffTime },
            success: false 
          }
        }),
        prisma.promptAccessLog.findMany({
          where: { 
            createdAt: { gte: cutoffTime },
            userId: { not: null }
          },
          select: { userId: true },
          distinct: ['userId'],
        }),
        prisma.promptAccessLog.findMany({
          where: { 
            createdAt: { gte: cutoffTime },
            ipAddress: { not: null }
          },
          select: { ipAddress: true },
          distinct: ['ipAddress'],
        }),
        prisma.securityAlert.findMany({
          where: { createdAt: { gte: cutoffTime } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
        prisma.promptAccessLog.groupBy({
          by: ['promptName'],
          where: { createdAt: { gte: cutoffTime } },
          _count: { promptName: true },
          orderBy: { _count: { promptName: 'desc' } },
          take: 5,
        })
      ]);

      return {
        totalAccess,
        failedAccess,
        uniqueUsers: uniqueUsers.length,
        uniqueIPs: uniqueIPs.length,
        recentAlerts,
        topAccessedPrompts,
      };
    } catch (error) {
      console.error('Error generating security dashboard:', error);
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
  public async cleanupOldLogs(): Promise<void> {
    const cutoffTime = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

    try {
      const [deletedLogs, deletedAlerts] = await Promise.all([
        prisma.promptAccessLog.deleteMany({
          where: { createdAt: { lt: cutoffTime } }
        }),
        prisma.securityAlert.deleteMany({
          where: { createdAt: { lt: cutoffTime } }
        })
      ]);

      console.log(`Cleaned up ${deletedLogs.count} old access logs and ${deletedAlerts.count} old alerts`);
    } catch (error) {
      console.error('Error cleaning up old logs:', error);
    }
  }
}

// Export singleton instance
export const promptSecurityMonitor = PromptSecurityMonitor.getInstance();

// Helper function for middleware integration
export function createSecurityLogEntry(
  req: any,
  promptName: string,
  accessType: PromptAccessLog['accessType'],
  success: boolean,
  executionTimeMs?: number,
  errorMessage?: string
): PromptAccessLog {
  return {
    promptName,
    accessType,
    userId: req.auth?.userId || undefined,
    ipAddress: req.ip || req.connection?.remoteAddress || undefined,
    userAgent: req.headers?.['user-agent'] || undefined,
    success,
    executionTimeMs,
    errorMessage,
    metadata: {
      endpoint: req.url,
      method: req.method,
    },
  };
}