/**
 * Feature Flags Configuration
 * 
 * This file contains feature flags that can be used to enable/disable features
 * throughout the application. This is particularly useful for temporary disabling
 * of features that need to be easily reactivated.
 */

export const FEATURE_FLAGS = {
  /**
   * EXP System Feature Flag
   * 
   * When false:
   * - No EXP calculations in backend APIs
   * - No EXP UI elements in frontend
   * - EXP values return as 0 in API responses
   * - EXP database writes are disabled
   * 
   * When true:
   * - Full EXP system functionality restored
   * - All EXP calculations and UI elements active
   * 
   * TEMP_DISABLED: Set to false to temporarily disable EXP system
   * while preserving code structure for future reactivation
   */
  ENABLE_EXP_SYSTEM: false,

  /**
   * Level System Feature Flag
   * 
   * Depends on EXP system. When EXP system is disabled,
   * level calculations are also disabled.
   */
  ENABLE_LEVEL_SYSTEM: false,

  /**
   * EXP-based Achievement Rewards
   * 
   * When false, achievements only reward coins/badges,
   * no EXP rewards are given.
   */
  ENABLE_EXP_ACHIEVEMENT_REWARDS: false
} as const

export type FeatureFlag = keyof typeof FEATURE_FLAGS

/**
 * Check if a feature flag is enabled
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return FEATURE_FLAGS[flag]
}

/**
 * Get safe EXP values based on feature flag
 * Returns 0 for EXP values when feature is disabled
 */
export function getSafeExpValue(expValue: number): number {
  return FEATURE_FLAGS.ENABLE_EXP_SYSTEM ? expValue : 0
}

/**
 * Get safe level value based on feature flag
 * Returns static level when feature is disabled
 */
export function getSafeLevelValue(levelValue: number): number {
  return FEATURE_FLAGS.ENABLE_LEVEL_SYSTEM ? levelValue : 1
}