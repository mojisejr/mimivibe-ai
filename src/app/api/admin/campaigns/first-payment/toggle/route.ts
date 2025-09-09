import { auth, currentUser } from '@clerk/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { toggleCampaignStatus, getCampaignAnalytics } from '@/lib/campaign';
import { rateLimit, adminRateLimitConfig } from '@/lib/rate-limiter';

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await rateLimit(request, adminRateLimitConfig);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { userId } = auth();
    const user = await currentUser();
    
    if (!userId || !user) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required'
        }, 
        { status: 401 }
      );
    }

    // Check if user has admin role (you may need to adjust this based on your admin system)
    const userRole = user.publicMetadata?.role || user.privateMetadata?.role;
    if (userRole !== 'admin') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Forbidden',
          message: 'Admin access required'
        }, 
        { status: 403 }
      );
    }

    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Bad Request',
          message: 'isActive must be a boolean'
        }, 
        { status: 400 }
      );
    }

    // Toggle campaign status
    const campaignId = 'first-payment-campaign-70';
    const updatedCampaign = await toggleCampaignStatus(campaignId, isActive);

    // Get analytics
    const analytics = await getCampaignAnalytics(campaignId);

    return NextResponse.json({
      success: true,
      data: {
        campaign: {
          id: updatedCampaign.id,
          name: updatedCampaign.name,
          isActive: updatedCampaign.isActive,
          updatedAt: updatedCampaign.updatedAt
        },
        analytics
      },
      message: `Campaign ${isActive ? 'activated' : 'deactivated'} successfully`
    });

  } catch (error) {
    console.error('Campaign toggle error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Failed to toggle campaign status',
        timestamp: new Date().toISOString(),
        path: '/api/admin/campaigns/first-payment/toggle'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await rateLimit(request, adminRateLimitConfig);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { userId } = auth();
    const user = await currentUser();
    
    if (!userId || !user) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required'
        }, 
        { status: 401 }
      );
    }

    // Check if user has admin role
    const userRole = user.publicMetadata?.role || user.privateMetadata?.role;
    if (userRole !== 'admin') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Forbidden',
          message: 'Admin access required'
        }, 
        { status: 403 }
      );
    }

    // Get campaign analytics
    const campaignId = 'first-payment-campaign-70';
    const analytics = await getCampaignAnalytics(campaignId);

    return NextResponse.json({
      success: true,
      data: {
        analytics
      }
    });

  } catch (error) {
    console.error('Campaign analytics error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Failed to get campaign analytics',
        timestamp: new Date().toISOString(),
        path: '/api/admin/campaigns/first-payment/toggle'
      },
      { status: 500 }
    );
  }
}