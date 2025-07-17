"use client";

import { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';

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
  const { user, isLoaded } = useUser();
  const [state, setState] = useState<ProfileState>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchProfile = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      console.log('🚀 Fetching profile data...');
      const [profileRes, statsRes, creditsRes] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/user/stats"),
        fetch("/api/user/credits"),
      ]);

      console.log('📊 API Response status:', {
        profile: profileRes.status,
        stats: statsRes.status,
        credits: creditsRes.status
      });

      if (!profileRes.ok || !statsRes.ok || !creditsRes.ok) {
        const errorDetails = {
          profile: profileRes.status,
          stats: statsRes.status,
          credits: creditsRes.status
        };
        console.error('❌ API Error:', errorDetails);
        throw new Error(`Failed to fetch profile data: ${JSON.stringify(errorDetails)}`);
      }

      const [profileData, statsData, creditsData] = await Promise.all([
        profileRes.json(),
        statsRes.json(),
        creditsRes.json(),
      ]);

      // Extract data from API response wrappers
      console.log('📊 Raw API Data:', {
        profile: profileData,
        stats: statsData,
        credits: creditsData
      });

      const profile = profileData.success ? profileData.data : profileData;
      const stats = statsData.success ? statsData.data : statsData;
      const credits = creditsData.success ? creditsData.data : creditsData;

      console.log('📊 Extracted Data:', {
        profile,
        stats,
        credits
      });

      // Validate and sanitize profile data
      const validatedProfile = {
        id: profile?.id || '',
        clerkId: profile?.id || '', // API uses 'id' for clerkId
        email: profile?.email || '',
        firstName: profile?.name || '', // API uses 'name' field
        lastName: '', // Not provided by API
        imageUrl: profile?.imageUrl || '',
        createdAt: profile?.createdAt || new Date().toISOString(),
        updatedAt: profile?.updatedAt || new Date().toISOString(),
      };

      // Validate stats data with correct API field mapping
      const validatedStats = {
        level: typeof stats?.level === 'number' ? stats.level : 1,
        currentExp: typeof stats?.exp === 'number' ? stats.exp : 0, // API uses 'exp'
        nextLevelExp: typeof stats?.expRequired === 'number' ? stats.expRequired : 100, // API uses 'expRequired'
        expToNextLevel: typeof stats?.expToNext === 'number' ? stats.expToNext : 100, // API uses 'expToNext'
        totalReadings: typeof stats?.totalReadings === 'number' ? stats.totalReadings : 0,
        totalExp: typeof stats?.exp === 'number' ? stats.exp : 0, // Use exp as totalExp
        totalCoins: typeof stats?.coins === 'number' ? stats.coins : 0, // API uses 'coins'
        currentStreak: typeof stats?.loginStreak === 'number' ? stats.loginStreak : 0, // API uses 'loginStreak'
        longestStreak: typeof stats?.loginStreak === 'number' ? stats.loginStreak : 0, // Use same for now
        daysActive: typeof stats?.totalReadings === 'number' ? stats.totalReadings : 0, // Approximate
      };

      // Validate credits data (API has different structure)
      const validatedCredits = {
        freePoint: typeof credits?.freePoint === 'number' ? credits.freePoint : 0,
        stars: typeof credits?.stars === 'number' ? credits.stars : 0,
        totalCredits: typeof credits?.total === 'number' ? credits.total : (credits?.freePoint || 0) + (credits?.stars || 0),
        dailyUsed: typeof credits?.limits?.dailyFree?.used === 'number' ? credits.limits.dailyFree.used : 0,
        monthlyUsed: typeof credits?.limits?.monthlyFree?.used === 'number' ? credits.limits.monthlyFree.used : 0,
        dailyLimit: typeof credits?.limits?.dailyFree?.max === 'number' ? credits.limits.dailyFree.max : 3,
        monthlyLimit: typeof credits?.limits?.monthlyFree?.max === 'number' ? credits.limits.monthlyFree.max : 50,
        canRead: (credits?.total || (credits?.freePoint || 0) + (credits?.stars || 0)) > 0,
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
    // Only fetch if user is loaded and authenticated
    if (isLoaded && user) {
      fetchProfile();
    } else if (isLoaded && !user) {
      // User is not authenticated, set appropriate state
      setState({
        data: null,
        loading: false,
        error: 'Authentication required'
      });
    }
  }, [isLoaded, user]);

  return {
    ...state,
    refresh,
  };
};