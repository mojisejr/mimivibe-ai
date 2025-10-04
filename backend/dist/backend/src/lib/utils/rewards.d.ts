interface RewardData {
    stars?: number;
    coins?: number;
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
export declare function getReferralRewards(): Promise<ReferralRewards>;
/**
 * Fetch new user reward configuration from database
 */
export declare function getNewUserRewards(): Promise<RewardData>;
/**
 * Convert reward data to legacy format for backward compatibility
 * Note: freePoint is handled separately as it's not part of the legacy format
 */
export declare function toLegacyRewardFormat(rewards: RewardData): {
    exp: number;
    coins: number;
    stars: number;
    freePoint: number;
};
export {};
//# sourceMappingURL=rewards.d.ts.map