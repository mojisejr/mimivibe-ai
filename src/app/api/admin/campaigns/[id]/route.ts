import { auth } from '@clerk/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for authentication and database access
export const dynamic = 'force-dynamic'

// Admin emails (this could be moved to environment variables)
const ADMIN_EMAILS = ['admin@mimivibes.com', 'nattapon.tanasakun@gmail.com']

async function isAdmin(userId: string): Promise<boolean> {
  try {
    // Get user from database to check email
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    return user && user.email ? ADMIN_EMAILS.includes(user.email) : false
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const template = await prisma.campaignTemplate.findUnique({
      where: { id: params.id }
    })

    if (!template) {
      return NextResponse.json({ 
        success: false, 
        error: 'Campaign template not found' 
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: { template }
    })

  } catch (error) {
    console.error('Get campaign template error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { name, type, isActive, rewards, metadata } = body

    // Check if template exists
    const existingTemplate = await prisma.campaignTemplate.findUnique({
      where: { id: params.id }
    })

    if (!existingTemplate) {
      return NextResponse.json({ 
        success: false, 
        error: 'Campaign template not found' 
      }, { status: 404 })
    }

    // Validate rewards if provided
    if (rewards) {
      if (!Array.isArray(rewards) || rewards.length === 0) {
        return NextResponse.json({ 
          success: false, 
          error: 'Rewards must be a non-empty array' 
        }, { status: 400 })
      }

      // Validate each reward item
      for (const reward of rewards) {
        if (!reward.day || !Number.isInteger(reward.day) || reward.day < 1) {
          return NextResponse.json({ 
            success: false, 
            error: 'Each reward must have a valid day number (integer >= 1)' 
          }, { status: 400 })
        }
        
        if (typeof reward.exp !== 'number' || typeof reward.coins !== 'number') {
          return NextResponse.json({ 
            success: false, 
            error: 'Each reward must have exp and coins as numbers' 
          }, { status: 400 })
        }
      }
    }

    // Build update data (only include provided fields)
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (type !== undefined) updateData.type = type
    if (isActive !== undefined) updateData.isActive = isActive
    if (rewards !== undefined) updateData.rewards = rewards
    if (metadata !== undefined) updateData.metadata = metadata

    const updatedTemplate = await prisma.campaignTemplate.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      data: { template: updatedTemplate }
    })

  } catch (error) {
    console.error('Update campaign template error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Check if template exists
    const existingTemplate = await prisma.campaignTemplate.findUnique({
      where: { id: params.id }
    })

    if (!existingTemplate) {
      return NextResponse.json({ 
        success: false, 
        error: 'Campaign template not found' 
      }, { status: 404 })
    }

    await prisma.campaignTemplate.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      data: { message: 'Campaign template deleted successfully' }
    })

  } catch (error) {
    console.error('Delete campaign template error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}