import { prisma } from "@/lib/prisma";
import { UserLoginStreak } from "@prisma/client";

export class StreakService {
  /**
   * Update user login streak when they log in
   * @param userId - User ID from Clerk
   * @returns Updated streak record
   */
  static async updateUserLoginStreak(userId: string): Promise<UserLoginStreak> {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1); // Start of yesterday

    // Get existing streak record or create new one
    let streakRecord = await prisma.userLoginStreak.findUnique({
      where: { userId }
    });

    if (!streakRecord) {
      // First time login - create new record
      streakRecord = await prisma.userLoginStreak.create({
        data: {
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastLoginDate: today,
          streakStartDate: today,
        }
      });
    } else {
      const lastLogin = streakRecord.lastLoginDate;
      
      // Check if user already logged in today
      if (lastLogin && lastLogin >= today) {
        // Already logged in today, no change needed
        return streakRecord;
      }
      
      // Check if login maintains streak (yesterday or today)
      if (lastLogin && lastLogin >= yesterday) {
        // Continuous streak - increment
        const newCurrentStreak = streakRecord.currentStreak + 1;
        const newLongestStreak = Math.max(streakRecord.longestStreak, newCurrentStreak);
        
        streakRecord = await prisma.userLoginStreak.update({
          where: { userId },
          data: {
            currentStreak: newCurrentStreak,
            longestStreak: newLongestStreak,
            lastLoginDate: today,
            // Keep existing streakStartDate
          }
        });
      } else {
        // Streak broken - reset to 1
        streakRecord = await prisma.userLoginStreak.update({
          where: { userId },
          data: {
            currentStreak: 1,
            longestStreak: Math.max(streakRecord.longestStreak, 1),
            lastLoginDate: today,
            streakStartDate: today,
          }
        });
      }
    }

    return streakRecord;
  }

  /**
   * Get user's current streak information
   * @param userId - User ID from Clerk
   * @returns Streak record or null if not found
   */
  static async getUserStreak(userId: string): Promise<UserLoginStreak | null> {
    return await prisma.userLoginStreak.findUnique({
      where: { userId }
    });
  }

  /**
   * Get user's current streak count (for achievement calculations)
   * @param userId - User ID from Clerk
   * @returns Current streak count (0 if no record)
   */
  static async getCurrentStreakCount(userId: string): Promise<number> {
    const streakRecord = await this.getUserStreak(userId);
    return streakRecord?.currentStreak || 0;
  }

  /**
   * Get user's longest streak count (for achievement calculations)
   * @param userId - User ID from Clerk
   * @returns Longest streak count (0 if no record)
   */
  static async getLongestStreakCount(userId: string): Promise<number> {
    const streakRecord = await this.getUserStreak(userId);
    return streakRecord?.longestStreak || 0;
  }

  /**
   * Check if user has active streak (logged in within last 2 days)
   * @param userId - User ID from Clerk
   * @returns true if streak is active
   */
  static async hasActiveStreak(userId: string): Promise<boolean> {
    const streakRecord = await this.getUserStreak(userId);
    
    if (!streakRecord || !streakRecord.lastLoginDate) {
      return false;
    }

    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    twoDaysAgo.setHours(0, 0, 0, 0);

    return streakRecord.lastLoginDate >= twoDaysAgo;
  }
}