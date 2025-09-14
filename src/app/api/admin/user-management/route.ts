import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAccess } from '@/middleware/admin-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Validate admin access
    await validateAdminAccess();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const roleFilter = searchParams.get('role') || '';
    const statusFilter = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';

    const skip = (page - 1) * limit;

    // Build where conditions
    const whereConditions: any = {};

    // Search functionality
    if (search) {
      whereConditions.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { clerkUserId: { contains: search } }
      ];
    }

    // Date range filter
    if (dateFrom || dateTo) {
      whereConditions.createdAt = {};
      if (dateFrom) {
        whereConditions.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        whereConditions.createdAt.lte = new Date(dateTo);
      }
    }

    // Get users with related data
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereConditions,
        include: {
          PaymentHistory: {
            select: {
              id: true,
              amount: true,
              status: true,
              createdAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: 5 // Latest 5 payments for quick overview
          },
          Reading: {
            select: {
              id: true,
              createdAt: true
            }
          },
          _count: {
            select: {
              PaymentHistory: true,
              Reading: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take: limit
      }),
      prisma.user.count({
        where: whereConditions
      })
    ]);

    // Calculate additional user statistics
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        // Calculate total spent
        const totalSpent = await prisma.paymentHistory.aggregate({
          where: {
            userId: user.id,
            status: 'succeeded'
          },
          _sum: {
            amount: true
          }
        });

        // Get last activity date
        const lastReading = await prisma.reading.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true }
        });

        const lastPayment = await prisma.paymentHistory.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true }
        });

        const lastActivityDate = lastReading?.createdAt && lastPayment?.createdAt
          ? (lastReading.createdAt > lastPayment.createdAt ? lastReading.createdAt : lastPayment.createdAt)
          : lastReading?.createdAt || lastPayment?.createdAt;

        return {
          ...user,
          totalSpent: totalSpent._sum.amount || 0,
          lastActivityDate,
          paymentCount: user._count.PaymentHistory,
          readingCount: user._count.Reading
        };
      })
    );

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        users: enrichedUsers,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user management data:', error);
    
    // Handle authentication/authorization errors
    if (error instanceof Response) {
      return error;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch user management data' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Validate admin access
    await validateAdminAccess();

    const body = await request.json();
    const { userId, updates, bulkOperation } = body;

    // Handle bulk operations
    if (bulkOperation) {
      const { userIds, operation, value } = bulkOperation;
      
      let updateData: any = {};
      
      switch (operation) {
        case 'updateCredits':
          updateData = { 
            stars: { increment: parseInt(value) }
          };
          break;
        case 'resetCredits':
          updateData = { 
            stars: 0,
            freePoints: 0,
            coins: 0
          };
          break;
        case 'addCoins':
          updateData = { 
            coins: { increment: parseInt(value) }
          };
          break;
        default:
          throw new Error('Invalid bulk operation');
      }

      const result = await prisma.user.updateMany({
        where: {
          id: { in: userIds }
        },
        data: updateData
      });

      return NextResponse.json({
        success: true,
        data: {
          updatedCount: result.count,
          operation,
          appliedTo: userIds.length
        }
      });
    }

    // Handle single user updates
    if (userId && updates) {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updates,
        include: {
          _count: {
            select: {
              PaymentHistory: true,
              Reading: true
            }
          }
        }
      });

      return NextResponse.json({
        success: true,
        data: updatedUser
      });
    }

    return NextResponse.json(
      { success: false, error: 'Missing required parameters' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error updating user data:', error);
    
    // Handle authentication/authorization errors
    if (error instanceof Response) {
      return error;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update user data' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}