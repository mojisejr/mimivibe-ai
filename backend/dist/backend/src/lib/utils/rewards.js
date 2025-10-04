"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReferralRewards = getReferralRewards;
exports.getNewUserRewards = getNewUserRewards;
exports.toLegacyRewardFormat = toLegacyRewardFormat;
const prisma_1 = require("@/lib/prisma");
/**
 * Fetch referral reward configuration from database
 */
async function getReferralRewards() {
    try {
        const [inviterConfig, invitedConfig] = await Promise.all([
            prisma_1.prisma.rewardConfiguration.findUnique({
                where: {
                    name: "REFERRAL_INVITER",
                },
                select: { rewards: true, isActive: true },
            }),
            prisma_1.prisma.rewardConfiguration.findUnique({
                where: {
                    name: "REFERRAL_INVITED",
                },
                select: { rewards: true, isActive: true },
            }),
        ]);
        // Fallback values if configuration not found or inactive
        const fallbackInviter = { stars: 1, exp: 25, coins: 0 };
        const fallbackInvited = { stars: 1, coins: 5, exp: 0 };
        // Normalize database rewards to handle both 'coin' and 'coins' field names
        const normalizeRewards = (dbRewards) => ({
            stars: dbRewards.stars || 0,
            coins: dbRewards.coin || dbRewards.coins || 0, // Handle both coin/coins
            freePoint: dbRewards.freePoint || 0,
            exp: dbRewards.exp || 0
        });
        const inviterRewards = inviterConfig?.isActive
            ? normalizeRewards(inviterConfig.rewards)
            : fallbackInviter;
        const invitedRewards = invitedConfig?.isActive
            ? normalizeRewards(invitedConfig.rewards)
            : fallbackInvited;
        return {
            inviter: inviterRewards,
            invited: invitedRewards,
        };
    }
    catch (error) {
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
async function getNewUserRewards() {
    try {
        const config = await prisma_1.prisma.rewardConfiguration.findUnique({
            where: {
                name: "NEW_USER_REWARDS",
            },
            select: { rewards: true, isActive: true },
        });
        // Fallback values if configuration not found or inactive
        const fallbackRewards = { stars: 0, freePoint: 3 };
        if (config?.isActive) {
            // Normalize database rewards to handle both 'coin' and 'coins' field names
            const dbRewards = config.rewards;
            return {
                stars: dbRewards.stars || 0,
                coins: dbRewards.coin || dbRewards.coins || 0, // Handle both coin/coins
                freePoint: dbRewards.freePoint || 0,
                exp: dbRewards.exp || 0
            };
        }
        return fallbackRewards;
    }
    catch (error) {
        console.error("Error fetching new user rewards:", error);
        // Return fallback values on error
        return { stars: 0, freePoint: 3 };
    }
}
/**
 * Convert reward data to legacy format for backward compatibility
 * Note: freePoint is handled separately as it's not part of the legacy format
 */
function toLegacyRewardFormat(rewards) {
    return {
        exp: rewards.exp || 0,
        coins: rewards.coins || 0,
        stars: rewards.stars || 0,
        freePoint: rewards.freePoint || 0, // Include freePoint for proper reward processing
    };
}
//# sourceMappingURL=rewards.js.map