/**
 * Admin Authentication Middleware
 * Provides route protection for admin-only endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AdminMetadata } from '@/lib/clerk-admin';

/**
 * Middleware to protect admin routes
 * Returns 401 if user is not authenticated or not an admin
 */
export async function withAdminAuth(request: NextRequest, handler: (request: NextRequest) => Promise<NextResponse> | NextResponse) {
  try {
    const { userId, sessionClaims } = auth();
    
    // Check if user is authenticated
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has admin role in publicMetadata
    const publicMetadata = sessionClaims?.publicMetadata as { role?: 'admin' | 'user' };
    if (publicMetadata?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // User is authenticated and is admin, proceed with handler
    return handler(request);
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication error' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to validate admin status in API routes
 * Throws appropriate HTTP responses for unauthorized access
 */
export function validateAdminAccess(): { userId: string; isAdmin: boolean } {
  const { userId, sessionClaims } = auth();

  // Debug logging for development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔐 Admin Auth Debug:', {
      userId: userId || 'null',
      hasSessionClaims: !!sessionClaims,
      publicMetadata: sessionClaims?.publicMetadata || 'null',
      role: (sessionClaims?.publicMetadata as any)?.role || 'null',
      timestamp: new Date().toISOString()
    });
  }

  if (!userId) {
    console.log('❌ Admin auth failed: No userId');
    throw new Response(
      JSON.stringify({
        success: false,
        error: 'Authentication required',
        debug: { userId: null, sessionClaims: null }
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const publicMetadata = sessionClaims?.publicMetadata as { role?: 'admin' | 'user' };
  const isAdmin = publicMetadata?.role === 'admin';

  if (!isAdmin) {
    console.log('❌ Admin auth failed: User not admin', {
      userId,
      role: publicMetadata?.role || 'no-role',
      publicMetadata
    });
    throw new Response(
      JSON.stringify({
        success: false,
        error: 'Admin access required',
        debug: {
          userId,
          role: publicMetadata?.role || 'no-role',
          hasSessionClaims: !!sessionClaims
        }
      }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  console.log('✅ Admin auth successful:', { userId, role: publicMetadata.role });
  return { userId, isAdmin };
}