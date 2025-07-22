import { prisma } from "@/lib/prisma";
import { RewardConfiguration } from "@prisma/client";

export type TriggerType = 'READING' | 'LEVEL_UP' | 'REFERRAL' | 'LOGIN' | 'MANUAL';

export interface ReadyAchievement {
  id: string;
  name: string;
  icon: string;
  title: string;
  description: string;
  rewards: {
    exp?: number;
    coins?: number;
    stars?: number;
  };
  progress: {
    current: number;
    required: number;
    completed: boolean;
  };
}

export class AchievementService {
  /**
   * Check and trigger achievements for a user after certain actions
   * @param userId - User ID from Clerk
   * @param triggerType - Type of action that triggered this check
   * @returns Object with ready achievements and newly completed count
   */
  static async checkAndTriggerAchievements(
    userId: string, 
    triggerType: TriggerType
  ): Promise<{ readyAchievements: ReadyAchievement[]; newlyCompleted: number }> {
    try {
      // Get all unclaimed achievements for user
      const readyAchievements = await this.getReadyAchievements(userId);
      
      // Filter achievements relevant to this trigger type (optional optimization)
      const relevantAchievements = this.filterRelevantAchievements(readyAchievements, triggerType);
      
      // Auto-claim achievements that should be auto-claimed (none for now - all manual)
      // const autoClaimed = await this.autoClaimEligibleAchievements(userId);
      
      return {
        readyAchievements: relevantAchievements,
        newlyCompleted: relevantAchievements.length
      };
    } catch (error) {
      console.error('Achievement check failed:', error);
      return { readyAchievements: [], newlyCompleted: 0 };
    }
  }

  /**
   * Get achievements that are ready to claim (criteria met but not claimed)
   * @param userId - User ID from Clerk
   * @returns Array of ready achievements
   */
  static async getReadyAchievements(userId: string): Promise<ReadyAchievement[]> {
    try {
      // Get user with all relations needed for achievement calculations
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          Reading: true,
          Review: true,
          ReferralCode: true,
          PointTransaction: true,
          loginStreak: true,
        }
      });

      if (!user) {
        return [];
      }

      // Get all active achievement configurations
      const achievementConfigs = await prisma.rewardConfiguration.findMany({
        where: { 
          type: 'ACHIEVEMENT',
          isActive: true 
        },
        orderBy: { sortOrder: 'asc' }
      });

      // Get claimed achievements
      const claimedAchievements = await prisma.pointTransaction.findMany({
        where: {
          userId,
          eventType: 'ACHIEVEMENT'
        }
      });

      const claimedAchievementIds = claimedAchievements.map(claim => {
        const metadata = claim.metadata as any;
        return metadata?.achievementId;
      }).filter(Boolean);

      // Calculate progress and filter for ready achievements
      const readyAchievements: ReadyAchievement[] = [];

      for (const config of achievementConfigs) {
        const isAlreadyClaimed = claimedAchievementIds.includes(config.name);
        
        if (isAlreadyClaimed) {
          continue; // Skip already claimed achievements
        }

        const criteria = config.criteria as any;
        const rewards = config.rewards as any;
        
        // Calculate progress using the same logic as the progress API
        const progress = await this.calculateAchievementProgress(user, criteria);
        
        // Check if criteria are met
        const isEligible = progress.current >= progress.required;
        
        if (isEligible) {
          readyAchievements.push({
            id: config.name,
            name: config.name,
            icon: config.icon,
            title: config.title,
            description: config.description,
            rewards: {
              exp: rewards.exp || 0,
              coins: rewards.coins || 0,
              stars: rewards.stars || 0
            },
            progress: {
              current: progress.current,
              required: progress.required,
              completed: false // Not claimed yet, so not completed
            }
          });
        }
      }

      return readyAchievements;
    } catch (error) {
      console.error('Error getting ready achievements:', error);
      return [];
    }
  }

  /**
   * Get count of achievements ready to claim (for navbar badge)
   * @param userId - User ID from Clerk
   * @returns Count of ready achievements
   */
  static async getReadyAchievementsCount(userId: string): Promise<number> {
    const readyAchievements = await this.getReadyAchievements(userId);
    return readyAchievements.length;
  }

  /**
   * Auto-claim eligible achievements (none for now - all manual)
   * @param userId - User ID from Clerk
   * @returns Array of claimed achievements
   */
  static async autoClaimEligibleAchievements(userId: string): Promise<ReadyAchievement[]> {
    // For now, all achievements require manual claiming
    // This method is prepared for future auto-claim functionality
    return [];
  }

  /**
   * Filter achievements relevant to trigger type (optimization)
   * @param achievements - All ready achievements
   * @param triggerType - Type of trigger
   * @returns Filtered achievements
   */
  private static filterRelevantAchievements(
    achievements: ReadyAchievement[], 
    triggerType: TriggerType
  ): ReadyAchievement[] {
    // For now, return all ready achievements regardless of trigger
    // Could be optimized later to only return relevant ones
    return achievements;
  }

  /**
   * Calculate achievement progress (same logic as progress API)
   * @param user - User with relations
   * @param criteria - Achievement criteria
   * @returns Progress object
   */
  private static async calculateAchievementProgress(
    user: any, 
    criteria: any
  ): Promise<{ current: number; required: number }> {
    // Handle multiple criteria (for achievements like ULTIMATE_MASTER)
    if (Object.keys(criteria).length > 1) {
      const criteriaResults = [];
      
      if (criteria.readingCount || criteria.totalReadings) {
        const required = criteria.readingCount || criteria.totalReadings;
        const current = user.Reading.length;
        criteriaResults.push({ current, required, met: current >= required });
      }
      
      if (criteria.level) {
        criteriaResults.push({ 
          current: user.level, 
          required: criteria.level, 
          met: user.level >= criteria.level 
        });
      }
      
      if (criteria.reviewCount) {
        const current = user.Review.length;
        criteriaResults.push({ 
          current, 
          required: criteria.reviewCount, 
          met: current >= criteria.reviewCount 
        });
      }
      
      if (criteria.referralCount) {
        const current = user.ReferralCode.filter((code: any) => code.isUsed).length;
        criteriaResults.push({ 
          current, 
          required: criteria.referralCount, 
          met: current >= criteria.referralCount 
        });
      }
      
      if (criteria.totalCoinsEarned) {
        const current = user.PointTransaction
          .filter((t: any) => t.deltaCoins > 0)
          .reduce((total: number, t: any) => total + t.deltaCoins, 0);
        criteriaResults.push({ 
          current, 
          required: criteria.totalCoinsEarned, 
          met: current >= criteria.totalCoinsEarned 
        });
      }
      
      if (criteria.prestigeLevel) {
        criteriaResults.push({ 
          current: user.prestigeLevel, 
          required: criteria.prestigeLevel, 
          met: user.prestigeLevel >= criteria.prestigeLevel 
        });
      }

      if (criteria.loginStreak || criteria.streakDays) {
        const { StreakService } = await import("@/lib/services/StreakService");
        const currentStreak = await StreakService.getCurrentStreakCount(user.id);
        const required = criteria.loginStreak || criteria.streakDays;
        criteriaResults.push({ 
          current: currentStreak, 
          required, 
          met: currentStreak >= required 
        });
      }
      
      // All criteria must be met for multi-criteria achievements
      const allMet = criteriaResults.every(c => c.met);
      return { current: allMet ? 100 : 0, required: 100 };
    }

    // Single criterion achievements
    if (criteria.readingCount || criteria.totalReadings) {
      const required = criteria.readingCount || criteria.totalReadings;
      return { current: user.Reading.length, required };
    }
    
    if (criteria.level) {
      return { current: user.level, required: criteria.level };
    }
    
    if (criteria.reviewCount) {
      return { current: user.Review.length, required: criteria.reviewCount };
    }
    
    if (criteria.referralCount) {
      const current = user.ReferralCode.filter((code: any) => code.isUsed).length;
      return { current, required: criteria.referralCount };
    }
    
    if (criteria.totalCoinsEarned) {
      const current = user.PointTransaction
        .filter((t: any) => t.deltaCoins > 0)
        .reduce((total: number, t: any) => total + t.deltaCoins, 0);
      return { current, required: criteria.totalCoinsEarned };
    }
    
    if (criteria.loginStreak || criteria.streakDays) {
      const { StreakService } = await import("@/lib/services/StreakService");
      const currentStreak = await StreakService.getCurrentStreakCount(user.id);
      const required = criteria.loginStreak || criteria.streakDays;
      return { current: currentStreak, required };
    }
    
    if (criteria.prestigeLevel) {
      return { current: user.prestigeLevel, required: criteria.prestigeLevel };
    }

    // Default fallback
    return { current: 0, required: 1 };
  }

  /**
   * Mark achievement notification as sent/read (future feature)
   * @param userId - User ID
   * @param achievementId - Achievement ID
   * @param notificationType - Type of notification
   */
  static async markNotificationSent(
    userId: string, 
    achievementId: string, 
    notificationType: 'READY' | 'COMPLETED'
  ): Promise<void> {
    // Implementation for notification tracking
    // Could store in database for advanced notification management
    console.log(`Notification sent: ${userId}, ${achievementId}, ${notificationType}`);
  }
}