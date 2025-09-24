"use client";

import { useProfile } from "@/hooks/useProfile";
import { motion } from "framer-motion";
import { UnifiedCreditBadge } from "./UnifiedCreditBadge";

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
    const skeletonWidthUnified = isNavbar ? "w-24" : "w-32";
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className={`skeleton ${skeletonHeight} ${skeletonWidthUnified} rounded-full`}></div>
        {!isNavbar && (
          <div className={`skeleton ${skeletonHeight} w-20 rounded-full`}></div>
        )}
      </div>
    );
  }

  if (!profileData?.credits) {
    return null;
  }

  return (
    <UnifiedCreditBadge
      stars={profileData.credits.stars}
      freePoints={profileData.credits.freePoint}
      variant={variant}
      showTooltip={true}
      coins={profileData.stats?.coins}
      className={className}
    />
  );
}