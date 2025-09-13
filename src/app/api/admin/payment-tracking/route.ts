import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAccess } from '@/middleware/admin-auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Convert satang to THB (Stripe stores amounts in smallest currency unit)
const convertToTHB = (amount: number): number => {
  return Math.round(amount / 100);
};

export async function GET(request: NextRequest) {
  try {
    // Validate admin access
    await validateAdminAccess();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const userId = searchParams.get('userId') || '';
    const status = searchParams.get('status') || '';
    const packId = searchParams.get('packId') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build where conditions
    const whereConditions: any = {};

    if (userId) {
      whereConditions.userId = userId;
    }

    if (status) {
      whereConditions.status = status;
    }

    if (packId) {
      whereConditions.packId = parseInt(packId);
    }

    if (dateFrom || dateTo) {
      whereConditions.createdAt = {};
      if (dateFrom) {
        whereConditions.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        whereConditions.createdAt.lte = new Date(dateTo);
      }
    }

    // Search functionality (user email/name or payment ID)
    if (search) {
      whereConditions.OR = [
        { stripePaymentId: { contains: search } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    // Get payments with user and pack information
    const [payments, totalCount] = await Promise.all([
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

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        payments: payments.map(payment => ({
          ...payment,
          amount: convertToTHB(payment.amount) // Convert to THB
        })),
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
    console.error('Error fetching payment tracking data:', error);
    
    // Handle authentication/authorization errors
    if (error instanceof Response) {
      return error;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch payment tracking data' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}