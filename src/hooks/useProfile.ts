"use client";

import { useState, useEffect } from "react";

interface UserProfile {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserStats {
  level: number;
  currentExp: number;
  nextLevelExp: number;
  expToNextLevel: number;
  totalReadings: number;
  totalExp: number;
  totalCoins: number;
  currentStreak: number;
  longestStreak: number;
  daysActive: number;
}

interface UserCredits {
  freePoint: number;
  stars: number;
  totalCredits: number;
  dailyUsed: number;
  monthlyUsed: number;
  dailyLimit: number;
  monthlyLimit: number;
  canRead: boolean;
}

interface ProfileData {
  profile: UserProfile;
  stats: UserStats;
  credits: UserCredits;
}

interface ProfileState {
  data: ProfileData | null;
  loading: boolean;
  error: string | null;
}

export const useProfile = () => {
  const [state, setState] = useState<ProfileState>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchProfile = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const [profileRes, statsRes, creditsRes] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/user/stats"),
        fetch("/api/user/credits"),
      ]);

      if (!profileRes.ok || !statsRes.ok || !creditsRes.ok) {
        throw new Error("Failed to fetch profile data");
      }

      const [profile, stats, credits] = await Promise.all([
        profileRes.json(),
        statsRes.json(),
        creditsRes.json(),
      ]);

      // Validate and sanitize profile data
      const validatedProfile = {
        ...profile,
        id: profile?.id || '',
        clerkId: profile?.clerkId || '',
        email: profile?.email || '',
        firstName: profile?.firstName || '',
        lastName: profile?.lastName || '',
        imageUrl: profile?.imageUrl || '',
        createdAt: profile?.createdAt || new Date().toISOString(),
        updatedAt: profile?.updatedAt || new Date().toISOString(),
      };

      // Validate stats data
      const validatedStats = {
        level: typeof stats?.level === 'number' ? stats.level : 1,
        currentExp: typeof stats?.currentExp === 'number' ? stats.currentExp : 0,
        nextLevelExp: typeof stats?.nextLevelExp === 'number' ? stats.nextLevelExp : 100,
        expToNextLevel: typeof stats?.expToNextLevel === 'number' ? stats.expToNextLevel : 100,
        totalReadings: typeof stats?.totalReadings === 'number' ? stats.totalReadings : 0,
        totalExp: typeof stats?.totalExp === 'number' ? stats.totalExp : 0,
        totalCoins: typeof stats?.totalCoins === 'number' ? stats.totalCoins : 0,
        currentStreak: typeof stats?.currentStreak === 'number' ? stats.currentStreak : 0,
        longestStreak: typeof stats?.longestStreak === 'number' ? stats.longestStreak : 0,
        daysActive: typeof stats?.daysActive === 'number' ? stats.daysActive : 0,
      };

      // Validate credits data
      const validatedCredits = {
        freePoint: typeof credits?.freePoint === 'number' ? credits.freePoint : 0,
        stars: typeof credits?.stars === 'number' ? credits.stars : 0,
        totalCredits: typeof credits?.totalCredits === 'number' ? credits.totalCredits : 0,
        dailyUsed: typeof credits?.dailyUsed === 'number' ? credits.dailyUsed : 0,
        monthlyUsed: typeof credits?.monthlyUsed === 'number' ? credits.monthlyUsed : 0,
        dailyLimit: typeof credits?.dailyLimit === 'number' ? credits.dailyLimit : 3,
        monthlyLimit: typeof credits?.monthlyLimit === 'number' ? credits.monthlyLimit : 50,
        canRead: typeof credits?.canRead === 'boolean' ? credits.canRead : true,
      };

      setState({
        data: { 
          profile: validatedProfile, 
          stats: validatedStats, 
          credits: validatedCredits 
        },
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to fetch profile",
      });
    }
  };

  const refresh = () => {
    fetchProfile();
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    ...state,
    refresh,
  };
};