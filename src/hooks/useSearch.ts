"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { FilterOptions } from "@/components/history/SearchFilters";
import { ReadingStatus } from "@/types/reading";

interface SearchResult {
  id: string;
  question: string;
  cards: Array<{
    id: number;
    name: string;
    nameTh: string;
    imageUrl: string;
    keywords: string;
    keywordsTh: string;
    meaning: string;
    meaningTh: string;
    category: string;
  }>;
  analysis: {
    mood: string;
    topic: string;
    timeframe: string;
  };
  answer: any;
  status: ReadingStatus;
  createdAt: string;
  expEarned: number;
  coinsEarned: number;
  isReviewed?: boolean;
  reviewAccuracy?: number;
  reviewComment?: string;
}

interface SearchState {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
  page: number;
  filters: FilterOptions;
}

interface UseSearchReturn {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
  filters: FilterOptions;
  setFilters: (filters: FilterOptions) => void;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  clearSearch: () => void;
}

const ITEMS_PER_PAGE = 12;


function filterByDateRange(createdAt: string, dateRange: FilterOptions['dateRange'], customStart?: string, customEnd?: string): boolean {
  const date = new Date(createdAt);
  const now = new Date();
  
  switch (dateRange) {
    case 'today':
      return date.toDateString() === now.toDateString();
    case 'week':
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return date >= weekAgo;
    case 'month':
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      return date >= monthAgo;
    case 'year':
      const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      return date >= yearAgo;
    case 'custom':
      if (!customStart && !customEnd) return true;
      const start = customStart ? new Date(customStart) : new Date(0);
      const end = customEnd ? new Date(customEnd + 'T23:59:59') : new Date();
      return date >= start && date <= end;
    default:
      return true;
  }
}

function applyFilters(results: SearchResult[], filters: FilterOptions): SearchResult[] {
  let filtered = [...results];

  // Search filter
  if (filters.search) {
    const searchTerms = filters.search.toLowerCase().split(' ').filter(term => term.length > 0);
    filtered = filtered.filter(reading => {
      const searchableText = [
        reading.question,
        ...(reading.cards?.map(card => `${card.name} ${card.nameTh} ${card.keywords} ${card.keywordsTh}`) || []),
        JSON.stringify(reading.answer)
      ].join(' ').toLowerCase();
      
      return searchTerms.every(term => searchableText.includes(term));
    });
  }

  // Date range filter
  if (filters.dateRange !== 'all') {
    filtered = filtered.filter(reading => 
      filterByDateRange(reading.createdAt, filters.dateRange, filters.customStartDate, filters.customEndDate)
    );
  }

  // Review status filter
  if (filters.hasReview !== 'all') {
    if (filters.hasReview === 'reviewed') {
      filtered = filtered.filter(reading => reading.isReviewed === true);
    } else {
      filtered = filtered.filter(reading => reading.isReviewed !== true);
    }
  }

  // Card count filter
  if (filters.cardCount !== 'all') {
    const count = parseInt(filters.cardCount);
    filtered = filtered.filter(reading => reading.cards?.length === count);
  }


  // Sort results
  filtered.sort((a, b) => {
    switch (filters.sortBy) {
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'rating':
        const aRating = a.reviewAccuracy || 0;
        const bRating = b.reviewAccuracy || 0;
        return bRating - aRating;
      case 'reviewed':
        if (a.isReviewed === b.isReviewed) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return (b.isReviewed ? 1 : 0) - (a.isReviewed ? 1 : 0);
      case 'unreviewed':
        if (a.isReviewed === b.isReviewed) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return (a.isReviewed ? 1 : 0) - (b.isReviewed ? 1 : 0);
      default: // newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return filtered;
}

export function useSearch(initialData: SearchResult[] = []): UseSearchReturn {
  const [state, setState] = useState<SearchState>({
    results: [],
    loading: false,
    error: null,
    total: 0,
    hasMore: false,
    page: 1,
    filters: {
      search: "",
      dateRange: "all",
      sortBy: "newest",
      hasReview: "all",
      cardCount: "all",
    }
  });

  // Update results when initialData changes (including when items are deleted)
  useEffect(() => {
    setState(prev => ({
      ...prev,
      results: initialData || [],
      page: 1 // Reset pagination when new data comes in
    }));
  }, [initialData]);

  // Apply filters when filters change or data changes
  const filteredResults = useMemo(() => {
    return applyFilters(state.results, state.filters);
  }, [state.results, state.filters]);

  const setFilters = useCallback((filters: FilterOptions) => {
    setState(prev => ({
      ...prev,
      filters,
      page: 1 // Reset to first page when filters change
    }));
  }, []);

  const loadMore = useCallback(async () => {
    // Since we're doing client-side filtering, just increase the page
    setState(prev => ({
      ...prev,
      page: prev.page + 1
    }));
  }, []);

  const refresh = useCallback(async () => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));

    try {
      // This would typically fetch from API
      // For now, we'll just reset the state
      setState(prev => ({
        ...prev,
        loading: false,
        page: 1
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh'
      }));
    }
  }, []);

  const clearSearch = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: {
        search: "",
        dateRange: "all",
        sortBy: "newest",
        hasReview: "all",
        cardCount: "all",
      },
      page: 1
    }));
  }, []);

  // Calculate pagination
  const paginatedResults = useMemo(() => {
    const startIndex = 0;
    const endIndex = state.page * ITEMS_PER_PAGE;
    return filteredResults.slice(startIndex, endIndex);
  }, [filteredResults, state.page]);

  const hasMore = useMemo(() => {
    return (state.page * ITEMS_PER_PAGE) < filteredResults.length;
  }, [state.page, filteredResults.length]);

  return {
    results: paginatedResults,
    loading: state.loading,
    error: state.error,
    total: filteredResults.length,
    hasMore,
    filters: state.filters,
    setFilters,
    loadMore,
    refresh,
    clearSearch,
  };
}