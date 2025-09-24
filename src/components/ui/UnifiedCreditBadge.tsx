"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CreditInfoModal } from "./CreditInfoModal";
import { CoinInfoModal } from "./CoinInfoModal";

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
  const [modalOpen, setModalOpen] = useState(false);
  const [coinModalOpen, setCoinModalOpen] = useState(false);

  const displayText = freePoints > 0 ? `⭐${stars}(+${freePoints})` : `⭐${stars}`;

  const handleClick = () => {
    if (showTooltip) {
      setModalOpen(true);
    }
  };

  const handleCoinClick = () => {
    setCoinModalOpen(true);
  };

  const renderNavbarVariant = () => (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={handleClick}
        className="badge badge-warning gap-1 hover:badge-warning/80 transition-colors cursor-pointer"
      >
        <span>{displayText}</span>
      </button>
      {coins !== undefined && (
        <button
          onClick={handleCoinClick}
          className="badge badge-accent gap-1 hover:badge-accent/80 transition-colors cursor-pointer"
        >
          <span>🪙</span>
          <span className="text-sm font-medium">{coins}</span>
        </button>
      )}
    </div>
  );

  const renderHeroVariant = () => (
    <div className={`flex items-center justify-center space-x-3 ${className}`}>
      <motion.button
        onClick={handleClick}
        className="flex items-center space-x-2 bg-base-100/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-xl border border-primary/20 hover:shadow-2xl transition-all duration-300 cursor-pointer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="text-warning text-xl font-semibold">{displayText}</span>
      </motion.button>
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
      <button
        onClick={handleClick}
        className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer"
      >
        {displayText}
      </button>
    </div>
  );

  return (
    <>
      {(() => {
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
      })()}

      <CreditInfoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        stars={stars}
        freePoints={freePoints}
      />

      {coins !== undefined && (
        <CoinInfoModal
          isOpen={coinModalOpen}
          onClose={() => setCoinModalOpen(false)}
          coins={coins}
        />
      )}
    </>
  );
}