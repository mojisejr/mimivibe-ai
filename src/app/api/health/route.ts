import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for database access
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Test database connection by running a simple query
    await prisma.$queryRaw`SELECT 1 as connected`
    
    return NextResponse.json({
      success: true,
      message: 'Database connection healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Database connection failed',
        message: 'Unable to connect to database',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}