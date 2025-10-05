/**
 * Just-In-Time (JIT) User Provisioning Utility
 *
 * This utility eliminates webhook dependency by creating User records on-demand
 * when first API call is made, solving timing issues between Clerk authentication
 * and database synchronization.
 */

import { clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getNewUserRewards } from './rewards';
import { generateReferralCode } from './referrals';

// Base default values for new users
const BASE_USER_VALUES = {
  coins: 0,
  exp: 0,
  level: 1,
  role: "USER" as const,
  prestigeLevel: 0,
  prestigePoints: 0,
};

export interface JITUserResult {
  user: any; // User from database
  wasCreated: boolean; // Whether user was created in this call
}

/**
 * Ensure user exists in database, creating via Clerk API if needed
 * This eliminates timing issues with webhook-based user creation
 */
export async function ensureUserExists(userId: string): Promise<JITUserResult> {
  console.log(`🔍 JIT: Checking user existence for ${userId}`);

  // First, try to find existing user (fastest path)
  let user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      imageUrl: true,
      stars: true,
      coins: true,
      freePoint: true,
      level: true,
      exp: true,
      role: true,
      prestigeLevel: true,
      prestigePoints: true,
      createdAt: true,
      updatedAt: true,
    }
  });

  if (user) {
    console.log(`✅ JIT: User ${userId} found in database`);
    return { user, wasCreated: false };
  }

  console.log(`🔧 JIT: User ${userId} not found, creating via Clerk API...`);

  try {
    // Fetch user data directly from Clerk
    const clerkUser = await clerkClient.users.getUser(userId);
    console.log(`📡 JIT: Fetched user data from Clerk for ${userId}`);

    // Get dynamic reward configuration
    const newUserRewards = await getNewUserRewards();
    console.log(`🎁 JIT: Using reward configuration:`, newUserRewards);

    // Fix field name mapping: convert 'coin' to 'coins' for Prisma compatibility
    const normalizedRewards = {
      stars: newUserRewards.stars || 0,
      freePoint: newUserRewards.freePoint || 0,
      coins: (newUserRewards as any).coin || newUserRewards.coins || 0 // Handle both coin/coins
    };
    console.log(`🔧 JIT: Normalized rewards:`, normalizedRewards);

    // Extract user information from Clerk
    const primaryEmail = clerkUser.emailAddresses?.find(
      (email) => email.verification?.status === "verified"
    )?.emailAddress || clerkUser.emailAddresses?.[0]?.emailAddress;

    const fullName = [clerkUser.firstName, clerkUser.lastName]
      .filter(Boolean)
      .join(" ") || null;

    // Create user with transaction to ensure atomicity
    user = await prisma.$transaction(async (tx: any) => {
      // Double-check user doesn't exist (race condition protection)
      const existingUser = await tx.user.findUnique({
        where: { id: userId }
      });

      if (existingUser) {
        console.log(`ℹ️ JIT: User ${userId} was created by another process, using existing`);
        return existingUser;
      }

      // Create new user
      const newUser = await tx.user.create({
        data: {
          id: userId,
          email: primaryEmail || null,
          name: fullName,
          imageUrl: clerkUser.imageUrl || null,
          ...BASE_USER_VALUES,
          ...normalizedRewards,
          createdAt: clerkUser.createdAt ? new Date(clerkUser.createdAt) : new Date(),
          updatedAt: new Date(),
        },
      });

      console.log(`👤 JIT: Created user ${userId} with rewards:`, {
        stars: newUser.stars,
        freePoint: newUser.freePoint,
        coins: newUser.coins
      });

      // Create initial point transaction for welcome bonus
      await tx.pointTransaction.create({
        data: {
          id: `jit_welcome_${userId}_${Date.now()}`,
          userId: userId,
          eventType: "welcome_bonus",
          deltaExp: 0,
          deltaCoins: 0,
          deltaPoint: normalizedRewards.freePoint || 3,
          metadata: {
            reason: "JIT Welcome to MiMiVibes!",
            source: "jit_provisioning",
            timestamp: new Date().toISOString(),
          },
        },
      });

      // Create referral code for the new user
      await tx.referralCode.create({
        data: {
          userId: userId,
          code: generateReferralCode(userId),
          isUsed: false,
        },
      });

      console.log(`🎁 JIT: Created welcome bonus and referral code for user ${userId}`);

      return newUser;
    });

    console.log(`✅ JIT: Successfully created user ${userId} via JIT provisioning`);
    return { user, wasCreated: true };

  } catch (error) {
    console.error(`❌ JIT: Failed to create user ${userId}:`, error);

    // Check if it's a race condition (user created by webhook while we were processing)
    if ((error as any)?.code === "P2002") {
      console.log(`🔄 JIT: Race condition detected, fetching existing user ${userId}`);

      const existingUser = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (existingUser) {
        console.log(`✅ JIT: Found user ${userId} created by webhook during JIT process`);
        return { user: existingUser, wasCreated: false };
      }
    }

    // If Clerk user doesn't exist, this is a critical error
    if ((error as any)?.errors?.[0]?.code === "user_not_found") {
      console.error(`🚨 JIT: Clerk user ${userId} not found - invalid userId`);
      throw new Error(`Invalid user ID: ${userId}`);
    }

    // For other errors, rethrow
    throw new Error(`JIT provisioning failed for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get user with JIT provisioning - simplified interface
 * Returns user record, creating it if needed
 */
export async function getOrCreateUser(userId: string) {
  const result = await ensureUserExists(userId);
  return result.user;
}