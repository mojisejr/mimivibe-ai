import { auth } from '@clerk/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
          path: '/api/payments/history'
        }, 
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50) // Max 50 per page
    const offset = (page - 1) * limit
    
    // Filter parameters
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const packId = searchParams.get('packId')
    const status = searchParams.get('status')
    const search = searchParams.get('search') // For Stripe Payment ID search

    // Build where clause for filtering
    const where: any = {
      userId
    }

    // Date range filtering
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    // Package filtering
    if (packId) {
      where.packId = parseInt(packId)
    }

    // Status filtering
    if (status) {
      where.status = status
    }

    // Search by Stripe Payment ID
    if (search) {
      where.stripePaymentId = {
        contains: search,
        mode: 'insensitive'
      }
    }

    // Get payments with pack details and calculate summary statistics
    const [payments, total, summaryStats] = await Promise.all([
      prisma.paymentHistory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          pack: {
            select: {
              id: true,
              title: true,
              subtitle: true,
              creditAmount: true
            }
          }
        }
      }),
      prisma.paymentHistory.count({
        where
      }),
      prisma.paymentHistory.aggregate({
        where: { userId }, // Summary for all user payments, not filtered
        _sum: {
          amount: true,
          creditsAdded: true
        },
        _count: {
          id: true
        }
      })
    ])

    // Calculate success rate for summary
    const successfulPayments = await prisma.paymentHistory.count({
      where: {
        userId,
        status: 'succeeded'
      }
    })

    const successRate = summaryStats._count.id > 0 
      ? (successfulPayments / summaryStats._count.id) * 100 
      : 0

    // Format payments for response
    const formattedPayments = payments.map(payment => ({
      id: payment.id,
      stripePaymentId: payment.stripePaymentId,
      amount: payment.amount, // Amount in satang
      amountDisplay: (payment.amount / 100).toFixed(2), // Convert to THB for display
      currency: payment.currency,
      status: payment.status,
      creditsAdded: payment.creditsAdded,
      createdAt: payment.createdAt.toISOString(),
      pack: {
        id: payment.pack.id,
        title: payment.pack.title,
        subtitle: payment.pack.subtitle,
        creditAmount: payment.pack.creditAmount
      }
    }))

    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    return NextResponse.json({
      success: true,
      data: {
        payments: formattedPayments,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage,
          hasPreviousPage
        },
        summary: {
          totalAmount: summaryStats._sum.amount || 0,
          totalAmountDisplay: ((summaryStats._sum.amount || 0) / 100).toFixed(2),
          totalCredits: summaryStats._sum.creditsAdded || 0,
          totalTransactions: summaryStats._count.id || 0,
          successRate: Math.round(successRate * 100) / 100 // Round to 2 decimal places
        }
      }
    })
  } catch (error) {
    console.error('Payment history fetch error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch payment history',
        timestamp: new Date().toISOString(),
        path: '/api/payments/history'
      },
      { status: 500 }
    )
  }
}