import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAccess } from '@/middleware/admin-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Validate admin access
    await validateAdminAccess();

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Get revenue statistics from successful payments
    const [todayRevenue, monthRevenue, yearRevenue] = await Promise.all([
      // Today's revenue
      prisma.paymentHistory.aggregate({
        _sum: {
          amount: true
        },
        where: {
          status: 'succeeded',
          createdAt: {
            gte: startOfDay
          }
        }
      }),
      
      // This month's revenue
      prisma.paymentHistory.aggregate({
        _sum: {
          amount: true
        },
        where: {
          status: 'succeeded',
          createdAt: {
            gte: startOfMonth
          }
        }
      }),
      
      // This year's revenue
      prisma.paymentHistory.aggregate({
        _sum: {
          amount: true
        },
        where: {
          status: 'succeeded',
          createdAt: {
            gte: startOfYear
          }
        }
      })
    ]);

    const revenueStats = {
      today: todayRevenue._sum.amount || 0,
      thisMonth: monthRevenue._sum.amount || 0,
      thisYear: yearRevenue._sum.amount || 0
    };

    // Convert from smallest currency unit (satang) to Thai Baht
    // Stripe amounts are stored in the smallest currency unit (satang for THB)
    const convertToTHB = (amount: number) => Math.round(amount / 100);

    const revenueStatsInTHB = {
      today: convertToTHB(revenueStats.today),
      thisMonth: convertToTHB(revenueStats.thisMonth),
      thisYear: convertToTHB(revenueStats.thisYear)
    };

    return NextResponse.json({
      success: true,
      data: revenueStatsInTHB
    });

  } catch (error) {
    console.error('Error fetching revenue stats:', error);
    
    // Handle authentication/authorization errors
    if (error instanceof Response) {
      return error;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch revenue statistics' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}