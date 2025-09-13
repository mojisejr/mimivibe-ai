import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAccess } from '@/middleware/admin-auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Validate admin access
    await validateAdminAccess();

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get payment analytics
    const [
      totalPayments,
      successfulPayments,
      failedPayments,
      totalRevenue,
      paymentsToday,
      successfulToday,
      payments7Days,
      successful7Days,
      payments30Days,
      successful30Days,
      averagePaymentAmount,
      topPayingUsers,
      paymentMethodStats
    ] = await Promise.all([
      // Total payments count
      prisma.paymentHistory.count(),
      
      // Successful payments count
      prisma.paymentHistory.count({
        where: { status: 'succeeded' }
      }),
      
      // Failed payments count (assuming other statuses are failures)
      prisma.paymentHistory.count({
        where: { status: { not: 'succeeded' } }
      }),
      
      // Total revenue (successful payments only)
      prisma.paymentHistory.aggregate({
        where: { status: 'succeeded' },
        _sum: { amount: true }
      }),
      
      // Today's payments
      prisma.paymentHistory.count({
        where: {
          createdAt: { gte: startOfDay }
        }
      }),
      
      // Today's successful payments
      prisma.paymentHistory.count({
        where: {
          status: 'succeeded',
          createdAt: { gte: startOfDay }
        }
      }),
      
      // Last 7 days payments
      prisma.paymentHistory.count({
        where: {
          createdAt: { gte: sevenDaysAgo }
        }
      }),
      
      // Last 7 days successful payments
      prisma.paymentHistory.count({
        where: {
          status: 'succeeded',
          createdAt: { gte: sevenDaysAgo }
        }
      }),
      
      // Last 30 days payments
      prisma.paymentHistory.count({
        where: {
          createdAt: { gte: thirtyDaysAgo }
        }
      }),
      
      // Last 30 days successful payments
      prisma.paymentHistory.count({
        where: {
          status: 'succeeded',
          createdAt: { gte: thirtyDaysAgo }
        }
      }),
      
      // Average payment amount
      prisma.paymentHistory.aggregate({
        where: { status: 'succeeded' },
        _avg: { amount: true }
      }),
      
      // Top paying users (last 30 days)
      prisma.paymentHistory.groupBy({
        by: ['userId'],
        where: {
          status: 'succeeded',
          createdAt: { gte: thirtyDaysAgo }
        },
        _sum: {
          amount: true
        },
        _count: {
          id: true
        },
        orderBy: {
          _sum: {
            amount: 'desc'
          }
        },
        take: 10
      }),
      
      // Payment status distribution
      prisma.paymentHistory.groupBy({
        by: ['status'],
        _count: {
          id: true
        },
        _sum: {
          amount: true
        }
      })
    ]);

    // Calculate success rates
    const overallSuccessRate = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;
    const todaySuccessRate = paymentsToday > 0 ? (successfulToday / paymentsToday) * 100 : 0;
    const sevenDaySuccessRate = payments7Days > 0 ? (successful7Days / payments7Days) * 100 : 0;
    const thirtyDaySuccessRate = payments30Days > 0 ? (successful30Days / payments30Days) * 100 : 0;

    // Get user details for top paying users
    const topPayingUserIds = topPayingUsers.map(u => u.userId);
    const userDetails = await prisma.user.findMany({
      where: {
        id: { in: topPayingUserIds }
      },
      select: {
        id: true,
        email: true,
        name: true,
        imageUrl: true
      }
    });

    // Merge user details with payment data
    const enrichedTopPayingUsers = topPayingUsers.map(payment => {
      const userDetail = userDetails.find(u => u.id === payment.userId);
      return {
        userId: payment.userId,
        user: userDetail,
        totalAmount: payment._sum.amount,
        paymentCount: payment._count.id
      };
    });

    const analytics = {
      overview: {
        totalPayments,
        successfulPayments,
        failedPayments,
        totalRevenue: totalRevenue._sum.amount || 0,
        averagePaymentAmount: Math.round(averagePaymentAmount._avg.amount || 0),
        overallSuccessRate: Math.round(overallSuccessRate * 100) / 100
      },
      timeBasedMetrics: {
        today: {
          totalPayments: paymentsToday,
          successfulPayments: successfulToday,
          successRate: Math.round(todaySuccessRate * 100) / 100
        },
        last7Days: {
          totalPayments: payments7Days,
          successfulPayments: successful7Days,
          successRate: Math.round(sevenDaySuccessRate * 100) / 100
        },
        last30Days: {
          totalPayments: payments30Days,
          successfulPayments: successful30Days,
          successRate: Math.round(thirtyDaySuccessRate * 100) / 100
        }
      },
      topPayingUsers: enrichedTopPayingUsers,
      paymentMethodStats: paymentMethodStats.map(stat => ({
        status: stat.status,
        count: stat._count.id,
        totalAmount: stat._sum.amount || 0
      }))
    };

    return NextResponse.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Error fetching payment analytics:', error);
    
    // Handle authentication/authorization errors
    if (error instanceof Response) {
      return error;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch payment analytics' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}