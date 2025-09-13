/**
 * Development-only API route to set admin role
 * This should be removed before production deployment
 */

import { NextRequest, NextResponse } from 'next/server';
import { setUserAdminRole } from '@/lib/clerk-admin';
import { clerkClient } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    // Only allow in development environment
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'This endpoint is not available in production' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, adminKey } = body;

    // Simple admin key check for security
    const expectedAdminKey = process.env.DEV_ADMIN_KEY || 'dev-admin-key-123';
    if (adminKey !== expectedAdminKey) {
      return NextResponse.json(
        { error: 'Invalid admin key' },
        { status: 403 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // Verify user exists
    try {
      await clerkClient.users.getUser(userId);
    } catch (error) {
      return NextResponse.json(
        { error: 'User not found in Clerk' },
        { status: 404 }
      );
    }

    // Set admin role for specified user
    await setUserAdminRole(userId, 'admin');

    return NextResponse.json({
      success: true,
      message: 'Admin role set successfully',
      userId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error setting admin role:', error);

    return NextResponse.json(
      {
        error: 'Failed to set admin role',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Only allow in development environment
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'This endpoint is not available in production' },
        { status: 403 }
      );
    }

    // List all users with their roles
    const users = await clerkClient.users.getUserList();

    const userRoles = users.map(user => ({
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      role: (user.publicMetadata as { role?: string })?.role || 'user',
      isAdmin: (user.publicMetadata as { role?: string })?.role === 'admin'
    }));

    return NextResponse.json({
      users: userRoles,
      total: users.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error listing users:', error);

    return NextResponse.json(
      {
        error: 'Failed to list users',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}