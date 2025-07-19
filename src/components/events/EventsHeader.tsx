"use client";

import { motion } from "framer-motion";
import { useProfile } from "@/hooks/useProfile";

export function EventsHeader() {
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
          กิจกรรมพิเศษ 🎉
        </h1>
        <p className="text-base-content/70 text-lg">
          เข้าร่วมกิจกรรมประจำวันและรับรางวัลสุดพิเศษ
        </p>
      </div>

      {/* User Status Display */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6 border border-primary/20">
        <div className="flex items-center justify-center space-x-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {loading ? (
                <div className="skeleton h-8 w-12 rounded"></div>
              ) : (
                `${profileData?.stats.level || 1}`
              )}
            </div>
            <div className="text-sm text-base-content/70">Level</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary">
              {loading ? (
                <div className="skeleton h-8 w-16 rounded"></div>
              ) : (
                `${profileData?.stats.currentStreak || 0}`
              )}
            </div>
            <div className="text-sm text-base-content/70">Streak</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">
              {loading ? (
                <div className="skeleton h-8 w-20 rounded"></div>
              ) : (
                `${profileData?.stats.totalCoins || 0}`
              )}
            </div>
            <div className="text-sm text-base-content/70">Coins</div>
          </div>
        </div>

        {/* Progress Bar */}
        {!loading && profileData && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm text-base-content/70">
              <span>Level {profileData.stats.level}</span>
              <span>
                {profileData.stats.currentExp} / {profileData.stats.nextLevelExp} EXP
              </span>
            </div>
            <div className="w-full bg-base-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    (profileData.stats.currentExp / profileData.stats.nextLevelExp) * 100,
                    100
                  )}%`,
                }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}