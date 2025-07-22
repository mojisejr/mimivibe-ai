import { auth } from '@clerk/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { AchievementService, TriggerType } from '@/lib/services/AchievementService';

// Force dynamic rendering for authentication and database access
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { triggerType = 'MANUAL' } = body;

    // Validate trigger type
    const validTriggerTypes: TriggerType[] = ['READING', 'LEVEL_UP', 'REFERRAL', 'LOGIN', 'MANUAL'];
    if (!validTriggerTypes.includes(triggerType)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid trigger type'
      }, { status: 400 });
    }

    // Check and trigger achievements
    const result = await AchievementService.checkAndTriggerAchievements(userId, triggerType);

    return NextResponse.json({
      success: true,
      data: {
        triggerType,
        readyAchievements: result.readyAchievements,
        newlyCompleted: result.newlyCompleted,
        message: result.newlyCompleted > 0 
          ? `Found ${result.newlyCompleted} ready achievement(s)`
          : 'No new achievements ready'
      }
    });

  } catch (error) {
    console.error('Achievement check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}