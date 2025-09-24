"use client";

import { motion, AnimatePresence } from "framer-motion";

interface CreditInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  stars: number;
  freePoints: number;
}

export function CreditInfoModal({
  isOpen,
  onClose,
  stars,
  freePoints,
}: CreditInfoModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 flex items-center justify-center p-4"
        onClick={handleBackdropClick}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-base-100/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-primary/20 p-6 max-w-sm w-full mx-4 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 btn btn-ghost btn-circle btn-sm hover:bg-base-200"
            aria-label="ปิด"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Header */}
          <div className="text-center mb-4">
            <div className="text-2xl mb-2">💡</div>
            <h3 className="text-lg font-bold text-base-content mb-2">
              เครดิตของคุณ
            </h3>
          </div>

          {/* Credit display */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-4 py-2 mb-4">
              <span className="text-2xl font-bold text-primary">
                ⭐{stars}{freePoints > 0 ? `(+${freePoints})` : ''}
              </span>
            </div>
          </div>

          {/* Explanation */}
          <div className="space-y-3 text-sm text-base-content/80">
            <div className="flex items-start space-x-3">
              <span className="text-warning text-lg flex-shrink-0">⭐</span>
              <div>
                <div className="font-medium text-base-content">เหรียญดาว ({stars})</div>
                <div>เครดิตที่เติมด้วยการซื้อ package</div>
              </div>
            </div>

            {freePoints > 0 && (
              <div className="flex items-start space-x-3">
                <span className="text-secondary text-lg flex-shrink-0">(+{freePoints})</span>
                <div>
                  <div className="font-medium text-base-content">แต้มฟรี</div>
                  <div>ที่คุณได้รับจากกิจกรรมต่างๆ</div>
                </div>
              </div>
            )}
          </div>

          {/* Action button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={onClose}
              className="btn btn-primary btn-sm px-6"
            >
              เข้าใจแล้ว
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}