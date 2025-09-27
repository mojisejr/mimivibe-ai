"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useReadingStatus } from '@/hooks/useReadingStatus';
import { useTranslation } from '@/lib/i18n';
import { StatusIndicator } from './StatusIndicator';
import { LoadingAnimation } from './LoadingAnimation';

interface ConfirmationPageProps {
  readingId: string;
}

export function ConfirmationPage({ readingId }: ConfirmationPageProps) {
  const { t } = useTranslation();
  const router = useRouter();
  
  const {
    data,
    error,
    isLoading,
    isCompleted,
    isFailed,
    isProcessing,
    isPending,
    estimatedTimeRemaining,
    errorMessage,
    reading
  } = useReadingStatus(readingId);

  // Auto-redirect when completed
  useEffect(() => {
    if (isCompleted && reading) {
      // Redirect to the reading result page
      router.push(`/history/${readingId}`);
    }
  }, [isCompleted, reading, readingId, router]);

  // Handle error state
  if (error || isFailed) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card bg-base-200 shadow-xl border border-error/20 p-8 max-w-md w-full text-center"
        >
          <div className="text-error text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-base-content mb-4">
            {t('common.status.failed')}
          </h2>
          <p className="text-base-content/70 mb-6">
            {errorMessage || error?.message || 'เกิดข้อผิดพลาดในการทำนาย'}
          </p>
          <button
            onClick={() => router.push('/ask')}
            className="btn btn-error text-white px-6 py-3 font-semibold hover:scale-105 transition-all duration-200"
          >
            ลองใหม่อีกครั้ง
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-base-200 shadow-xl border border-primary/20 p-8 max-w-lg w-full text-center"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="text-6xl mb-4">🔮</div>
          <h1 className="text-3xl font-bold text-base-content mb-2">
            แม่หมอมีมี่กำลังทำนาย
          </h1>
          <p className="text-base-content/70">
            กรุณารอสักครู่ ขณะที่เราเตรียมคำทำนายพิเศษสำหรับคุณ
          </p>
        </motion.div>

        {/* Loading Animation */}
        <LoadingAnimation />

        {/* Status Indicator */}
        <StatusIndicator
          status={data?.data?.status}
          estimatedTimeRemaining={estimatedTimeRemaining}
          isLoading={isLoading}
        />

        {/* Progress Information */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 space-y-4"
        >
          {/* Reading ID for reference */}
          <div className="bg-base-300 rounded-lg p-4 border border-primary/20">
            <p className="text-sm text-base-content/60 mb-1">หมายเลขการทำนาย</p>
            <p className="text-base-content font-mono text-lg">{readingId}</p>
          </div>

          {/* Estimated time */}
          {estimatedTimeRemaining && estimatedTimeRemaining > 0 && (
            <div className="bg-base-300 rounded-lg p-4 border border-primary/20">
              <p className="text-sm text-base-content/60 mb-1">เวลาที่คาดว่าจะเสร็จ</p>
              <p className="text-base-content text-lg">
                ประมาณ {Math.ceil(estimatedTimeRemaining / 60)} นาที
              </p>
            </div>
          )}

          {/* Encouraging message */}
          <div className="text-center">
            <p className="text-base-content/70 text-sm leading-relaxed">
              💫 การทำนายที่ดีต้องใช้เวลา แม่หมอมีมี่กำลังใช้พลังจักรวาล
              <br />
              เพื่อมอบคำทำนายที่แม่นยำที่สุดให้กับคุณ
            </p>
          </div>
        </motion.div>

        {/* Navigation hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 pt-6 border-t border-primary/20"
        >
          <p className="text-base-content/60 text-sm">
            💡 คุณสามารถปิดหน้านี้ได้ เมื่อการทำนายเสร็จสิ้น
            <br />
            เราจะส่งผลลัพธ์ไปยังประวัติการทำนายของคุณ
          </p>
          <button
            onClick={() => router.push('/history')}
            className="mt-4 text-primary hover:text-primary-focus transition-colors duration-200 text-sm underline"
          >
            ดูประวัติการทำนาย
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}