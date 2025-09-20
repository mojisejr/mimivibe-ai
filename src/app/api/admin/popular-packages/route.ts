import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAccess } from '@/middleware/admin-auth';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering for admin routes that use auth()
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Validate admin access
    await validateAdminAccess();

    // Get popular packages with their purchase statistics
    const popularPackagesQuery = await prisma.pack.findMany({
      select: {
        id: true,
        title: true,
        price: true,
        _count: {
          select: {
            PaymentHistory: {
              where: {
                status: 'succeeded'
              }
            }
          }
        },
        PaymentHistory: {
          where: {
            status: 'succeeded'
          },
          select: {
            amount: true
          }
        }
      },
      where: {
        isActive: true
      },
      orderBy: {
        PaymentHistory: {
          _count: 'desc'
        }
      },
      take: 10 // Top 10 packages
    });

    // Calculate revenue for each package and format data
    const popularPackages = popularPackagesQuery.map(pack => {
      const totalRevenue = pack.PaymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
      
      return {
        id: pack.id,
        title: pack.title,
        purchaseCount: pack._count.PaymentHistory,
        revenue: Math.round(totalRevenue / 100) // Convert from satang to THB
      };
    });

    // Sort by purchase count (descending)
    popularPackages.sort((a, b) => b.purchaseCount - a.purchaseCount);

    return NextResponse.json({
      success: true,
      data: popularPackages
    });

  } catch (error) {
    console.error('Error fetching popular packages:', error);
    
    // Handle authentication/authorization errors
    if (error instanceof Response) {
      return error;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch popular packages data' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}