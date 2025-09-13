/**
 * Clerk Admin Utilities
 * Provides admin role management through Clerk publicMetadata
 */

import { auth, User } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';

// Admin role interface for type safety
export interface AdminMetadata {
  role: 'admin' | 'user';
}

/**
 * Check if the current user is an admin using Clerk publicMetadata
 * @returns boolean indicating admin status
 */
export function isAdminUser(): boolean {
  try {
    const { sessionClaims } = auth();
    
    if (!sessionClaims) {
      return false;
    }

    // Access publicMetadata from session claims
    const publicMetadata = sessionClaims.publicMetadata as { role?: 'admin' | 'user' };
    return publicMetadata?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Get the current authenticated user with admin role check
 * @returns Promise<{user: User | null, isAdmin: boolean}>
 */
export async function getCurrentUserWithAdminStatus(): Promise<{
  user: User | null;
  isAdmin: boolean;
}> {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return { user: null, isAdmin: false };
    }

    const user = await clerkClient.users.getUser(userId);
    const isAdmin = (user.publicMetadata as { role?: 'admin' | 'user' })?.role === 'admin';
    
    return { user, isAdmin };
  } catch (error) {
    console.error('Error getting user with admin status:', error);
    return { user: null, isAdmin: false };
  }
}

/**
 * Server-side admin route protection utility
 * Throws an error if user is not admin
 */
export async function requireAdmin(): Promise<void> {
  const { isAdmin } = await getCurrentUserWithAdminStatus();
  
  if (!isAdmin) {
    throw new Error('Admin access required');
  }
}

/**
 * Set admin role for a user (for initial setup)
 * This should be used cautiously and typically only during setup
 */
export async function setUserAdminRole(userId: string, role: 'admin' | 'user'): Promise<void> {
  try {
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role
      }
    });
  } catch (error) {
    console.error('Error setting user admin role:', error);
    throw new Error('Failed to set admin role');
  }
}

/**
 * Client-side hook to check admin status
 * Note: This relies on sessionClaims being available on the client
 */
export function useAdminStatus(): boolean {
  try {
    const { sessionClaims } = auth();
    const publicMetadata = sessionClaims?.publicMetadata as { role?: 'admin' | 'user' };
    return publicMetadata?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status on client:', error);
    return false;
  }
}