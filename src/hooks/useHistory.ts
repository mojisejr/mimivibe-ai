"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from '@clerk/nextjs';
import { ReadingStatus } from '@/types/reading';

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

interface ReadingStructure {
  header: string;
  cards_reading: any[];
  reading: string;
  suggestions: string[];
  next_questions: string[];
  final: string;
  end: string;
  notice: string;
}

interface ReviewData {
  id: number;
  accurateLevel: number;
  createdAt: string;
  reviewPeriod: number;
  liked: boolean;
  comment?: string;
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
  answer: ReadingStructure | null; // Changed from 'reading: string' to full structure, nullable for pending readings
  status: ReadingStatus;
  createdAt: string;
  expEarned: number;
  coinsEarned: number;
  isReviewed?: boolean; // Add review status
  reviewAccuracy?: number; // Add review percentage (0-100)
  reviewComment?: string; // Add review comment
  reviewData?: ReviewData | null; // Add review data
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
  const { user, isLoaded } = useUser();
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
        throw new Error(`Failed to fetch reading history: ${response.status}`);
      }

      const result = await response.json();


      // Validate response structure
      if (!result || typeof result !== 'object') {
        throw new Error("Invalid response format");
      }

      // Extract data from API response wrapper
      const apiData = result.success ? result.data : result;
      const pagination = apiData.pagination || {};


      // Ensure readings is always an array and map to expected structure
      const validatedResult = {
        readings: Array.isArray(apiData.readings) ? apiData.readings.map((reading: any) => ({
          id: reading.id,
          question: reading.question,
          cards: Array.isArray(reading.cards) ? reading.cards.map((card: any) => ({
            id: card.id,
            name: card.name || card.displayName,
            nameTh: card.displayName || card.name,
            imageUrl: card.imageUrl || '',
            keywords: card.keywords || '',
            keywordsTh: card.keywords || '',
            meaning: card.shortMeaning || '',
            meaningTh: card.shortMeaning || '',
            category: card.arcana || '',
          })) : [],
          analysis: reading.analysis || { mood: '', topic: '', timeframe: '' },
          answer: reading.answer || { // Preserve full reading structure instead of just 'reading' field
            header: '',
            cards_reading: [],
            reading: '',
            suggestions: [],
            next_questions: [],
            final: '',
            end: '',
            notice: ''
          },
          createdAt: reading.createdAt || new Date().toISOString(),
          expEarned: reading.expEarned || 15, // Use actual value or default
          coinsEarned: reading.coinsEarned || 3, // Use actual value or default
          isReviewed: reading.isReviewed || false, // Add review status
          reviewAccuracy: reading.reviewAccuracy || undefined, // Add review percentage
          reviewComment: reading.reviewComment || undefined, // Add review comment
          reviewData: reading.reviewData || null // Add review data
        })) : [],
        total: typeof pagination.total === 'number' ? pagination.total : 0,
        page: typeof pagination.page === 'number' ? pagination.page : 1,
        limit: typeof pagination.limit === 'number' ? pagination.limit : initialLimit,
        hasMore: typeof pagination.hasMore === 'boolean' ? pagination.hasMore : false,
      };

      setState(prev => ({
        data: append && prev.data ? {
          ...validatedResult,
          readings: [
            ...(Array.isArray(prev.data.readings) ? prev.data.readings : []), 
            ...validatedResult.readings
          ],
        } : validatedResult,
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
    if (state.data && 
        state.data.hasMore && 
        !state.loadingMore && 
        Array.isArray(state.data.readings)) {
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

  const deleteReading = useCallback(async (readingId: string) => {
    try {
      const response = await fetch(`/api/readings/${readingId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete reading");
      }

      // Remove reading from current data
      setState(prev => {
        if (!prev.data || !Array.isArray(prev.data.readings)) {
          return prev;
        }

        const filteredReadings = prev.data.readings.filter(reading => reading.id !== readingId);
        
        return {
          ...prev,
          data: {
            ...prev.data,
            readings: filteredReadings,
            total: Math.max(0, prev.data.total - 1),
          }
        };
      });

      return await response.json();
    } catch (error) {
      throw error;
    }
  }, []);

  useEffect(() => {
    // Only fetch if user is loaded and authenticated
    if (isLoaded && user) {
      fetchHistory();
    } else if (isLoaded && !user) {
      // User is not authenticated, set appropriate state
      setState({
        data: null,
        loading: false,
        error: 'Authentication required',
        loadingMore: false
      });
    }
  }, [isLoaded, user, fetchHistory]);

  return {
    ...state,
    loadMore,
    refresh,
    getReadingDetails,
    deleteReading,
    hasMore: state.data?.hasMore || false,
  };
};