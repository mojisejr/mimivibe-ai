import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAccess } from '@/middleware/admin-auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Validate admin access
    validateAdminAccess();

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d'; // 1d, 7d, 30d, 90d, all
    const userId = searchParams.get('userId') || '';
    const activityType = searchParams.get('activityType') || ''; // readings, payments, all

    const now = new Date();
    
    // Calculate date range
    let dateFilter: any = {};
    switch (timeRange) {
      case '1d':
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        dateFilter = { createdAt: { gte: startOfDay } };
        break;
      case '7d':
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = { createdAt: { gte: sevenDaysAgo } };
        break;
      case '30d':
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFilter = { createdAt: { gte: thirtyDaysAgo } };
        break;
      case '90d':
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        dateFilter = { createdAt: { gte: ninetyDaysAgo } };
        break;
      default:
        dateFilter = {}; // All time
    }

    // User-specific filter
    const userFilter = userId ? { userId } : {};

    // Get activity analytics
    const [
      readingActivity,
      paymentActivity,
      userEngagement,
      peakActivityHours,
      deviceUsage,
      retentionMetrics
    ] = await Promise.all([
      // Reading activity analysis
      prisma.reading.groupBy({
        by: ['createdAt'],
        where: {
          ...userFilter,
          ...dateFilter
        },
        _count: {
          id: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      }),

      // Payment activity analysis
      prisma.paymentHistory.groupBy({
        by: ['createdAt', 'status'],
        where: {
          ...userFilter,
          ...dateFilter
        },
        _count: {
          id: true
        },
        _sum: {
          amount: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      }),

      // User engagement metrics
      prisma.user.findMany({
        where: userId ? { id: userId } : {},
        include: {
          Reading: {
            where: dateFilter,
            select: {
              id: true,
              createdAt: true
            }
          },
          PaymentHistory: {
            where: dateFilter,
            select: {
              id: true,
              amount: true,
              status: true,
              createdAt: true
            }
          }
        },
        take: userId ? 1 : 100 // Limit for performance
      }),

      // Peak activity hours analysis
      prisma.$queryRaw`
        SELECT 
          EXTRACT(HOUR FROM "createdAt") as hour,
          COUNT(*) as activity_count
        FROM "readings" 
        WHERE "createdAt" >= ${dateFilter.createdAt?.gte || new Date(0)}
        ${userId ? prisma.$queryRaw`AND "userId" = ${userId}` : prisma.$queryRaw``}
        GROUP BY EXTRACT(HOUR FROM "createdAt")
        ORDER BY hour
      `,

      // Device/platform usage (simulated - would need actual tracking)
      prisma.reading.groupBy({
        by: ['userId'],
        where: {
          ...userFilter,
          ...dateFilter
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
      }),

      // User retention metrics
      prisma.$queryRaw`
        WITH user_activity AS (
          SELECT 
            "userId",
            DATE("createdAt") as activity_date,
            COUNT(*) as daily_activities
          FROM "readings" 
          WHERE "createdAt" >= ${dateFilter.createdAt?.gte || new Date(0)}
          GROUP BY "userId", DATE("createdAt")
        ),
        retention_analysis AS (
          SELECT 
            "userId",
            COUNT(DISTINCT activity_date) as active_days,
            MIN(activity_date) as first_activity,
            MAX(activity_date) as last_activity
          FROM user_activity
          GROUP BY "userId"
        )
        SELECT 
          COUNT(*) as total_users,
          AVG(active_days) as avg_active_days,
          COUNT(CASE WHEN active_days >= 7 THEN 1 END) as weekly_active_users,
          COUNT(CASE WHEN active_days >= 30 THEN 1 END) as monthly_active_users
        FROM retention_analysis
      `
    ]);

    // Process reading activity by day
    const readingsByDay = readingActivity.reduce((acc: any, reading: any) => {
      const date = reading.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + reading._count.id;
      return acc;
    }, {});

    // Process payment activity
    const paymentsByDay = paymentActivity.reduce((acc: any, payment: any) => {
      const date = payment.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { count: 0, amount: 0, successful: 0, failed: 0 };
      }
      acc[date].count += payment._count.id;
      acc[date].amount += payment._sum.amount || 0;
      if (payment.status === 'succeeded') {
        acc[date].successful += payment._count.id;
      } else {
        acc[date].failed += payment._count.id;
      }
      return acc;
    }, {});

    // Calculate user behavior patterns
    const userBehaviorMetrics = userEngagement.map(user => {
      const readings = user.Reading;
      const payments = user.PaymentHistory;
      
      // Calculate session patterns
      const sessionIntervals = readings
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .reduce((intervals: number[], reading, index) => {
          if (index > 0) {
            const prevReading = readings[index - 1];
            const interval = reading.createdAt.getTime() - prevReading.createdAt.getTime();
            intervals.push(interval / (1000 * 60 * 60)); // Convert to hours
          }
          return intervals;
        }, []);

      const avgSessionInterval = sessionIntervals.length > 0 
        ? sessionIntervals.reduce((sum, interval) => sum + interval, 0) / sessionIntervals.length
        : 0;

      // Calculate spending behavior
      const totalSpent = payments
        .filter(p => p.status === 'succeeded')
        .reduce((sum, p) => sum + p.amount, 0);

      const avgPaymentAmount = payments.length > 0 
        ? totalSpent / payments.filter(p => p.status === 'succeeded').length
        : 0;

      return {
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        readingCount: readings.length,
        paymentCount: payments.length,
        totalSpent,
        avgPaymentAmount: Math.round(avgPaymentAmount),
        avgSessionInterval: Math.round(avgSessionInterval * 100) / 100,
        lastActivity: Math.max(
          readings.length > 0 ? Math.max(...readings.map(r => r.createdAt.getTime())) : 0,
          payments.length > 0 ? Math.max(...payments.map(p => p.createdAt.getTime())) : 0
        )
      };
    });

    // Sort users by activity level
    userBehaviorMetrics.sort((a, b) => b.lastActivity - a.lastActivity);

    const activityData = {
      timeRange,
      summary: {
        totalReadings: Object.values(readingsByDay).reduce((sum: number, count: any) => sum + count, 0),
        totalPayments: Object.values(paymentsByDay).reduce((sum: number, day: any) => sum + day.count, 0),
        totalRevenue: Object.values(paymentsByDay).reduce((sum: number, day: any) => sum + day.amount, 0),
        activeUsers: userBehaviorMetrics.filter(user => user.lastActivity > 0).length
      },
      dailyActivity: {
        readings: readingsByDay,
        payments: paymentsByDay
      },
      peakHours: peakActivityHours,
      userBehavior: userBehaviorMetrics.slice(0, 50), // Top 50 most active users
      retentionMetrics: (retentionMetrics as any)[0] || {}
    };

    return NextResponse.json({
      success: true,
      data: activityData
    });

  } catch (error) {
    console.error('Error fetching user activity data:', error);
    
    // Handle authentication/authorization errors
    if (error instanceof Response) {
      return error;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch user activity data' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}