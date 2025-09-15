import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/prisma'
import { adminRateLimitConfig, rateLimit } from '@/lib/rate-limiter'

/**
 * GET /api/admin/security/metrics
 * 
 * Retrieves security metrics and statistics for admin dashboard
 * Requires admin authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Apply admin rate limiting
    const rateLimitResult = await rateLimit(request, adminRateLimitConfig)
    if (rateLimitResult) {
      return rateLimitResult
    }

    // Check authentication
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check admin privileges
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Get query parameters for time range
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '24h'
    const startDate = getStartDate(timeRange)

    // Get security alert counts by type
    const securityAlertCounts = await prisma.securityAlert.groupBy({
      by: ['alertType'],
      where: {
        createdAt: {
          gte: startDate
        }
      },
      _count: {
        id: true
      }
    })

    // Get security alerts over time (hourly breakdown)
    const alertsOverTime = await prisma.securityAlert.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: startDate
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Get top suspicious IPs
    const suspiciousIPs = await prisma.securityAlert.groupBy({
      by: ['ipAddress'],
      where: {
        createdAt: {
          gte: startDate
        },
        severity: {
          in: ['medium', 'high', 'critical']
        },
        ipAddress: {
          not: null
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    })

    // Get recent high-severity alerts
    const recentHighSeverityAlerts = await prisma.securityAlert.findMany({
      where: {
        createdAt: {
          gte: startDate
        },
        severity: {
          in: ['high', 'critical']
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20,
      select: {
        id: true,
        alertType: true,
        severity: true,
        createdAt: true,
        ipAddress: true,
        description: true,
        metadata: true
      }
    })

    // Calculate summary statistics
    const totalAlerts = securityAlertCounts.reduce((sum: number, alert: any) => sum + alert._count.id, 0)
    const criticalAlerts = securityAlertCounts
      .filter((alert: any) => alert.alertType.includes('CRITICAL'))
      .reduce((sum: number, alert: any) => sum + alert._count.id, 0)
    
    const highSeverityAlerts = await prisma.securityAlert.count({
      where: {
        createdAt: {
          gte: startDate
        },
        severity: {
          in: ['high', 'critical']
        }
      }
    })

    // Get blocked requests count
    const blockedRequests = securityAlertCounts
      .filter((alert: any) => 
        alert.alertType === 'PROMPT_INJECTION_DETECTED' ||
        alert.alertType === 'SUSPICIOUS_PATTERN_DETECTED' ||
        alert.alertType === 'RATE_LIMIT_EXCEEDED'
      )
      .reduce((sum: number, alert: any) => sum + alert._count.id, 0)

    // Format alerts over time for chart display
    const formattedAlertsOverTime = formatAlertsOverTime(alertsOverTime, timeRange)

    // Format security alert counts
    const formattedAlertCounts = securityAlertCounts.map((alert: any) => ({
      type: alert.alertType,
      count: alert._count.id,
      label: formatAlertTypeLabel(alert.alertType)
    }))

    const metrics = {
      summary: {
        totalAlerts,
        criticalAlerts,
        highSeverityAlerts,
        blockedRequests,
        timeRange
      },
      alertCounts: formattedAlertCounts,
      alertsOverTime: formattedAlertsOverTime,
      suspiciousIPs: suspiciousIPs.map((ip: any) => ({
        ipAddress: ip.ipAddress,
        alertCount: ip._count.id
      })),
      recentHighSeverityAlerts
    }

    return NextResponse.json({
      success: true,
      data: metrics
    })

  } catch (error) {
    console.error('Security metrics API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Helper function to get start date based on time range
 */
function getStartDate(timeRange: string): Date {
  const now = new Date()
  
  switch (timeRange) {
    case '1h':
      return new Date(now.getTime() - 60 * 60 * 1000)
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000)
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    default:
      return new Date(now.getTime() - 24 * 60 * 60 * 1000)
  }
}

/**
 * Helper function to format alerts over time for chart display
 */
function formatAlertsOverTime(alerts: any[], timeRange: string) {
  // Group alerts by hour for better visualization
  const groupedAlerts = new Map<string, number>()
  
  alerts.forEach((alert: any) => {
    const hour = new Date(alert.createdAt).toISOString().slice(0, 13) + ':00:00.000Z'
    groupedAlerts.set(hour, (groupedAlerts.get(hour) || 0) + alert._count.id)
  })

  return Array.from(groupedAlerts.entries()).map(([timestamp, count]) => ({
    timestamp,
    count
  }))
}

/**
 * Helper function to format alert type labels for display
 */
function formatAlertTypeLabel(alertType: string): string {
  return alertType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}