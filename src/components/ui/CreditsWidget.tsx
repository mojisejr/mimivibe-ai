"use client";

import { useProfile } from "@/hooks/useProfile";
import { motion } from "framer-motion";

interface CreditsWidgetProps {
  className?: string;
  variant?: "navbar" | "hero";
  showSkeleton?: boolean;
}

export function CreditsWidget({ 
  className = "", 
  variant = "hero",
  showSkeleton = true 
}: CreditsWidgetProps) {
  const { data: profileData, loading } = useProfile();

  const isNavbar = variant === "navbar";
  const skeletonHeight = isNavbar ? "h-6" : "h-12";
  const skeletonWidth = isNavbar ? "w-16" : "w-20";

  if (loading && showSkeleton) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className={`skeleton ${skeletonHeight} ${skeletonWidth} rounded-full`}></div>
        <div className={`skeleton ${skeletonHeight} ${skeletonWidth} rounded-full`}></div>
      </div>
    );
  }

  if (!profileData?.credits) {
    return null;
  }

  if (isNavbar) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="badge badge-warning gap-1">
          <span>⭐</span>
          <span className="text-sm font-medium">
            {profileData.credits.stars}
          </span>
        </div>
        <div className="badge badge-secondary gap-1">
          <span>🎁</span>
          <span className="text-sm font-medium">
            {profileData.credits.freePoint}
          </span>
        </div>
      </div>
    );
  }

  // Hero variant
  return (
    <div className={`flex items-center justify-center space-x-4 ${className}`}>
      <motion.div 
        className="flex items-center space-x-2 bg-base-100/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-xl border border-primary/20 hover:shadow-2xl transition-all duration-300"
        whileHover={{ scale: 1.02 }}
      >
        <span className="text-warning text-xl">⭐</span>
        <span className="font-semibold text-base-content">
          {profileData.credits.stars}
        </span>
      </motion.div>
      <motion.div 
        className="flex items-center space-x-2 bg-base-100/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-xl border border-secondary/20 hover:shadow-2xl transition-all duration-300"
        whileHover={{ scale: 1.02 }}
      >
        <span className="text-secondary text-xl">🎁</span>
        <span className="font-semibold text-base-content">
          {profileData.credits.freePoint}
        </span>
      </motion.div>
    </div>
  );
}