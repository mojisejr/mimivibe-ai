import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
          path: '/api/user/credits'
        }, 
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        stars: true,
        coins: true,
        freePoint: true,
        level: true,
        exp: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Not found',
          message: 'User not found',
          timestamp: new Date().toISOString(),
          path: '/api/user/credits'
        }, 
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        stars: user.stars,
        coins: user.coins,
        freePoint: user.freePoint,
        level: user.level,
        exp: user.exp,
        total: user.stars + user.freePoint // Total available credits for readings
      }
    })
  } catch (error) {
    console.error('Credits fetch error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch user credits',
        timestamp: new Date().toISOString(),
        path: '/api/user/credits'
      },
      { status: 500 }
    )
  }
}