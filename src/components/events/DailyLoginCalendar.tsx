"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/ToastContainer";

interface DayReward {
  day: number;
  exp: number;
  coins: number;
  description: string;
}

interface CampaignProgress {
  current: number;
  total: number;
  claimed: boolean[];
}

interface DailyLoginCampaignProps {
  campaign: {
    id: string;
    title: string;
    type: "DAILY_LOGIN";
    startDate: string;
    endDate: string;
    progress: CampaignProgress;
    rewards: DayReward[];
  };
  onClaimReward: (day: number) => Promise<any>;
  onRefresh: () => Promise<void>;
}

export function DailyLoginCalendar({ 
  campaign, 
  onClaimReward,
  onRefresh 
}: DailyLoginCampaignProps) {
  const [claimingDay, setClaimingDay] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const { addToast } = useToast();

  const today = new Date().getDate();
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const handleClaimReward = async (day: number) => {
    try {
      setClaimingDay(day);
      const result = await onClaimReward(day);
      
      if (result.success) {
        addToast({
          type: "success",
          message: `วันที่ ${day}: รับรางวัลสำเร็จ! 🎉 🎁`,
          duration: 3000,
        });
        await onRefresh();
      }
    } catch (error) {
      console.error("Claim error:", error);
      addToast({
        type: "error",
        message: "ไม่สามารถรับรางวัลได้ กรุณาลองใหม่ ❌",
        duration: 3000,
      });
    } finally {
      setClaimingDay(null);
    }
  };

  const getDayStatus = (day: number): "claimed" | "available" | "locked" | "future" => {
    if (campaign.progress.claimed[day - 1]) return "claimed";
    if (day === today) return "available";
    if (day < today) return "locked";
    return "future";
  };

  const getDayReward = (day: number): DayReward | undefined => {
    return campaign.rewards.find(reward => reward.day === day);
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case "claimed": return "✅";
      case "available": return "🎁";
      case "locked": return "🔒";
      case "future": return "📅";
      default: return "📅";
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "claimed": return "bg-success/20 border-success/50 text-success";
      case "available": return "bg-primary/20 border-primary/50 text-primary hover:bg-primary/30";
      case "locked": return "bg-base-200 border-base-300 text-base-content/40";
      case "future": return "bg-base-100 border-base-300 text-base-content/60";
      default: return "bg-base-100 border-base-300 text-base-content/60";
    }
  };

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    }
  };

  const selectedReward = selectedDay ? getDayReward(selectedDay) : null;

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Calendar Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-4 md:p-6 border border-primary/20">
        <div className="text-center space-y-2 md:space-y-3">
          <h2 className="text-xl md:text-2xl font-bold text-base-content">
            📅 {campaign.title}
          </h2>
          <p className="text-sm md:text-base text-base-content/70">
            เข้าสู่ระบบทุกวันเพื่อรับรางวัลพิเศษ
          </p>
          
          {/* Mobile-optimized progress indicators */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 mt-3 md:mt-4">
            <div className="px-3 py-1.5 md:px-4 md:py-2 bg-primary/10 rounded-full border border-primary/20">
              <span className="text-xs md:text-sm text-primary font-medium">
                รับแล้ว: {campaign.progress.current}/{campaign.progress.total} วัน
              </span>
            </div>
            <div className="px-3 py-1.5 md:px-4 md:py-2 bg-secondary/10 rounded-full border border-secondary/20">
              <span className="text-xs md:text-sm text-secondary font-medium">
                วันนี้: {today}/{campaign.progress.total}
              </span>
            </div>
          </div>
          
          {/* Progress bar for mobile */}
          <div className="md:hidden w-full max-w-xs mx-auto mt-3">
            <div className="flex justify-between text-xs text-base-content/60 mb-1">
              <span>ความคืบหน้า</span>
              <span>{Math.round((campaign.progress.current / campaign.progress.total) * 100)}%</span>
            </div>
            <div className="w-full bg-base-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
                style={{ width: `${(campaign.progress.current / campaign.progress.total) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-base-100 rounded-2xl p-3 md:p-6 border border-base-300 shadow-sm">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 md:gap-3 mb-3 md:mb-4">
          {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((day, index) => (
            <div key={index} className="text-center text-xs md:text-sm font-medium text-base-content/70 py-1 md:py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days grid */}
        <div className="grid grid-cols-7 gap-1 md:gap-3">
          {Array.from({ length: campaign.progress.total }, (_, index) => {
            const day = index + 1;
            const status = getDayStatus(day);
            const reward = getDayReward(day);
            const isToday = day === today;
            
            return (
              <motion.div
                key={day}
                variants={itemVariants}
                className={`
                  relative rounded-lg md:rounded-xl border-2 transition-all duration-300 cursor-pointer
                  min-h-[44px] md:min-h-[60px] aspect-square
                  ${getStatusColor(status)}
                  ${isToday ? "ring-2 ring-primary ring-opacity-50" : ""}
                  ${status === "available" ? "hover:scale-105 hover:shadow-lg" : ""}
                `}
                onClick={() => {
                  if (status === "available" && !claimingDay) {
                    handleClaimReward(day);
                  } else {
                    setSelectedDay(day);
                  }
                }}
                whileHover={status === "available" ? { scale: 1.05 } : undefined}
                whileTap={status === "available" ? { scale: 0.95 } : undefined}
              >
                {/* Mobile Layout (< md screens) */}
                <div className="md:hidden absolute inset-0 flex flex-col items-center justify-center p-1">
                  <div className="text-xs font-bold leading-tight">{day}</div>
                  <div className="text-sm leading-none mt-0.5">{getStatusIcon(status)}</div>
                  
                  {/* Loading spinner for claiming */}
                  {claimingDay === day && (
                    <div className="absolute inset-0 bg-primary/20 rounded-lg flex items-center justify-center">
                      <div className="loading loading-spinner loading-xs text-primary"></div>
                    </div>
                  )}
                  
                  {/* Compact reward indicator for mobile */}
                  {reward && status !== "claimed" && (
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-secondary rounded-full"></div>
                  )}
                </div>

                {/* Desktop Layout (md+ screens) */}
                <div className="hidden md:flex absolute inset-0 flex-col items-center justify-center p-1">
                  <div className="text-lg font-bold">{day}</div>
                  <div className="text-xl">{getStatusIcon(status)}</div>
                  
                  {/* Loading spinner for claiming */}
                  {claimingDay === day && (
                    <div className="absolute inset-0 bg-primary/20 rounded-xl flex items-center justify-center">
                      <div className="loading loading-spinner loading-sm text-primary"></div>
                    </div>
                  )}
                  
                  {/* Reward indicator for desktop */}
                  {reward && status !== "claimed" && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-secondary rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">!</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Reward Details Modal */}
      <AnimatePresence>
        {selectedDay && selectedReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 md:p-4"
            onClick={() => setSelectedDay(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-base-100 rounded-2xl p-4 md:p-6 max-w-sm w-full border border-base-300 shadow-xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center space-y-3 md:space-y-4">
                {/* Close button for mobile */}
                <div className="md:hidden flex justify-end">
                  <button 
                    className="btn btn-ghost btn-sm btn-circle"
                    onClick={() => setSelectedDay(null)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="text-3xl md:text-4xl">{getStatusIcon(getDayStatus(selectedDay))}</div>
                <h3 className="text-lg md:text-xl font-bold text-base-content">
                  วันที่ {selectedDay}
                </h3>
                <p className="text-sm md:text-base text-base-content/70">{selectedReward.description}</p>
                
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-3 md:p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm md:text-base text-base-content/70">EXP:</span>
                    <span className="text-sm md:text-base font-bold text-primary">+{selectedReward.exp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm md:text-base text-base-content/70">Coins:</span>
                    <span className="text-sm md:text-base font-bold text-secondary">+{selectedReward.coins}</span>
                  </div>
                </div>

                {/* Mobile-first button layout */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                  <button 
                    className="btn btn-ghost flex-1 order-2 sm:order-1"
                    onClick={() => setSelectedDay(null)}
                  >
                    ปิด
                  </button>
                  {getDayStatus(selectedDay) === "available" && (
                    <button 
                      className="btn btn-primary flex-1 order-1 sm:order-2"
                      onClick={() => {
                        setSelectedDay(null);
                        handleClaimReward(selectedDay);
                      }}
                      disabled={claimingDay !== null}
                    >
                      {claimingDay === selectedDay ? (
                        <span className="loading loading-spinner loading-sm"></span>
                      ) : (
                        "รับรางวัล"
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}