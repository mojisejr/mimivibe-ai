"use client";

import { useState, useEffect, useCallback } from "react";

interface Card {
  id: number;
  name: string;
  nameTh: string;
  imageUrl: string;
  keywords: string;
  keywordsTh: string;
  meaning: string;
  meaningTh: string;
  category: string;
}

interface Reading {
  id: string;
  question: string;
  cards: Card[];
  analysis: {
    mood: string;
    topic: string;
    timeframe: string;
  };
  reading: string;
  createdAt: string;
  expEarned: number;
  coinsEarned: number;
}

interface HistoryData {
  readings: Reading[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

interface HistoryState {
  data: HistoryData | null;
  loading: boolean;
  error: string | null;
  loadingMore: boolean;
}

export const useHistory = (initialLimit = 6) => {
  const [state, setState] = useState<HistoryState>({
    data: null,
    loading: true,
    error: null,
    loadingMore: false,
  });

  const fetchHistory = useCallback(async (page = 1, limit = initialLimit, append = false) => {
    try {
      setState(prev => ({ 
        ...prev, 
        loading: !append, 
        loadingMore: append, 
        error: null 
      }));

      const response = await fetch(
        `/api/readings/history?page=${page}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch reading history");
      }

      const result = await response.json();

      setState(prev => ({
        data: append && prev.data ? {
          ...result,
          readings: [...prev.data.readings, ...result.readings],
        } : result,
        loading: false,
        loadingMore: false,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        loadingMore: false,
        error: error instanceof Error ? error.message : "Failed to fetch history",
      }));
    }
  }, [initialLimit]);

  const loadMore = useCallback(() => {
    if (state.data && state.data.hasMore && !state.loadingMore) {
      fetchHistory(state.data.page + 1, initialLimit, true);
    }
  }, [state.data, state.loadingMore, fetchHistory, initialLimit]);

  const refresh = useCallback(() => {
    fetchHistory(1, initialLimit, false);
  }, [fetchHistory, initialLimit]);

  const getReadingDetails = useCallback(async (readingId: string) => {
    try {
      const response = await fetch("/api/readings/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ readingId }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch reading details");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    ...state,
    loadMore,
    refresh,
    getReadingDetails,
    hasMore: state.data?.hasMore || false,
  };
};