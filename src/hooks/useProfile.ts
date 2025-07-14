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

      setState({
        data: { profile, stats, credits },
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