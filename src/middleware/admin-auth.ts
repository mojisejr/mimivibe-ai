/**
 * Admin Authentication Middleware
 * Provides route protection for admin-only endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
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
 * Uses fresh Clerk API data instead of cached session
 * Throws appropriate HTTP responses for unauthorized access
 */
export async function validateAdminAccess(): Promise<{ userId: string; isAdmin: boolean }> {
  const { userId } = auth();

  if (!userId) {
    console.log('❌ Admin auth failed: No userId');
    throw new Response(
      JSON.stringify({
        success: false,
        error: 'Authentication required',
        debug: { userId: null }
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Get fresh user data from Clerk API instead of cached session
    const user = await clerkClient.users.getUser(userId);
    const publicMetadata = user.publicMetadata as { role?: 'admin' | 'user' };
    const isAdmin = publicMetadata?.role === 'admin';

    // Debug logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 Admin Auth Debug (Fresh API):', {
        userId,
        hasUser: !!user,
        publicMetadata: publicMetadata || 'null',
        role: publicMetadata?.role || 'null',
        isAdmin,
        timestamp: new Date().toISOString()
      });
    }

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
            source: 'fresh-api'
          }
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Admin auth successful:', { userId, role: publicMetadata.role, source: 'fresh-api' });
    return { userId, isAdmin };
  } catch (error) {
    console.error('❌ Admin auth error fetching user:', error);
    throw new Response(
      JSON.stringify({
        success: false,
        error: 'Authentication error',
        debug: { userId, error: 'failed-to-fetch-user' }
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}