/**
 * Force session refresh endpoint
 * Helps synchronize Clerk publicMetadata when session cache is stale
 */

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

    // Return instructions for manual session refresh
    return NextResponse.json({
      success: true,
      message: 'Session refresh instructions',
      instructions: {
        problem: 'Clerk session cache is stale - middleware not recognizing authentication',
        root_cause: 'Admin role was set in Clerk backend but existing browser session has old metadata',
        solution: 'Complete browser session reset required',
        steps: [
          '1. Complete logout from application',
          '2. Clear ALL browser cookies and local storage for localhost',
          '3. Close all browser tabs for localhost',
          '4. Restart browser (optional but recommended)',
          '5. Visit localhost:3000 fresh',
          '6. Login again with nonthasak.l@gmail.com',
          '7. Session will have fresh publicMetadata with admin role'
        ],
        technical_note: 'Clerk middleware shows "no signed-in user" which indicates session cookie corruption/staleness'
      },
      alternative_solutions: {
        browser_dev_tools: [
          'Open Developer Tools (F12)',
          'Go to Application tab',
          'Under Storage: Clear Cookies, Local Storage, Session Storage for localhost',
          'Refresh page and login again'
        ],
        incognito_test: [
          'Open incognito/private browser window',
          'Visit localhost:3000',
          'Login with nonthasak.l@gmail.com',
          'Test if admin dashboard works in fresh session'
        ]
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Session refresh instruction error:', error);

    return NextResponse.json(
      {
        error: 'Failed to provide session refresh instructions',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}