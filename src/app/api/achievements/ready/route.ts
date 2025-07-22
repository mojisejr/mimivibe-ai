import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { AchievementService } from '@/lib/services/AchievementService';

// Force dynamic rendering for authentication and database access
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    // Get achievements that are ready to claim
    const readyAchievements = await AchievementService.getReadyAchievements(userId);
    const count = readyAchievements.length;

    return NextResponse.json({
      success: true,
      data: {
        count,
        achievements: readyAchievements
      }
    });

  } catch (error) {
    console.error('Ready achievements fetch error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}