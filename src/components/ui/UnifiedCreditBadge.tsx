"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface UnifiedCreditBadgeProps {
  stars: number;
  freePoints: number;
  variant: "navbar" | "hero" | "profile";
  showTooltip?: boolean;
  className?: string;
  coins?: number;
}

export function UnifiedCreditBadge({
  stars,
  freePoints,
  variant = "hero",
  showTooltip = true,
  className = "",
  coins,
}: UnifiedCreditBadgeProps) {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const displayText = freePoints > 0 ? `⭐${stars}(+${freePoints})` : `⭐${stars}`;

  const handleClick = () => {
    if (showTooltip) {
      setTooltipVisible(true);
      setTimeout(() => setTooltipVisible(false), 5000);
    }
  };

  const renderNavbarVariant = () => (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="relative">
        <button
          onClick={handleClick}
          className="badge badge-warning gap-1 hover:badge-warning/80 transition-colors cursor-pointer"
        >
          <span>{displayText}</span>
        </button>
        <AnimatePresence>
          {tooltipVisible && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full mt-2 right-0 z-50 w-64 max-w-[90vw] p-3 bg-base-100 border border-base-300 rounded-lg shadow-xl text-xs"
            >
              <div className="text-base-content text-center">
                ⭐ คือเหรียญที่เติมด้วยการซื้อ package และ (+{freePoints}) คือแต้มฟรีที่คุณได้รับจากกิจกรรมต่างๆ
              </div>
              <div className="absolute bottom-full right-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-base-100"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {coins !== undefined && (
        <div className="badge badge-accent gap-1">
          <span>🪙</span>
          <span className="text-sm font-medium">{coins}</span>
        </div>
      )}
    </div>
  );

  const renderHeroVariant = () => (
    <div className={`flex items-center justify-center space-x-3 ${className}`}>
      <div className="relative">
        <motion.button
          onClick={handleClick}
          className="flex items-center space-x-2 bg-base-100/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-xl border border-primary/20 hover:shadow-2xl transition-all duration-300 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="text-warning text-xl font-semibold">{displayText}</span>
        </motion.button>
        <AnimatePresence>
          {tooltipVisible && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full mt-4 left-1/2 transform -translate-x-1/2 z-50 w-80 max-w-[90vw] p-4 bg-base-100/95 backdrop-blur-sm border border-primary/20 rounded-xl shadow-2xl text-sm"
            >
              <div className="text-base-content font-medium text-center">
                ⭐ คือเหรียญที่เติมด้วยการซื้อ package และ (+{freePoints}) คือแต้มฟรีที่คุณได้รับจากกิจกรรมต่างๆ
              </div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-b-6 border-transparent border-b-base-100/95"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {coins !== undefined && (
        <motion.div
          className="flex items-center space-x-2 bg-base-100/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-xl border border-accent/20 hover:shadow-2xl transition-all duration-300"
          whileHover={{ scale: 1.02 }}
        >
          <span className="text-accent text-xl">🪙</span>
          <span className="font-semibold text-base-content">{coins}</span>
        </motion.div>
      )}
    </div>
  );

  const renderProfileVariant = () => (
    <div className={`text-center ${className}`}>
      <div className="relative inline-block">
        <button
          onClick={handleClick}
          className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer"
        >
          {displayText}
        </button>
        <AnimatePresence>
          {tooltipVisible && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 z-50 w-72 max-w-[90vw] p-3 bg-base-100 border border-base-300 rounded-lg shadow-xl text-xs"
            >
              <div className="text-base-content text-center">
                ⭐ คือเหรียญที่เติมด้วยการซื้อ package และ (+{freePoints}) คือแต้มฟรีที่คุณได้รับจากกิจกรรมต่างๆ
              </div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-base-100"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  switch (variant) {
    case "navbar":
      return renderNavbarVariant();
    case "hero":
      return renderHeroVariant();
    case "profile":
      return renderProfileVariant();
    default:
      return renderHeroVariant();
  }
}