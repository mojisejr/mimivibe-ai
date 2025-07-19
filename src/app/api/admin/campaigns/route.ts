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

export async function GET() {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const campaignTemplates = await prisma.campaignTemplate.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: { templates: campaignTemplates }
    })

  } catch (error) {
    console.error('Get campaign templates error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    // Validate required fields
    if (!name || !type || !rewards) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: name, type, rewards' 
      }, { status: 400 })
    }

    // Validate rewards structure
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

    // Generate unique ID
    const id = `${type.toLowerCase()}_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`

    const newTemplate = await prisma.campaignTemplate.create({
      data: {
        id,
        name,
        type,
        isActive: isActive ?? true,
        rewards,
        metadata: metadata || {}
      }
    })

    return NextResponse.json({
      success: true,
      data: { template: newTemplate }
    })

  } catch (error) {
    console.error('Create campaign template error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}