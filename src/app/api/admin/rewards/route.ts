import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { validateAdminAccess } from '@/middleware/admin-auth'

export const dynamic = 'force-dynamic'

const rewardSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().min(1, 'Type is required'),
  icon: z.string().min(1, 'Icon is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  criteria: z.record(z.any()).optional().default({}),
  rewards: z.record(z.any()).optional().default({}),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().optional().default(0)
})

export async function GET() {
  try {
    // Validate admin access using Clerk metadata
    validateAdminAccess();

    const rewards = await prisma.rewardConfiguration.findMany({
      orderBy: [
        { isActive: 'desc' },
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        name: true,
        type: true,
        icon: true,
        title: true,
        description: true,
        criteria: true,
        rewards: true,
        isActive: true,
        sortOrder: true
      }
    })

    return NextResponse.json({
      success: true,
      data: { rewards }
    })

  } catch (error) {
    console.error('Admin rewards fetch error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch reward configurations',
        timestamp: new Date().toISOString(),
        path: '/api/admin/rewards'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate admin access using Clerk metadata
    validateAdminAccess();

    const body = await request.json()
    const validation = rewardSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad request',
          message: validation.error.errors[0]?.message || 'Invalid input',
          timestamp: new Date().toISOString(),
          path: '/api/admin/rewards'
        },
        { status: 400 }
      )
    }

    const { name, type, icon, title, description, criteria, rewards, isActive, sortOrder } = validation.data

    // Check if reward with same name exists
    const existing = await prisma.rewardConfiguration.findUnique({
      where: { name }
    })

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Conflict',
          message: 'Reward configuration with this name already exists',
          timestamp: new Date().toISOString(),
          path: '/api/admin/rewards'
        },
        { status: 409 }
      )
    }

    const reward = await prisma.rewardConfiguration.create({
      data: {
        name,
        type,
        icon,
        title,
        description,
        criteria: criteria || {},
        rewards: rewards || {},
        isActive,
        sortOrder: sortOrder || 0
      }
    })

    return NextResponse.json({
      success: true,
      data: { reward }
    })

  } catch (error) {
    console.error('Admin reward creation error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Failed to create reward configuration',
        timestamp: new Date().toISOString(),
        path: '/api/admin/rewards'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Validate admin access using Clerk metadata
    validateAdminAccess();

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad request',
          message: 'Reward ID is required',
          timestamp: new Date().toISOString(),
          path: '/api/admin/rewards'
        },
        { status: 400 }
      )
    }

    const validation = rewardSchema.partial().safeParse(updateData)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad request',
          message: validation.error.errors[0]?.message || 'Invalid input',
          timestamp: new Date().toISOString(),
          path: '/api/admin/rewards'
        },
        { status: 400 }
      )
    }

    const reward = await prisma.rewardConfiguration.update({
      where: { id },
      data: validation.data
    })

    return NextResponse.json({
      success: true,
      data: { reward }
    })

  } catch (error) {
    console.error('Admin reward update error:', error)
    
    if ((error as any)?.code === 'P2025') {
      return NextResponse.json(
        {
          success: false,
          error: 'Not found',
          message: 'Reward configuration not found',
          timestamp: new Date().toISOString(),
          path: '/api/admin/rewards'
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Failed to update reward configuration',
        timestamp: new Date().toISOString(),
        path: '/api/admin/rewards'
      },
      { status: 500 }
    )
  }
}