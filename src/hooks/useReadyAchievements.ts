import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

interface ReadyAchievement {
  id: string;
  name: string;
  icon: string;
  title: string;
  description: string;
  rewards: {
    exp?: number;
    coins?: number;
    stars?: number;
  };
  progress: {
    current: number;
    required: number;
    completed: boolean;
  };
}

interface ReadyAchievementsData {
  count: number;
  achievements: ReadyAchievement[];
}

export function useReadyAchievements() {
  const [data, setData] = useState<ReadyAchievementsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isSignedIn, userId } = useAuth();

  const fetchReadyAchievements = useCallback(async () => {
    if (!isSignedIn || !userId) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/achievements/ready');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ready achievements: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error || 'Failed to load ready achievements');
      }
    } catch (err) {
      console.error('Ready achievements fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load ready achievements');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, userId]);

  // Initial fetch
  useEffect(() => {
    fetchReadyAchievements();
  }, [fetchReadyAchievements]);

  // Refetch function for manual updates
  const refetch = useCallback(() => {
    fetchReadyAchievements();
  }, [fetchReadyAchievements]);

  return {
    data,
    loading,
    error,
    refetch
  };
}