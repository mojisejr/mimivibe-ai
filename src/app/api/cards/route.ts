import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '78'), 78)
    const arcana = searchParams.get('arcana') // 'Major' or 'Minor'

    const where = arcana ? { arcana } : {}

    const cards = await prisma.card.findMany({
      where,
      take: limit,
      orderBy: { id: 'asc' },
      select: {
        id: true,
        name: true,
        displayName: true,
        arcana: true,
        shortMeaning: true,
        keywords: true,
        imageUrl: true
      }
    })

    const totalCount = arcana 
      ? await prisma.card.count({ where })
      : await prisma.card.count()

    return NextResponse.json({
      success: true,
      data: {
        cards,
        count: cards.length,
        total: totalCount
      }
    })
  } catch (error) {
    console.error('Cards fetch error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch cards',
        timestamp: new Date().toISOString(),
        path: '/api/cards'
      },
      { status: 500 }
    )
  }
}