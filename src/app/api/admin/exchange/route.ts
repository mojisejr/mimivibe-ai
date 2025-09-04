import { auth } from '@clerk/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// Check admin authorization
async function checkAdminAuth(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  })
  return user?.role === 'ADMIN'
}

const exchangeSettingSchema = z.object({
  exchangeType: z.string().min(1, 'Exchange type is required'),
  receivedItem: z.string().min(1, 'Received item is required'),
  coinPerUnit: z.number().int().positive('Coin per unit must be a positive integer'),
  isActive: z.boolean().default(true),
  metadata: z.record(z.any()).optional()
})

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
          path: '/api/admin/exchange'
        }, 
        { status: 401 }
      )
    }

    const isAdmin = await checkAdminAuth(userId)
    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'Admin access required',
          timestamp: new Date().toISOString(),
          path: '/api/admin/exchange'
        },
        { status: 403 }
      )
    }

    const settings = await prisma.exchangeSetting.findMany({
      orderBy: [
        { isActive: 'desc' },
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        exchangeType: true,
        receivedItem: true,
        coinPerUnit: true,
        isActive: true,
        metadata: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: { settings }
    })

  } catch (error) {
    console.error('Admin exchange settings fetch error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch exchange settings',
        timestamp: new Date().toISOString(),
        path: '/api/admin/exchange'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
          path: '/api/admin/exchange'
        }, 
        { status: 401 }
      )
    }

    const isAdmin = await checkAdminAuth(userId)
    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'Admin access required',
          timestamp: new Date().toISOString(),
          path: '/api/admin/exchange'
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validation = exchangeSettingSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad request',
          message: validation.error.errors[0]?.message || 'Invalid input',
          timestamp: new Date().toISOString(),
          path: '/api/admin/exchange'
        },
        { status: 400 }
      )
    }

    const { exchangeType, receivedItem, coinPerUnit, isActive, metadata } = validation.data

    // If setting this as active, deactivate others of the same type
    if (isActive) {
      await prisma.exchangeSetting.updateMany({
        where: { 
          exchangeType,
          isActive: true 
        },
        data: { isActive: false }
      })
    }

    const setting = await prisma.exchangeSetting.create({
      data: {
        exchangeType,
        receivedItem,
        coinPerUnit,
        isActive,
        metadata: metadata || {}
      }
    })

    return NextResponse.json({
      success: true,
      data: { setting }
    })

  } catch (error) {
    console.error('Admin exchange setting creation error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Failed to create exchange setting',
        timestamp: new Date().toISOString(),
        path: '/api/admin/exchange'
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
          path: '/api/admin/exchange'
        }, 
        { status: 401 }
      )
    }

    const isAdmin = await checkAdminAuth(userId)
    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'Admin access required',
          timestamp: new Date().toISOString(),
          path: '/api/admin/exchange'
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad request',
          message: 'Setting ID is required',
          timestamp: new Date().toISOString(),
          path: '/api/admin/exchange'
        },
        { status: 400 }
      )
    }

    const validation = exchangeSettingSchema.partial().safeParse(updateData)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad request',
          message: validation.error.errors[0]?.message || 'Invalid input',
          timestamp: new Date().toISOString(),
          path: '/api/admin/exchange'
        },
        { status: 400 }
      )
    }

    // If setting this as active, deactivate others of the same type
    if (validation.data.isActive) {
      const currentSetting = await prisma.exchangeSetting.findUnique({
        where: { id },
        select: { exchangeType: true }
      })

      if (currentSetting) {
        await prisma.exchangeSetting.updateMany({
          where: { 
            exchangeType: currentSetting.exchangeType,
            isActive: true,
            id: { not: id }
          },
          data: { isActive: false }
        })
      }
    }

    const setting = await prisma.exchangeSetting.update({
      where: { id },
      data: validation.data
    })

    return NextResponse.json({
      success: true,
      data: { setting }
    })

  } catch (error) {
    console.error('Admin exchange setting update error:', error)
    
    if ((error as any)?.code === 'P2025') {
      return NextResponse.json(
        {
          success: false,
          error: 'Not found',
          message: 'Exchange setting not found',
          timestamp: new Date().toISOString(),
          path: '/api/admin/exchange'
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Failed to update exchange setting',
        timestamp: new Date().toISOString(),
        path: '/api/admin/exchange'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
          path: '/api/admin/exchange'
        }, 
        { status: 401 }
      )
    }

    const isAdmin = await checkAdminAuth(userId)
    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'Admin access required',
          timestamp: new Date().toISOString(),
          path: '/api/admin/exchange'
        },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad request',
          message: 'Setting ID is required',
          timestamp: new Date().toISOString(),
          path: '/api/admin/exchange'
        },
        { status: 400 }
      )
    }

    await prisma.exchangeSetting.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({
      success: true,
      message: 'Exchange setting deleted successfully'
    })

  } catch (error) {
    console.error('Admin exchange setting deletion error:', error)
    
    if ((error as any)?.code === 'P2025') {
      return NextResponse.json(
        {
          success: false,
          error: 'Not found',
          message: 'Exchange setting not found',
          timestamp: new Date().toISOString(),
          path: '/api/admin/exchange'
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Failed to delete exchange setting',
        timestamp: new Date().toISOString(),
        path: '/api/admin/exchange'
      },
      { status: 500 }
    )
  }
}