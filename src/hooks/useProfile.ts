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
  totalReadings: number;
  coins: number;
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

// Removed calculateLevelProgression function - no longer needed

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

      const [profileRes, creditsRes] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/user/credits"),
      ]);

      if (!profileRes.ok || !creditsRes.ok) {
        const errorDetails = {
          profile: profileRes.status,
          credits: creditsRes.status
        };
        throw new Error(`Failed to fetch profile data: ${JSON.stringify(errorDetails)}`);
      }

      const [profileData, creditsData] = await Promise.all([
        profileRes.json(),
        creditsRes.json(),
      ]);

      // Extract data from API response wrappers

      const profile = profileData.success ? profileData.data : profileData;
      const credits = creditsData.success ? creditsData.data : creditsData;


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

      // Simplified stats - only track reading count
      const validatedStats = {
        totalReadings: 0, // Will be calculated from reading history if needed
        coins: typeof credits?.coins === 'number' ? credits.coins : 0,
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