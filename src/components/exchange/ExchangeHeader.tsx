"use client";

import { motion } from "framer-motion";
import { useProfile } from "@/hooks/useProfile";

export function ExchangeHeader() {
  const { data: profileData, loading } = useProfile();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <motion.div
      {...fadeIn}
      className="text-center space-y-4"
    >
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-base-content">
          แลกเปลี่ยนเหรียญ 🪙
        </h1>
        <p className="text-base-content/70 text-lg">
          แลกเปลี่ยนเหรียญของคุณเป็นดาวและเครดิต
        </p>
      </div>

      {/* Current Balance Display */}
      <div className="bg-gradient-to-r from-secondary/10 to-primary/10 rounded-2xl p-6 border border-secondary/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-md mx-auto">
          {/* Coins */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-secondary/20 rounded-full flex items-center justify-center">
              <span className="text-3xl">🪙</span>
            </div>
            <div className="text-2xl font-bold text-secondary mb-2">
              {loading ? (
                <div className="skeleton h-6 w-20 mx-auto rounded"></div>
              ) : (
                `${(profileData?.stats.coins || 0).toLocaleString()}`
              )}
            </div>
            <div className="text-sm text-base-content/70 font-medium">COIN</div>
          </div>

          {/* Stars */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-accent/20 rounded-full flex items-center justify-center">
              <span className="text-3xl">⭐</span>
            </div>
            <div className="text-2xl font-bold text-accent mb-2">
              {loading ? (
                <div className="skeleton h-6 w-20 mx-auto rounded"></div>
              ) : (
                `${(profileData?.credits.stars || 0).toLocaleString()}`
              )}
            </div>
            <div className="text-sm text-base-content/70 font-medium">STAR</div>
          </div>

        </div>

        {/* Exchange Info */}
        <div className="mt-6 p-4 bg-info/10 rounded-xl border border-info/20">
          <div className="flex items-center justify-center space-x-2 text-info">
            <span className="text-lg">💡</span>
            <span className="text-sm font-medium">
              แลกเปลี่ยนเหรียญที่ได้จากการเข้าสู่ระบบและกิจกรรมต่างๆ
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}