"use client";

import useSWR from 'swr';
import { ReadingStatusResponse } from '@/types/reading';

interface UseReadingStatusOptions {
  refreshInterval?: number;
  enabled?: boolean;
  onStatusChange?: (status: ReadingStatusResponse) => void;
}

const fetcher = async (url: string): Promise<ReadingStatusResponse> => {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch reading status: ${response.status}`);
  }
  
  return response.json();
};

export function useReadingStatus(
  readingId: string | null,
  options: UseReadingStatusOptions = {}
) {
  const {
    refreshInterval = 10000, // 10 seconds default
    enabled = true,
    onStatusChange
  } = options;

  const shouldFetch = enabled && readingId;
  
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? `/api/readings/status/${readingId}` : null,
    fetcher,
    {
      refreshInterval: refreshInterval,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // Prevent duplicate requests within 5 seconds
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      onSuccess: (data) => {
        if (onStatusChange) {
          onStatusChange(data);
        }
      },
      // Stop polling when reading is completed or failed
      refreshWhenHidden: false,
      refreshWhenOffline: false,
      shouldRetryOnError: (error) => {
        // Don't retry on 404 (reading not found) or 403 (unauthorized)
        if (error?.message?.includes('404') || error?.message?.includes('403')) {
          return false;
        }
        return true;
      }
    }
  );

  // Stop polling when status is final
  const shouldStopPolling = data?.data?.status === 'COMPLETED' || data?.data?.status === 'FAILED';
  
  if (shouldStopPolling && refreshInterval > 0) {
    // Disable polling by setting refreshInterval to 0
    mutate(data, { revalidate: false });
  }

  return {
    data,
    error,
    isLoading,
    mutate,
    // Helper properties
    isCompleted: data?.data?.status === 'COMPLETED',
    isFailed: data?.data?.status === 'FAILED',
    isProcessing: data?.data?.status === 'PROCESSING',
    isPending: data?.data?.status === 'PENDING',
    // Estimated time remaining (in seconds)
    estimatedTimeRemaining: data?.data?.estimatedTimeRemaining,
    // Processing timestamps
    processingStartedAt: data?.data?.processingStartedAt,
    processingCompletedAt: data?.data?.processingCompletedAt,
    // Error message if failed
    errorMessage: data?.data?.errorMessage,
    // Full reading data if completed
    reading: data?.data?.reading,
    // Reading ID for convenience
    readingId: data?.data?.readingId
  };
}