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

    // Get user statistics
    const [totalMembers, newMembersToday, newMembers7Days, newMembers30Days] = await Promise.all([
      // Total members count
      prisma.user.count(),
      
      // New members today
      prisma.user.count({
        where: {
          createdAt: {
            gte: startOfDay
          }
        }
      }),
      
      // New members in last 7 days
      prisma.user.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo
          }
        }
      }),
      
      // New members in last 30 days
      prisma.user.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      })
    ]);

    const userStats = {
      totalMembers,
      newMembersToday,
      newMembers7Days,
      newMembers30Days
    };

    return NextResponse.json({
      success: true,
      data: userStats
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    
    // Handle authentication/authorization errors
    if (error instanceof Response) {
      return error;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch user statistics' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}