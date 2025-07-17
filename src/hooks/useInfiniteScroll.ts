"use client";

import { useEffect, useCallback, useRef } from "react";

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  threshold?: number; // Distance from bottom in pixels
  rootMargin?: string;
  enabled?: boolean;
}

export function useInfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 200,
  rootMargin = "0px",
  enabled = true,
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      
      if (
        entry.isIntersecting &&
        hasMore &&
        !isLoading &&
        !loadingRef.current &&
        enabled
      ) {
        loadingRef.current = true;
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin,
      threshold: 0.1,
    });

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [handleIntersection, rootMargin, enabled]);

  // Reset loading ref when loading state changes
  useEffect(() => {
    if (!isLoading) {
      loadingRef.current = false;
    }
  }, [isLoading]);

  // Alternative scroll-based implementation for better compatibility
  const handleScroll = useCallback(() => {
    if (!enabled || !hasMore || isLoading || loadingRef.current) return;

    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = document.documentElement.scrollTop;
    const clientHeight = document.documentElement.clientHeight;

    if (scrollHeight - scrollTop - clientHeight < threshold) {
      loadingRef.current = true;
      onLoadMore();
    }
  }, [hasMore, isLoading, onLoadMore, threshold, enabled]);

  useEffect(() => {
    if (!enabled) return;

    const debouncedHandleScroll = debounce(handleScroll, 100);
    window.addEventListener("scroll", debouncedHandleScroll);

    return () => {
      window.removeEventListener("scroll", debouncedHandleScroll);
    };
  }, [handleScroll, enabled]);

  return {
    sentinelRef,
    isNearBottom: loadingRef.current,
  };
}

// Simple debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}