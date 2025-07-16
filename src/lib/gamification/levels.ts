export interface LevelConfig {
  level: number;
  expRequired: number;
  expToNext: number;
  benefits: {
    bonusExp: number;
    bonusCoins: number;
    unlocks: string[];
  };
}

export function calculateLevel(totalExp: number): LevelConfig {
  // Simple exponential progression: level * 100 EXP
  let currentLevel = 1;
  let expForCurrentLevel = 0;
  
  while (expForCurrentLevel + (currentLevel * 100) <= totalExp) {
    expForCurrentLevel += currentLevel * 100;
    currentLevel++;
  }
  
  const expRequired = currentLevel * 100;
  const expToNext = expRequired - (totalExp - expForCurrentLevel);
  
  return {
    level: currentLevel,
    expRequired,
    expToNext,
    benefits: {
      bonusExp: Math.floor(currentLevel * 0.1), // 10% bonus per level
      bonusCoins: Math.floor(currentLevel * 0.05), // 5% bonus per level
      unlocks: getLevelUnlocks(currentLevel)
    }
  };
}

function getLevelUnlocks(level: number): string[] {
  const unlocks: string[] = [];
  
  if (level >= 5) unlocks.push("Daily bonus multiplier");
  if (level >= 10) unlocks.push("Exclusive card interpretations");
  if (level >= 15) unlocks.push("Advanced reading patterns");
  if (level >= 20) unlocks.push("VIP support access");
  
  return unlocks;
}

export function checkLevelUp(oldExp: number, newExp: number): { leveled: boolean; newLevel: number; oldLevel: number } {
  const oldLevelConfig = calculateLevel(oldExp);
  const newLevelConfig = calculateLevel(newExp);
  
  return {
    leveled: newLevelConfig.level > oldLevelConfig.level,
    newLevel: newLevelConfig.level,
    oldLevel: oldLevelConfig.level
  };
}

export const GAMIFICATION_CONFIG = {
  dailyLogin: {
    baseExp: 10,
    baseCoins: 5,
    maxStreakMultiplier: 2.0,
    streakBonusRate: 0.1
  },
  
  levelSystem: {
    expPerLevel: 100,
    bonusExpPerLevel: 0.1,
    bonusCoinsPerLevel: 0.05
  },
  
  coinExchange: {
    rate: 10, // 10 coins = 1 star
    dailyLimit: 100, // max 100 stars per day
    minExchange: 10 // minimum 10 coins
  },
  
  referral: {
    referrerReward: { exp: 25, coins: 0, stars: 1 }, // 1 star + 25 EXP when referral completes first reading
    referredReward: { exp: 0, coins: 5, stars: 1 } // 1 star + 5 coins (one-time bonus on signup)
  }
};