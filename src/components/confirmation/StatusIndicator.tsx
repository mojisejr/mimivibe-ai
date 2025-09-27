"use client";

import { motion } from 'framer-motion';
import { ReadingStatus } from '@/types/reading';

interface StatusIndicatorProps {
  status?: ReadingStatus;
  estimatedTimeRemaining?: number;
  isLoading?: boolean;
}

export function StatusIndicator({ status, estimatedTimeRemaining, isLoading }: StatusIndicatorProps) {
  if (isLoading || !status) {
    return (
      <div className="flex items-center justify-center space-x-2 text-base-content/70">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        <span className="text-sm">กำลังตรวจสอบสถานะ...</span>
      </div>
    );
  }

  const getStatusConfig = (status: ReadingStatus) => {
    switch (status) {
      case ReadingStatus.PENDING:
        return {
          icon: '⏳',
          text: 'รอการประมวลผล',
          description: 'กำลังเตรียมการทำนาย',
          color: 'text-base-content/70',
          bgColor: 'bg-base-300',
          borderColor: 'border-base-content/20',
        };
      case ReadingStatus.PROCESSING:
        return {
          icon: '🔮',
          text: 'กำลังทำนาย',
          description: 'แม่หมอมีมี่กำลังอ่านไพ่ให้คุณ',
          color: 'text-warning',
          bgColor: 'bg-warning/20',
          borderColor: 'border-warning/30',
        };
      case ReadingStatus.COMPLETED:
        return {
          icon: '✅',
          text: 'เสร็จสิ้น',
          description: 'การทำนายเสร็จสมบูรณ์',
          color: 'text-success',
          bgColor: 'bg-success/20',
          borderColor: 'border-success/30',
        };
      case ReadingStatus.FAILED:
        return {
          icon: '❌',
          text: 'เกิดข้อผิดพลาด',
          description: 'กรุณาลองใหม่อีกครั้ง',
          color: 'text-error',
          bgColor: 'bg-error/20',
          borderColor: 'border-error/30',
        };
      default:
        return {
          icon: '⏳',
          text: 'รอการประมวลผล',
          description: 'กำลังเตรียมการทำนาย',
          color: 'text-base-content/70',
          bgColor: 'bg-base-300',
          borderColor: 'border-base-content/20',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`inline-flex items-center space-x-3 px-6 py-3 rounded-full border ${config.bgColor} ${config.borderColor}`}
    >
      <motion.span
        animate={status === ReadingStatus.PROCESSING ? { rotate: 360 } : {}}
        transition={status === ReadingStatus.PROCESSING ? { duration: 2, repeat: Infinity, ease: "linear" } : {}}
        className="text-2xl"
      >
        {config.icon}
      </motion.span>
      
      <div className="text-left">
        <p className={`font-semibold ${config.color}`}>
          {config.text}
        </p>
        
        {status === ReadingStatus.PROCESSING && estimatedTimeRemaining && estimatedTimeRemaining > 0 && (
          <p className="text-xs text-base-content/60 mt-1">
            เหลืออีก ~{Math.ceil(estimatedTimeRemaining / 60)} นาที
          </p>
        )}
        
        {status === ReadingStatus.PENDING && (
          <p className="text-xs text-base-content/60 mt-1">
            อยู่ในคิวการประมวลผล
          </p>
        )}
      </div>
    </motion.div>
  );
}