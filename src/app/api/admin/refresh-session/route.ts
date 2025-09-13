/**
 * Force refresh user session to sync publicMetadata
 * This endpoint helps when admin role is set but session cache is stale
 */

import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Only allow in development environment
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'This endpoint is not available in production' },
        { status: 403 }
      );
    }

    const { userId, sessionClaims } = auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated - please login first' },
        { status: 401 }
      );
    }

    // Get fresh user data from Clerk
    const user = await clerkClient.users.getUser(userId);
    const freshMetadata = user.publicMetadata as { role?: string };

    // Get current session metadata
    const currentMetadata = sessionClaims?.publicMetadata as { role?: string };

    return NextResponse.json({
      success: true,
      userId,
      comparison: {
        current: {
          role: currentMetadata?.role || 'no-role',
          hasMetadata: !!sessionClaims?.publicMetadata
        },
        fresh: {
          role: freshMetadata?.role || 'no-role',
          hasMetadata: !!user.publicMetadata
        },
        needsRefresh: freshMetadata?.role !== currentMetadata?.role
      },
      solution: {
        issue: 'Session cache is stale and needs refresh',
        steps: [
          '1. Logout completely from the app',
          '2. Clear browser cookies for localhost',
          '3. Login again with the same account',
          '4. Fresh session will have updated admin role'
        ]
      },
      adminStatus: {
        isAdminInClerk: freshMetadata?.role === 'admin',
        isAdminInSession: currentMetadata?.role === 'admin'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Session refresh check error:', error);

    return NextResponse.json(
      {
        error: 'Session refresh check failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}