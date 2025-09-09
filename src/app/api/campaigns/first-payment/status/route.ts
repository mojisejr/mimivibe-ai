import { auth } from '@clerk/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { checkFirstPaymentCampaignEligibility } from '@/lib/campaign';
import { rateLimit, apiRateLimitConfig } from '@/lib/rate-limiter';

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await rateLimit(request, apiRateLimitConfig);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required'
        }, 
        { status: 401 }
      );
    }

    // Check campaign eligibility
    const eligibility = await checkFirstPaymentCampaignEligibility(userId);

    return NextResponse.json({
      success: true,
      data: eligibility
    });

  } catch (error) {
    console.error('Campaign status check error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Failed to check campaign status',
        timestamp: new Date().toISOString(),
        path: '/api/campaigns/first-payment/status'
      },
      { status: 500 }
    );
  }
}