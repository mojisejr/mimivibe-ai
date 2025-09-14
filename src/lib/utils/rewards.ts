import { prisma } from "@/lib/prisma";

interface RewardData {
  stars?: number;
  coins?: number;
  freePoint?: number;
  exp?: number;
}

// Internal interface for database reward records (may use 'coin' singular)
interface DatabaseRewardData {
  stars?: number;
  coin?: number;    // Database might use 'coin' singular
  coins?: number;   // Or 'coins' plural
  freePoint?: number;
  exp?: number;
}

export interface ReferralRewards {
  inviter: RewardData;
  invited: RewardData;
}

/**
 * Fetch referral reward configuration from database
 */
export async function getReferralRewards(): Promise<ReferralRewards> {
  try {
    const [inviterConfig, invitedConfig] = await Promise.all([
      prisma.rewardConfiguration.findUnique({
        where: {
          name: "REFERRAL_INVITER",
        },
        select: { rewards: true, isActive: true },
      }),
      prisma.rewardConfiguration.findUnique({
        where: {
          name: "REFERRAL_INVITED",
        },
        select: { rewards: true, isActive: true },
      }),
    ]);

    // Fallback values if configuration not found or inactive
    const fallbackInviter: RewardData = { stars: 1, exp: 25, coins: 0 };
    const fallbackInvited: RewardData = { stars: 1, coins: 5, exp: 0 };

    // Normalize database rewards to handle both 'coin' and 'coins' field names
    const normalizeRewards = (dbRewards: DatabaseRewardData): RewardData => ({
      stars: dbRewards.stars || 0,
      coins: dbRewards.coin || dbRewards.coins || 0, // Handle both coin/coins
      freePoint: dbRewards.freePoint || 0,
      exp: dbRewards.exp || 0
    });

    const inviterRewards = inviterConfig?.isActive
      ? normalizeRewards(inviterConfig.rewards as DatabaseRewardData)
      : fallbackInviter;

    const invitedRewards = invitedConfig?.isActive
      ? normalizeRewards(invitedConfig.rewards as DatabaseRewardData)
      : fallbackInvited;

    return {
      inviter: inviterRewards,
      invited: invitedRewards,
    };
  } catch (error) {
    console.error("Error fetching referral rewards:", error);

    // Return fallback values on error
    return {
      inviter: { stars: 1, exp: 25, coins: 0 },
      invited: { stars: 1, coins: 5, exp: 0 },
    };
  }
}

/**
 * Fetch new user reward configuration from database
 */
export async function getNewUserRewards(): Promise<RewardData> {
  try {
    const config = await prisma.rewardConfiguration.findUnique({
      where: {
        name: "NEW_USER_REWARDS",
      },
      select: { rewards: true, isActive: true },
    });

    // Fallback values if configuration not found or inactive
    const fallbackRewards: RewardData = { stars: 0, freePoint: 3 };

    if (config?.isActive) {
      // Normalize database rewards to handle both 'coin' and 'coins' field names
      const dbRewards = config.rewards as DatabaseRewardData;
      return {
        stars: dbRewards.stars || 0,
        coins: dbRewards.coin || dbRewards.coins || 0, // Handle both coin/coins
        freePoint: dbRewards.freePoint || 0,
        exp: dbRewards.exp || 0
      };
    }

    return fallbackRewards;
  } catch (error) {
    console.error("Error fetching new user rewards:", error);

    // Return fallback values on error
    return { stars: 0, freePoint: 3 };
  }
}

/**
 * Convert reward data to legacy format for backward compatibility
 */
export function toLegacyRewardFormat(rewards: RewardData) {
  return {
    exp: rewards.exp || 0,
    coins: rewards.coins || 0,
    stars: rewards.stars || 0, // Only use actual stars, not freePoint
  };
}
