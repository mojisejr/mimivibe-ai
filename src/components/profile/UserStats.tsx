"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

interface UserStatsProps {
  stats: {
    level: number;
    currentExp: number;
    nextLevelExp: number;
    expToNextLevel: number;
    totalReadings: number;
    totalCoins: number;
    currentStreak: number;
    daysActive: number;
    totalReviews?: number;
    averageAccuracy?: number;
    prestigeLevel?: number;
    prestigePoints?: number;
  };
}

const StatCard = ({ 
  title, 
  value, 
  icon, 
  color = "primary",
  subtitle,
  trend
}: {
  title: string;
  value: string | number;
  icon: string;
  color?: "primary" | "secondary" | "accent" | "warning" | "success" | "info";
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
}) => {
  const trendIcon = {
    up: "📈",
    down: "📉",
    neutral: "➡️"
  }[trend || "neutral"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="card-body p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl">{icon}</span>
          {trend && (
            <span className="text-sm opacity-60">{trendIcon}</span>
          )}
        </div>
        <div className={`text-2xl font-bold text-${color} mb-1`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <div className="text-sm font-medium text-base-content/80 mb-1">
          {title}
        </div>
        {subtitle && (
          <div className="text-xs text-base-content/60">
            {subtitle}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const LevelProgress = ({ 
  level, 
  currentExp, 
  nextLevelExp, 
  expToNextLevel 
}: {
  level: number;
  currentExp: number;
  nextLevelExp: number;
  expToNextLevel: number;
}) => {
  const progressPercentage = useMemo(() => {
    if (nextLevelExp === 0) return 100;
    return Math.min((currentExp / nextLevelExp) * 100, 100);
  }, [currentExp, nextLevelExp]);

  const levelTitles = [
    "Seeker", "Novice", "Apprentice", "Mystic", "Oracle", 
    "Sage", "Master", "Grandmaster", "Enlightened", "Cosmic"
  ];

  const getLevelTitle = (level: number) => {
    const index = Math.min(Math.floor((level - 1) / 10), levelTitles.length - 1);
    return levelTitles[index];
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="card bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20"
    >
      <div className="card-body p-6">
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-3xl">🌟</span>
            <h3 className="text-2xl font-bold text-primary">Level {level}</h3>
            <span className="text-3xl">🌟</span>
          </div>
          <div className="text-lg font-semibold text-primary/80">
            {getLevelTitle(level)}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Progress to Level {level + 1}</span>
            <span className="text-sm text-base-content/70">
              {currentExp.toLocaleString()} / {nextLevelExp.toLocaleString()} EXP
            </span>
          </div>

          <div className="w-full bg-base-300 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="bg-gradient-to-r from-primary to-secondary h-full rounded-full relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full" />
            </motion.div>
          </div>

          <div className="text-center">
            <span className="text-sm text-base-content/70">
              {expToNextLevel.toLocaleString()} EXP to next level
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const PrestigeDisplay = ({ 
  prestigeLevel, 
  prestigePoints 
}: {
  prestigeLevel: number;
  prestigePoints: number;
}) => {
  if (prestigeLevel === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="card bg-gradient-to-br from-warning/10 to-accent/10 border border-warning/30"
    >
      <div className="card-body p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👑</span>
            <div>
              <div className="font-bold text-warning">Prestige {prestigeLevel}</div>
              <div className="text-xs text-base-content/70">
                {prestigePoints.toLocaleString()} prestige points
              </div>
            </div>
          </div>
          <div className="text-2xl opacity-60">✨</div>
        </div>
      </div>
    </motion.div>
  );
};

export function UserStats({ stats }: UserStatsProps) {
  const achievementProgress = useMemo(() => {
    const achievements = [
      { name: "First Reading", completed: stats.totalReadings >= 1 },
      { name: "Dedicated Seeker", completed: stats.totalReadings >= 10 },
      { name: "Mystic Explorer", completed: stats.totalReadings >= 50 },
      { name: "Master Reader", completed: stats.totalReadings >= 100 },
      { name: "Daily Devotee", completed: stats.currentStreak >= 7 },
      { name: "Coin Collector", completed: stats.totalCoins >= 100 },
    ];
    
    const completed = achievements.filter(a => a.completed).length;
    return { completed, total: achievements.length, achievements };
  }, [stats]);

  return (
    <div className="space-y-6">
      {/* Level Progress */}
      <LevelProgress
        level={stats.level}
        currentExp={stats.currentExp}
        nextLevelExp={stats.nextLevelExp}
        expToNextLevel={stats.expToNextLevel}
      />

      {/* Prestige Display */}
      {stats.prestigeLevel && stats.prestigeLevel > 0 && (
        <PrestigeDisplay
          prestigeLevel={stats.prestigeLevel}
          prestigePoints={stats.prestigePoints || 0}
        />
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Readings"
          value={stats.totalReadings}
          icon="📚"
          color="primary"
          subtitle="Spiritual insights gained"
          trend={stats.totalReadings > 0 ? "up" : "neutral"}
        />
        
        <StatCard
          title="Coins Earned"
          value={stats.totalCoins}
          icon="🪙"
          color="warning"
          subtitle="Rewards collected"
          trend={stats.totalCoins > 0 ? "up" : "neutral"}
        />
        
        <StatCard
          title="Current Streak"
          value={stats.currentStreak}
          icon="🔥"
          color="accent"
          subtitle={stats.currentStreak > 0 ? "Days in a row!" : "Start your journey"}
          trend={stats.currentStreak >= 3 ? "up" : "neutral"}
        />
        
        <StatCard
          title="Days Active"
          value={stats.daysActive}
          icon="📅"
          color="success"
          subtitle="Your spiritual journey"
          trend="up"
        />
        
        {stats.totalReviews !== undefined && (
          <StatCard
            title="Reviews Given"
            value={stats.totalReviews}
            icon="⭐"
            color="secondary"
            subtitle="Feedback shared"
            trend={stats.totalReviews > 0 ? "up" : "neutral"}
          />
        )}
        
        {stats.averageAccuracy !== undefined && stats.averageAccuracy > 0 && (
          <StatCard
            title="Avg Accuracy"
            value={`${Math.round(stats.averageAccuracy)}%`}
            icon="🎯"
            color="info"
            subtitle="Reading satisfaction"
            trend={stats.averageAccuracy >= 70 ? "up" : stats.averageAccuracy >= 50 ? "neutral" : "down"}
          />
        )}
      </div>

      {/* Achievement Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="card bg-base-100 shadow-sm"
      >
        <div className="card-body p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-base-content">Achievements</h4>
            <span className="text-sm text-base-content/70">
              {achievementProgress.completed}/{achievementProgress.total}
            </span>
          </div>
          
          <div className="w-full bg-base-300 rounded-full h-2 mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(achievementProgress.completed / achievementProgress.total) * 100}%` }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="bg-gradient-to-r from-accent to-secondary h-full rounded-full"
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {achievementProgress.achievements.map((achievement, index) => (
              <div
                key={achievement.name}
                className={`text-xs p-2 rounded ${
                  achievement.completed 
                    ? 'bg-success/20 text-success-content' 
                    : 'bg-base-200 text-base-content/60'
                }`}
              >
                <span className="mr-1">
                  {achievement.completed ? '✅' : '⭕'}
                </span>
                {achievement.name}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}