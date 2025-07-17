"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useHistory } from "@/hooks/useHistory";
import { useSearch } from "@/hooks/useSearch";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { ReadingCard } from "@/components/history/ReadingCard";
import { ReadingDetailModal } from "@/components/history/ReadingDetailModal";
import { SearchFilters } from "@/components/history/SearchFilters";
import { HistoryLoadingState, ErrorState, EmptyState } from "@/components/ui";
import { SkeletonGrid, SkeletonSearchFilters } from "@/components/common/SkeletonLoader";
import { UnifiedNavbar } from "@/components/layout/UnifiedNavbar";

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

interface Reading {
  id: string;
  question: string;
  cards: Card[];
  analysis: {
    mood: string;
    topic: string;
    timeframe: string;
  };
  answer: ReadingStructure; // Changed from 'reading: string' to full structure
  createdAt: string;
  expEarned: number;
  coinsEarned: number;
}

export default function HistoryPage() {
  const { user, isLoaded } = useUser();
  const {
    data: historyData,
    loading: historyLoading,
    error: historyError,
    loadMore: loadMoreHistory,
    refresh: refreshHistory,
    hasMore: hasMoreHistory,
    loadingMore: loadingMoreHistory,
    deleteReading,
  } = useHistory();
  
  // Initialize search with history data
  const {
    results: searchResults,
    loading: searchLoading,
    error: searchError,
    total: searchTotal,
    hasMore: searchHasMore,
    filters,
    setFilters,
    loadMore: loadMoreSearch,
    refresh: refreshSearch,
  } = useSearch(historyData?.readings || []);
  
  const [selectedReading, setSelectedReading] = useState<Reading | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Infinite scroll setup (must be called before any early returns)
  const { sentinelRef } = useInfiniteScroll({
    hasMore: searchHasMore,
    isLoading: searchLoading,
    onLoadMore: loadMoreSearch,
    threshold: 300,
    enabled: searchResults.length > 0,
  });

  // Update search data when history data changes
  useEffect(() => {
    if (historyData?.readings) {
      // Update search hook with new data - this would typically be handled by the search hook internally
      refreshSearch();
    }
  }, [historyData?.readings, refreshSearch]);

  // Debug authentication state
  console.log("🔐 Authentication state (History):", {
    isLoaded,
    userId: user?.id,
    isSignedIn: !!user,
  });

  // Don't render until auth is loaded
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 flex items-center justify-center">
        <div className="text-center">
          <h1 className="heading-1 mb-4">Authentication Required</h1>
          <p className="body-normal text-neutral-content mb-4">
            Please sign in to view your reading history
          </p>
          <Link href="/sign-in" className="btn btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const handleReadingClick = (reading: Reading) => {
    setSelectedReading(reading);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedReading(null);
  };

  const handleDeleteReading = async (readingId: string) => {
    try {
      await deleteReading(readingId);
      // Close modal if currently viewing the deleted reading
      if (selectedReading?.id === readingId) {
        handleCloseModal();
      }
      // Refresh search results after deletion
      refreshSearch();
    } catch (error) {
      console.error("Failed to delete reading:", error);
      // TODO: Show error toast/notification
    }
  };

  // Determine which data to show based on search state
  const isLoading = historyLoading || searchLoading;
  const error = historyError || searchError;
  const results = searchResults;
  const total = searchTotal;
  const hasMore = searchHasMore;
  const loadMore = loadMoreSearch;

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 flex flex-col">
      {/* Header */}
      <UnifiedNavbar />

      {/* Main Content */}
      <main className="content-container flex-1 pb-20 md:pb-6 pt-20">
        <div className="text-center mb-8">
          <h1 className="heading-1 mb-4">Reading History</h1>
          <p className="body-large text-neutral-content">
            Review your past tarot readings and insights
          </p>
          {historyData && typeof historyData.total === "number" && (
            <p className="text-sm text-neutral-content">
              Total readings: {historyData.total}
            </p>
          )}
        </div>

        {/* Search and Filters */}
        {!isLoading && !error && historyData?.readings && historyData.readings.length > 0 && (
          <SearchFilters
            onFiltersChange={setFilters}
            initialFilters={filters}
            totalResults={total}
            isLoading={searchLoading}
          />
        )}

        {isLoading && !results.length ? (
          <>
            {historyData?.readings && historyData.readings.length > 0 && (
              <SkeletonSearchFilters />
            )}
            <SkeletonGrid count={6} columns={4} />
          </>
        ) : error ? (
          <ErrorState
            title="เกิดข้อผิดพลาด"
            message={error}
            onRetry={refreshHistory}
            retryText="โหลดประวัติใหม่"
          />
        ) : results && results.length > 0 ? (
          <>
            {/* Reading Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6 mb-8">
              {results.map((reading) => (
                <ReadingCard
                  key={reading.id}
                  reading={reading}
                  onClick={() => handleReadingClick(reading)}
                  onDelete={handleDeleteReading}
                />
              ))}
            </div>

            {/* Infinite Scroll Sentinel */}
            {hasMore && (
              <div ref={sentinelRef} className="text-center py-8">
                {searchLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <span className="loading loading-spinner loading-md"></span>
                    <span className="text-base-content/70">Loading more readings...</span>
                  </div>
                ) : (
                  <button
                    onClick={loadMore}
                    className="btn btn-outline btn-primary"
                  >
                    Load More Readings
                  </button>
                )}
              </div>
            )}

            {/* Load More from Server */}
            {!hasMore && hasMoreHistory && (
              <div className="text-center mb-8">
                <button
                  onClick={loadMoreHistory}
                  disabled={loadingMoreHistory}
                  className="btn btn-ghost btn-sm"
                >
                  {loadingMoreHistory ? (
                    <>
                      <span className="loading loading-spinner loading-xs mr-2" />
                      Loading more from server...
                    </>
                  ) : (
                    "Load more from server"
                  )}
                </button>
              </div>
            )}

            {/* End Message */}
            {!hasMore && !hasMoreHistory && results.length > 6 && (
              <div className="text-center mt-8">
                <p className="body-normal text-neutral-content mb-4">
                  {total === historyData?.total 
                    ? "คุณได้ดูการอ่านทั้งหมดแล้ว"
                    : `Showing ${total} of ${historyData?.total} readings`
                  }
                </p>
                <Link href="/ask" className="btn btn-primary">
                  <span className="mr-2">🔮</span>
                  Ask the Cards Again
                </Link>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title="ยังไม่มีประวัติการอ่าน"
            message="เริ่มต้นการเดินทางทางจิตวิญญาณของคุณด้วยการถามไพ่ทาโรต์"
            actionText="Ask the Cards"
            onAction={() => (window.location.href = "/ask")}
          />
        )}
      </main>

      {/* Reading Detail Modal */}
      <ReadingDetailModal
        reading={selectedReading}
        isOpen={showDetailModal}
        onClose={handleCloseModal}
        onDelete={handleDeleteReading}
      />

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </div>
  );
}
