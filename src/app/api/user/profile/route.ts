import { auth } from '@clerk/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic'

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
          path: '/api/user/profile'
        }, 
        { status: 401 }
      )
    }

    let user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        lineId: true,
        name: true,
        email: true,
        imageUrl: true,
        stars: true,
        coins: true,
        exp: true,
        level: true,
        freePoint: true,
        role: true,
        prestigeLevel: true,
        prestigePoints: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // If user doesn't exist, create them with default values
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          stars: 5, // Free trial credits
          coins: 0,
          exp: 0,
          level: 1,
          freePoint: 5,
          role: 'USER',
          prestigeLevel: 0,
          prestigePoints: 0,
          updatedAt: new Date()
        },
        select: {
          id: true,
          lineId: true,
          name: true,
          email: true,
          imageUrl: true,
          stars: true,
          coins: true,
          exp: true,
          level: true,
          freePoint: true,
          role: true,
          prestigeLevel: true,
          prestigePoints: true,
          createdAt: true,
          updatedAt: true
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        stats: {
          stars: user.stars,
          coins: user.coins,
          exp: user.exp,
          level: user.level,
          freePoint: user.freePoint,
          prestigeLevel: user.prestigeLevel,
          prestigePoints: user.prestigePoints
        }
      }
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch user profile',
        timestamp: new Date().toISOString(),
        path: '/api/user/profile'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
          path: '/api/user/profile'
        }, 
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, email, imageUrl } = body

    // Validate input
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad request',
          message: 'Invalid email format',
          timestamp: new Date().toISOString(),
          path: '/api/user/profile'
        },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.user.upsert({
      where: { id: userId },
      update: {
        ...(name && { name }),
        ...(email && { email }),
        ...(imageUrl && { imageUrl }),
        updatedAt: new Date()
      },
      create: {
        id: userId,
        name: name || null,
        email: email || null,
        imageUrl: imageUrl || null,
        stars: 5,
        coins: 0,
        exp: 0,
        level: 1,
        freePoint: 5,
        role: 'USER',
        prestigeLevel: 0,
        prestigePoints: 0,
        updatedAt: new Date()
      },
      select: {
        id: true,
        lineId: true,
        name: true,
        email: true,
        imageUrl: true,
        stars: true,
        coins: true,
        exp: true,
        level: true,
        freePoint: true,
        role: true,
        prestigeLevel: true,
        prestigePoints: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...updatedUser,
        stats: {
          stars: updatedUser.stars,
          coins: updatedUser.coins,
          exp: updatedUser.exp,
          level: updatedUser.level,
          freePoint: updatedUser.freePoint,
          prestigeLevel: updatedUser.prestigeLevel,
          prestigePoints: updatedUser.prestigePoints
        }
      }
    })
  } catch (error) {
    console.error('Profile update error:', error)
    
    // Handle unique constraint violations
    if ((error as any)?.code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          error: 'Conflict',
          message: 'Email already exists',
          timestamp: new Date().toISOString(),
          path: '/api/user/profile'
        },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Failed to update user profile',
        timestamp: new Date().toISOString(),
        path: '/api/user/profile'
      },
      { status: 500 }
    )
  }
}