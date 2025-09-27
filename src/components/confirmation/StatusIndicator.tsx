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
      <div className="flex items-center justify-center space-x-2 text-gray-300">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
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
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-400/20',
          borderColor: 'border-yellow-400/30'
        };
      case ReadingStatus.PROCESSING:
        return {
          icon: '🔮',
          text: 'กำลังทำนาย',
          color: 'text-purple-400',
          bgColor: 'bg-purple-400/20',
          borderColor: 'border-purple-400/30'
        };
      case ReadingStatus.COMPLETED:
        return {
          icon: '✨',
          text: 'ทำนายเสร็จสิ้น',
          color: 'text-green-400',
          bgColor: 'bg-green-400/20',
          borderColor: 'border-green-400/30'
        };
      case ReadingStatus.FAILED:
        return {
          icon: '❌',
          text: 'เกิดข้อผิดพลาด',
          color: 'text-red-400',
          bgColor: 'bg-red-400/20',
          borderColor: 'border-red-400/30'
        };
      default:
        return {
          icon: '❓',
          text: 'ไม่ทราบสถานะ',
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/20',
          borderColor: 'border-gray-400/30'
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
          <p className="text-xs text-gray-400 mt-1">
            เหลืออีก ~{Math.ceil(estimatedTimeRemaining / 60)} นาที
          </p>
        )}
        
        {status === ReadingStatus.PENDING && (
          <p className="text-xs text-gray-400 mt-1">
            อยู่ในคิวการประมวลผล
          </p>
        )}
      </div>
    </motion.div>
  );
}