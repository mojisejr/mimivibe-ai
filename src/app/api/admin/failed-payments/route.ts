import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAccess } from '@/middleware/admin-auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Validate admin access
    validateAdminAccess();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const timeRange = searchParams.get('timeRange') || '7d'; // 1d, 7d, 30d, all
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Calculate date range
    let dateFilter = {};
    const now = new Date();
    
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
      default:
        dateFilter = {}; // All time
    }

    // Build where conditions for failed payments
    const whereConditions: any = {
      status: { not: 'succeeded' }, // All non-successful payments
      ...dateFilter
    };

    // Search functionality
    if (search) {
      whereConditions.OR = [
        { stripePaymentId: { contains: search } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    // Get failed payments with detailed information
    const [failedPayments, totalCount] = await Promise.all([
      prisma.paymentHistory.findMany({
        where: whereConditions,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              imageUrl: true
            }
          },
          pack: {
            select: {
              id: true,
              title: true,
              price: true,
              creditAmount: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.paymentHistory.count({
        where: whereConditions
      })
    ]);

    // Get failure statistics by status
    const failureStats = await prisma.paymentHistory.groupBy({
      by: ['status'],
      where: {
        status: { not: 'succeeded' },
        ...dateFilter
      },
      _count: {
        id: true
      },
      _sum: {
        amount: true
      }
    });

    // Get failure patterns by user (users with multiple failures)
    const repeatFailureUsers = await prisma.paymentHistory.groupBy({
      by: ['userId'],
      where: {
        status: { not: 'succeeded' },
        ...dateFilter
      },
      _count: {
        id: true
      },
      having: {
        id: {
          _count: {
            gte: 2 // Users with 2 or more failed payments
          }
        }
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    });

    // Get user details for repeat failure users
    const failureUserIds = repeatFailureUsers.map(u => u.userId);
    const failureUserDetails = await prisma.user.findMany({
      where: {
        id: { in: failureUserIds }
      },
      select: {
        id: true,
        email: true,
        name: true,
        imageUrl: true
      }
    });

    // Merge user details with failure data
    const enrichedRepeatFailureUsers = repeatFailureUsers.map(failure => {
      const userDetail = failureUserDetails.find(u => u.id === failure.userId);
      return {
        userId: failure.userId,
        user: userDetail,
        failureCount: failure._count.id
      };
    });

    // Calculate total potential lost revenue
    const totalLostRevenue = failureStats.reduce((sum, stat) => sum + (stat._sum.amount || 0), 0);

    const totalPages = Math.ceil(totalCount / limit);

    const monitoringData = {
      summary: {
        totalFailedPayments: totalCount,
        totalLostRevenue,
        timeRange,
        failureStats: failureStats.map(stat => ({
          status: stat.status,
          count: stat._count.id,
          lostRevenue: stat._sum.amount || 0
        }))
      },
      failedPayments,
      repeatFailureUsers: enrichedRepeatFailureUsers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };

    return NextResponse.json({
      success: true,
      data: monitoringData
    });

  } catch (error) {
    console.error('Error fetching failed payments:', error);
    
    // Handle authentication/authorization errors
    if (error instanceof Response) {
      return error;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch failed payment monitoring data' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}