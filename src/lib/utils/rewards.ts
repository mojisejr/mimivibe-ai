import { prisma } from '@/lib/prisma'

interface RewardData {
  stars?: number
  coins?: number
  freePoint?: number
  exp?: number
}

export interface ReferralRewards {
  inviter: RewardData
  invited: RewardData
}

/**
 * Fetch referral reward configuration from database
 */
export async function getReferralRewards(): Promise<ReferralRewards> {
  try {
    const [inviterConfig, invitedConfig] = await Promise.all([
      prisma.rewardConfiguration.findUnique({
        where: { 
          name: 'REFERRAL_INVITER',
        },
        select: { rewards: true, isActive: true }
      }),
      prisma.rewardConfiguration.findUnique({
        where: { 
          name: 'REFERRAL_INVITED',
        },
        select: { rewards: true, isActive: true }
      })
    ])

    // Fallback values if configuration not found or inactive
    const fallbackInviter: RewardData = { stars: 1, exp: 25, coins: 0 }
    const fallbackInvited: RewardData = { stars: 1, coins: 5, exp: 0 }

    const inviterRewards = inviterConfig?.isActive 
      ? (inviterConfig.rewards as RewardData) 
      : fallbackInviter

    const invitedRewards = invitedConfig?.isActive 
      ? (invitedConfig.rewards as RewardData) 
      : fallbackInvited

    return {
      inviter: inviterRewards,
      invited: invitedRewards
    }
  } catch (error) {
    console.error('Error fetching referral rewards:', error)
    
    // Return fallback values on error
    return {
      inviter: { stars: 1, exp: 25, coins: 0 },
      invited: { stars: 1, coins: 5, exp: 0 }
    }
  }
}

/**
 * Fetch new user reward configuration from database
 */
export async function getNewUserRewards(): Promise<RewardData> {
  try {
    const config = await prisma.rewardConfiguration.findUnique({
      where: { 
        name: 'NEW_USER_REWARDS',
      },
      select: { rewards: true, isActive: true }
    })

    // Fallback values if configuration not found or inactive
    const fallbackRewards: RewardData = { stars: 5, freePoint: 5 }

    if (config?.isActive) {
      return config.rewards as RewardData
    }

    return fallbackRewards
  } catch (error) {
    console.error('Error fetching new user rewards:', error)
    
    // Return fallback values on error
    return { stars: 5, freePoint: 5 }
  }
}

/**
 * Convert reward data to legacy format for backward compatibility
 */
export function toLegacyRewardFormat(rewards: RewardData) {
  return {
    exp: rewards.exp || 0,
    coins: rewards.coins || 0,
    stars: rewards.stars || (rewards.freePoint || 0) // Map freePoint to stars for compatibility
  }
}