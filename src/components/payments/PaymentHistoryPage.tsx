"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { usePaymentHistory } from "@/hooks/usePaymentHistory";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { PaymentCard } from "./PaymentCard";
import { PaymentFilters } from "./PaymentFilters";
import { PaymentSummary } from "./PaymentSummary";
import { SkeletonGrid } from "@/components/common/SkeletonLoader";
import { ErrorState, EmptyState } from "@/components/ui";
import type { PaymentHistoryItem, PaymentFilters as PaymentFiltersType } from "@/types/payment";

export default function PaymentHistoryPage() {
  const { user, isLoaded } = useUser();
  const {
    data: paymentData,
    loading: paymentLoading,
    error: paymentError,
    loadMore: loadMorePayments,
    refresh: refreshPayments,
    hasMore: hasMorePayments,
    loadingMore: loadingMorePayments,
    applyFilters,
    filters,
  } = usePaymentHistory();

  const [selectedPayment, setSelectedPayment] = useState<PaymentHistoryItem | null>(null);

  // Infinite scroll setup
  const { sentinelRef } = useInfiniteScroll({
    hasMore: hasMorePayments,
    isLoading: paymentLoading || loadingMorePayments,
    onLoadMore: loadMorePayments,
    threshold: 300,
    enabled: (paymentData?.payments.length || 0) > 0,
  });

  // Debug authentication state
  console.log("🔐 Authentication state (Payment History):", {
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
            Please sign in to view your payment history
          </p>
          <Link href="/sign-in" className="btn btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const handlePaymentClick = (payment: PaymentHistoryItem) => {
    setSelectedPayment(payment);
    // For now, just log the payment details
    console.log("Payment details:", payment);
  };

  const handleFiltersChange = (newFilters: PaymentFiltersType) => {
    applyFilters(newFilters);
  };

  // Determine which data to show
  const isLoading = paymentLoading;
  const error = paymentError;
  const payments = paymentData?.payments || [];
  const pagination = paymentData?.pagination;
  const summary = paymentData?.summary;
  const hasMore = hasMorePayments;

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 flex flex-col">
      {/* Main Content */}
      <main className="content-container flex-1 pb-20 md:pb-6 pt-20">
        <div className="text-center mb-8">
          <h1 className="heading-1 mb-4">Payment History</h1>
          <p className="body-large text-neutral-content">
            ประวัติการชำระเงินและซื้อดาวของคุณ
          </p>
          {pagination && (
            <p className="text-sm text-neutral-content">
              Total payments: {pagination.total}
            </p>
          )}
        </div>

        {/* Summary Statistics */}
        {summary && !isLoading && (
          <PaymentSummary summary={summary} />
        )}

        {/* Filters */}
        {!isLoading && !error && payments.length > 0 && (
          <PaymentFilters
            onFiltersChange={handleFiltersChange}
            initialFilters={filters}
            totalResults={pagination?.total}
            isLoading={isLoading}
          />
        )}

        {isLoading && !payments.length ? (
          <>
            {/* Summary skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card bg-base-100 shadow-sm border border-base-300/50">
                  <div className="card-body p-4">
                    <div className="skeleton h-4 w-16 mb-2"></div>
                    <div className="skeleton h-6 w-20"></div>
                  </div>
                </div>
              ))}
            </div>
            {/* Cards skeleton */}
            <SkeletonGrid count={6} columns={3} />
          </>
        ) : error ? (
          <ErrorState
            title="เกิดข้อผิดพลาด"
            message={error}
            onRetry={refreshPayments}
            retryText="โหลดประวัติใหม่"
          />
        ) : payments && payments.length > 0 ? (
          <>
            {/* Payment Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 gap-4 md:gap-6 mb-8">
              {payments.map((payment) => (
                <PaymentCard
                  key={payment.id}
                  payment={payment}
                  onClick={() => handlePaymentClick(payment)}
                />
              ))}
            </div>

            {/* Infinite Scroll Sentinel */}
            {hasMore && (
              <div ref={sentinelRef} className="text-center py-8">
                {loadingMorePayments ? (
                  <div className="flex items-center justify-center space-x-2">
                    <span className="loading loading-spinner loading-md"></span>
                    <span className="text-base-content/70">
                      Loading more payments...
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={loadMorePayments}
                    className="btn btn-outline btn-primary"
                  >
                    Load More Payments
                  </button>
                )}
              </div>
            )}

            {/* End Message */}
            {!hasMore && payments.length > 6 && (
              <div className="text-center mt-8">
                <p className="body-normal text-neutral-content mb-4">
                  คุณได้ดูประวัติการชำระเงินทั้งหมดแล้ว
                </p>
                <Link href="/packages" className="btn btn-primary">
                  <span className="mr-2">💳</span>
                  ซื้อดาวเพิ่ม
                </Link>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title="ยังไม่มีประวัติการชำระเงิน"
            message="เริ่มต้นซื้อดาวเพื่อใช้ในการทำนายไพ่ทาโรต์"
            actionText="ซื้อดาว"
            onAction={() => (window.location.href = "/packages")}
          />
        )}
      </main>
    </div>
  );
}