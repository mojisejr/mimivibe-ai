/**
 * Simple debug endpoint to check current authentication status
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId, sessionClaims } = auth();

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      authenticated: !!userId,
      userId: userId || null,
      sessionClaims: sessionClaims ? {
        publicMetadata: sessionClaims.publicMetadata,
        // Don't log sensitive data
      } : null,
      adminStatus: {
        hasPublicMetadata: !!sessionClaims?.publicMetadata,
        role: (sessionClaims?.publicMetadata as any)?.role || null,
        isAdmin: (sessionClaims?.publicMetadata as any)?.role === 'admin'
      },
      message: userId
        ? `User ${userId} is authenticated${(sessionClaims?.publicMetadata as any)?.role === 'admin' ? ' as ADMIN' : ' but NOT admin'}`
        : 'No authenticated user session found'
    });

  } catch (error) {
    console.error('Debug auth error:', error);

    return NextResponse.json(
      {
        error: 'Debug auth failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}