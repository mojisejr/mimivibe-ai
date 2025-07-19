"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from '@clerk/nextjs';
import type { PaymentHistoryItem, PaymentHistoryResponse, PaymentFilters, PaymentSummaryStats } from '@/types/payment';

interface PaymentHistoryData {
  payments: PaymentHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  summary: PaymentSummaryStats;
}

interface PaymentHistoryState {
  data: PaymentHistoryData | null;
  loading: boolean;
  error: string | null;
  loadingMore: boolean;
}

export const usePaymentHistory = (initialLimit = 10) => {
  const { user, isLoaded } = useUser();
  const [state, setState] = useState<PaymentHistoryState>({
    data: null,
    loading: true,
    error: null,
    loadingMore: false,
  });
  const [filters, setFilters] = useState<PaymentFilters>({});

  const buildQueryString = useCallback((params: PaymentFilters) => {
    const query = new URLSearchParams();
    
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);
    if (params.packId) query.set('packId', params.packId.toString());
    if (params.status) query.set('status', params.status);
    if (params.search) query.set('search', params.search);
    
    return query.toString();
  }, []);

  const fetchPaymentHistory = useCallback(async (
    page = 1, 
    limit = initialLimit, 
    append = false, 
    filterParams: PaymentFilters = {}
  ) => {
    try {
      setState(prev => ({ 
        ...prev, 
        loading: !append, 
        loadingMore: append, 
        error: null 
      }));

      const queryParams = {
        page,
        limit,
        ...filterParams
      };

      console.log('💳 Fetching payment history...', queryParams);
      
      const queryString = buildQueryString(queryParams);
      const response = await fetch(`/api/payments/history?${queryString}`);

      console.log('💰 Payment History API Response:', response.status);

      if (!response.ok) {
        console.error('❌ Payment History API Error:', response.status);
        throw new Error(`Failed to fetch payment history: ${response.status}`);
      }

      const result: PaymentHistoryResponse = await response.json();

      console.log('💰 Raw Payment History Data:', result);

      if (!result.success || !result.data) {
        throw new Error("Invalid response format");
      }

      const { payments, pagination, summary } = result.data;

      // Format summary stats for display
      const formattedSummary: PaymentSummaryStats = {
        totalAmount: summary.totalAmountDisplay,
        totalCredits: summary.totalCredits,
        totalTransactions: summary.totalTransactions,
        successRate: summary.successRate
      };

      const validatedResult: PaymentHistoryData = {
        payments: Array.isArray(payments) ? payments : [],
        pagination: {
          page: pagination.page || 1,
          limit: pagination.limit || initialLimit,
          total: pagination.total || 0,
          totalPages: pagination.totalPages || 0,
          hasNextPage: pagination.hasNextPage || false,
          hasPreviousPage: pagination.hasPreviousPage || false,
        },
        summary: formattedSummary
      };

      setState(prev => ({
        data: append && prev.data ? {
          ...validatedResult,
          payments: [
            ...(Array.isArray(prev.data.payments) ? prev.data.payments : []), 
            ...validatedResult.payments
          ],
          pagination: validatedResult.pagination, // Use new pagination info
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
        error: error instanceof Error ? error.message : "Failed to fetch payment history",
      }));
    }
  }, [initialLimit, buildQueryString]);

  const loadMore = useCallback(() => {
    if (state.data && 
        state.data.pagination.hasNextPage && 
        !state.loadingMore && 
        Array.isArray(state.data.payments)) {
      fetchPaymentHistory(state.data.pagination.page + 1, initialLimit, true, filters);
    }
  }, [state.data, state.loadingMore, fetchPaymentHistory, initialLimit, filters]);

  const refresh = useCallback(() => {
    fetchPaymentHistory(1, initialLimit, false, filters);
  }, [fetchPaymentHistory, initialLimit, filters]);

  const applyFilters = useCallback((newFilters: PaymentFilters) => {
    setFilters(newFilters);
    fetchPaymentHistory(1, initialLimit, false, newFilters);
  }, [fetchPaymentHistory, initialLimit]);

  const clearFilters = useCallback(() => {
    setFilters({});
    fetchPaymentHistory(1, initialLimit, false, {});
  }, [fetchPaymentHistory, initialLimit]);

  useEffect(() => {
    // Only fetch if user is loaded and authenticated
    if (isLoaded && user) {
      fetchPaymentHistory();
    } else if (isLoaded && !user) {
      // User is not authenticated, set appropriate state
      setState({
        data: null,
        loading: false,
        error: 'Authentication required',
        loadingMore: false
      });
    }
  }, [isLoaded, user, fetchPaymentHistory]);

  return {
    ...state,
    loadMore,
    refresh,
    applyFilters,
    clearFilters,
    filters,
    hasMore: state.data?.pagination.hasNextPage || false,
  };
};