"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/ToastContainer";

interface Achievement {
  id: string;
  name: string;
  icon: string;
  title: string;
  description: string;
  progress: {
    current: number;
    required: number;
    completed: boolean;
  };
  rewards: {
    exp?: number;
    coins?: number;
    stars?: number;
  };
}

export function AchievementBadges() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/achievements/progress");
      if (!response.ok) {
        throw new Error(`Failed to fetch achievements: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setAchievements(result.data.achievements);
      } else {
        throw new Error(result.error || "Failed to load achievements");
      }
    } catch (error) {
      console.error("Achievements fetch error:", error);
      setError(error instanceof Error ? error.message : "Failed to load achievements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const getProgressPercentage = (achievement: Achievement): number => {
    return Math.min((achievement.progress.current / achievement.progress.required) * 100, 100);
  };

  const handleClaimAchievement = async (achievementId: string) => {
    try {
      const response = await fetch("/api/achievements/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ achievementId }),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.error || "Failed to claim achievement");
      }

      const result = await response.json();
      if (result.success) {
        const { achievementTitle, rewards } = result.data;
        
        // Show success message with rewards
        const rewardText = [];
        if (rewards.exp) rewardText.push(`+${rewards.exp} EXP`);
        if (rewards.coins) rewardText.push(`+${rewards.coins} 🪙`);
        if (rewards.stars) rewardText.push(`+${rewards.stars} ⭐`);
        
        addToast({
          type: "success",
          message: `${achievementTitle} สำเร็จ! ${rewardText.join(', ')} 🎉 🏆`,
          duration: 4000,
        });

        // Refresh achievements to update state
        await fetchAchievements();
      } else {
        throw new Error(result.error || "Failed to claim achievement");
      }
    } catch (error) {
      console.error("Claim achievement error:", error);
      addToast({
        type: "error",
        message: error instanceof Error ? error.message : "ไม่สามารถรับรางวัลได้ ❌",
        duration: 3000,
      });
    }
  };

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
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

  if (loading) {
    return (
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-base-content mb-2">
            🏆 ความสำเร็จ
          </h2>
          <p className="text-base-content/70">
            ปลดล็อกความสำเร็จและรับรางวัลพิเศษ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="bg-base-100 rounded-xl p-4 border border-base-300">
              <div className="flex items-center space-x-4">
                <div className="skeleton w-12 h-12 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-3/4"></div>
                  <div className="skeleton h-3 w-1/2"></div>
                  <div className="skeleton h-2 w-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="text-center space-y-4"
      >
        <h2 className="text-2xl font-bold text-base-content">
          🏆 ความสำเร็จ
        </h2>
        <div className="alert alert-error max-w-md mx-auto">
          <span>{error}</span>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => fetchAchievements()}
        >
          ลองใหม่
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-base-content mb-2">
          🏆 ความสำเร็จ
        </h2>
        <p className="text-base-content/70">
          ปลดล็อกความสำเร็จและรับรางวัลพิเศษ
        </p>
      </div>

      {/* Achievement Stats */}
      <div className="bg-gradient-to-r from-accent/10 to-info/10 rounded-2xl p-6 border border-accent/20">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-accent">
              {achievements.filter(a => a.progress.completed).length}
            </div>
            <div className="text-sm text-base-content/70">สำเร็จแล้ว</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-info">
              {achievements.filter(a => !a.progress.completed && a.progress.current > 0).length}
            </div>
            <div className="text-sm text-base-content/70">กำลังทำ</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-warning">
              {achievements.length}
            </div>
            <div className="text-sm text-base-content/70">ทั้งหมด</div>
          </div>
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((achievement) => {
          const progressPercentage = getProgressPercentage(achievement);
          const isCompleted = achievement.progress.completed;
          const hasProgress = achievement.progress.current > 0;

          return (
            <motion.div
              key={achievement.id}
              variants={itemVariants}
              className={`
                bg-base-100 rounded-xl p-4 border transition-all duration-300
                ${isCompleted 
                  ? "border-success/50 bg-success/5" 
                  : hasProgress 
                    ? "border-primary/50 bg-primary/5" 
                    : "border-base-300"
                }
                ${isCompleted ? "hover:shadow-lg" : ""}
              `}
            >
              <div className="flex items-start space-x-4">
                {/* Achievement Icon */}
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2
                  ${isCompleted 
                    ? "bg-success/20 border-success/50" 
                    : hasProgress 
                      ? "bg-primary/20 border-primary/50" 
                      : "bg-base-200 border-base-300"
                  }
                `}>
                  {achievement.icon}
                </div>

                {/* Achievement Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className={`font-bold text-sm ${isCompleted ? "text-success" : "text-base-content"}`}>
                        {achievement.title}
                      </h3>
                      <p className="text-xs text-base-content/70 mt-1">
                        {achievement.description}
                      </p>
                    </div>
                    
                    {isCompleted && (
                      <div className="text-success text-lg">✅</div>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-base-content/70">
                        {achievement.progress.current} / {achievement.progress.required}
                      </span>
                      <span className={`font-medium ${isCompleted ? "text-success" : "text-primary"}`}>
                        {Math.round(progressPercentage)}%
                      </span>
                    </div>
                    
                    <div className="w-full bg-base-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isCompleted 
                            ? "bg-gradient-to-r from-success to-success" 
                            : "bg-gradient-to-r from-primary to-secondary"
                        }`}
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Rewards */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-2 text-xs">
                      {achievement.rewards.exp && (
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded-full">
                          +{achievement.rewards.exp} EXP
                        </span>
                      )}
                      {achievement.rewards.coins && (
                        <span className="px-2 py-1 bg-secondary/10 text-secondary rounded-full">
                          +{achievement.rewards.coins} 🪙
                        </span>
                      )}
                      {achievement.rewards.stars && (
                        <span className="px-2 py-1 bg-accent/10 text-accent rounded-full">
                          +{achievement.rewards.stars} ⭐
                        </span>
                      )}
                    </div>

                    {isCompleted && (
                      <button
                        className="btn btn-success btn-xs"
                        onClick={() => handleClaimAchievement(achievement.id)}
                      >
                        รับรางวัล
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}