"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useHistory } from '@/hooks/useHistory';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { ReadingCard } from '@/components/history/ReadingCard';
import { ReadingDetailModal } from '@/components/history/ReadingDetailModal';
import { Logo, HistoryLoadingState, ErrorState, EmptyState } from '@/components/ui';

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

export default function HistoryPage() {
  const { data, loading, error, loadMore, refresh, hasMore, loadingMore } = useHistory();
  const [selectedReading, setSelectedReading] = useState<Reading | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleReadingClick = (reading: Reading) => {
    setSelectedReading(reading);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedReading(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 flex flex-col">
      {/* Header */}
      <header className="navbar bg-base-100/90 backdrop-blur-sm shadow-lg">
        <div className="navbar-start">
          <Link href="/" className="flex items-center space-x-2">
            <Logo size="md" showText />
          </Link>
        </div>
        <div className="navbar-end">
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Main Content */}
      <main className="content-container flex-1 pb-20 md:pb-6">
        <div className="text-center mb-8">
          <h1 className="heading-1 mb-4">Reading History</h1>
          <p className="body-large text-neutral-content">
            Review your past tarot readings and insights
          </p>
          {data && (
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
        ) : data && data.readings.length > 0 ? (
          <>
            {/* Reading Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {data.readings.map((reading) => (
                <ReadingCard
                  key={reading.id}
                  reading={reading}
                  onClick={() => handleReadingClick(reading)}
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
            {!hasMore && data.readings.length > 6 && (
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
            onAction={() => window.location.href = '/ask'}
          />
        )}
      </main>

      {/* Reading Detail Modal */}
      <ReadingDetailModal
        reading={selectedReading}
        isOpen={showDetailModal}
        onClose={handleCloseModal}
      />

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </div>
  );
}