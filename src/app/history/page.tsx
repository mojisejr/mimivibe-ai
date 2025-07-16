"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useHistory } from "@/hooks/useHistory";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { ReadingCard } from "@/components/history/ReadingCard";
import { ReadingDetailModal } from "@/components/history/ReadingDetailModal";
import { HistoryLoadingState, ErrorState, EmptyState } from "@/components/ui";
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
    data,
    loading,
    error,
    loadMore,
    refresh,
    hasMore,
    loadingMore,
    deleteReading,
  } = useHistory();
  const [selectedReading, setSelectedReading] = useState<Reading | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

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
    } catch (error) {
      console.error("Failed to delete reading:", error);
      // TODO: Show error toast/notification
    }
  };

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
          {data && typeof data.total === "number" && (
            <p className="text-sm text-neutral-content">
              Total readings: {data.total}
            </p>
          )}
        </div>

        {loading ? (
          <HistoryLoadingState />
        ) : error ? (
          <ErrorState
            title="เกิดข้อผิดพลาด"
            message={error}
            onRetry={refresh}
            retryText="โหลดประวัติใหม่"
          />
        ) : data &&
          data.readings &&
          Array.isArray(data.readings) &&
          data.readings.length > 0 ? (
          <>
            {/* Reading Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6 mb-8">
              {data.readings.map((reading) => (
                <ReadingCard
                  key={reading.id}
                  reading={reading}
                  onClick={() => handleReadingClick(reading)}
                  onDelete={handleDeleteReading}
                />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="text-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="btn btn-outline btn-primary"
                >
                  {loadingMore ? (
                    <>
                      <span className="loading loading-spinner loading-sm mr-2" />
                      กำลังโหลด...
                    </>
                  ) : (
                    "Load More Readings"
                  )}
                </button>
              </div>
            )}

            {/* End Message */}
            {!hasMore && data.readings && data.readings.length > 6 && (
              <div className="text-center mt-8">
                <p className="body-normal text-neutral-content mb-4">
                  คุณได้ดูการอ่านทั้งหมดแล้ว
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
