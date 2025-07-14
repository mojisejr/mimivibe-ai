import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const packages = await prisma.pack.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        title: true,
        subtitle: true,
        price: true,
        creditAmount: true,
        ctaText: true,
        metadata: true,
        popular: true
      }
    })

    return NextResponse.json({
      success: true,
      data: { packages }
    })

  } catch (error) {
    console.error('Get packages error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch packages',
        timestamp: new Date().toISOString(),
        path: '/api/payments/packages'
      },
      { status: 500 }
    )
  }
}