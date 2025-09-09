"use client";

import { motion } from "framer-motion";

interface SkeletonLoaderProps {
  type: "profile" | "history" | "stats";
  animate?: boolean;
}

export function SkeletonLoader({ type, animate = true }: SkeletonLoaderProps) {
  switch (type) {
    case "profile":
      return <SkeletonProfile animate={animate} />;
    case "history":
      return <SkeletonGrid count={6} columns={2} animate={animate} />;
    case "stats":
      return <SkeletonStats animate={animate} />;

    default:
      return <SkeletonProfile animate={animate} />;
  }
}

interface SkeletonProps {
  className?: string;
  animate?: boolean;
}

export function Skeleton({ className = "", animate = true }: SkeletonProps) {
  const baseClasses = "bg-base-300 rounded";
  const animationClasses = animate ? "animate-pulse" : "";

  return <div className={`${baseClasses} ${animationClasses} ${className}`} />;
}

export function SkeletonText({
  lines = 1,
  className = "",
  animate = true,
}: {
  lines?: number;
  className?: string;
  animate?: boolean;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={`h-4 ${
            index === lines - 1 && lines > 1 ? "w-3/4" : "w-full"
          }`}
          animate={animate}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ animate = true }: { animate?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="card bg-base-100 shadow-sm"
    >
      <div className="card-body p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" animate={animate} />
          <Skeleton className="h-4 w-16" animate={animate} />
        </div>

        {/* Content */}
        <div className="space-y-3">
          <SkeletonText lines={2} animate={animate} />

          {/* Cards grid */}
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton
                key={index}
                className="aspect-[2/3] w-full"
                animate={animate}
              />
            ))}
          </div>

          <SkeletonText lines={1} animate={animate} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-12" animate={animate} />
            <Skeleton className="h-4 w-12" animate={animate} />
          </div>
          <Skeleton className="h-8 w-20" animate={animate} />
        </div>
      </div>
    </motion.div>
  );
}

export function SkeletonGrid({
  count = 6,
  columns = 3,
  animate = true,
}: {
  count?: number;
  columns?: number;
  animate?: boolean;
}) {
  const gridClasses =
    {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4",
    }[columns] || "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`grid ${gridClasses} gap-4 md:gap-6`}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} animate={animate} />
      ))}
    </div>
  );
}

export function SkeletonStats({ animate = true }: { animate?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Level Progress */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body p-6">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Skeleton className="h-8 w-8 rounded-full" animate={animate} />
              <Skeleton className="h-8 w-24" animate={animate} />
              <Skeleton className="h-8 w-8 rounded-full" animate={animate} />
            </div>
            <Skeleton className="h-6 w-32 mx-auto" animate={animate} />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" animate={animate} />
              <Skeleton className="h-4 w-20" animate={animate} />
            </div>
            <Skeleton className="h-3 w-full rounded-full" animate={animate} />
            <div className="text-center">
              <Skeleton className="h-3 w-28 mx-auto" animate={animate} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="card bg-base-100 shadow-sm">
            <div className="card-body p-4">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-6 w-6" animate={animate} />
                <Skeleton className="h-3 w-3" animate={animate} />
              </div>
              <Skeleton className="h-8 w-16 mb-1" animate={animate} />
              <Skeleton className="h-4 w-20 mb-1" animate={animate} />
              <Skeleton className="h-3 w-16" animate={animate} />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function SkeletonProfile({ animate = true }: { animate?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* User Info Card */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-36" animate={animate} />
            <Skeleton className="h-8 w-8 rounded-full" animate={animate} />
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton className="w-16 h-16 rounded-full" animate={animate} />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" animate={animate} />
              <Skeleton className="h-4 w-48" animate={animate} />
              <Skeleton className="h-3 w-28" animate={animate} />
            </div>
          </div>
        </div>
      </div>

      {/* Credits Card */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-28" animate={animate} />
            <Skeleton className="h-6 w-16 rounded-full" animate={animate} />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="text-center space-y-2">
                <Skeleton className="h-8 w-12 mx-auto" animate={animate} />
                <Skeleton className="h-4 w-20 mx-auto" animate={animate} />
              </div>
            ))}
          </div>
          <div className="space-y-2 mb-4">
            <Skeleton className="h-3 w-32" animate={animate} />
            <Skeleton className="h-3 w-40" animate={animate} />
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-10 w-32 rounded-lg" animate={animate} />
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <SkeletonStats animate={animate} />

      {/* Preferences Card */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body p-6">
          <Skeleton className="h-6 w-24 mb-4" animate={animate} />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between">
                <Skeleton className="h-5 w-40" animate={animate} />
                <Skeleton className="h-6 w-12 rounded-full" animate={animate} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function SkeletonSearchFilters({
  animate = true,
}: {
  animate?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card bg-base-100 shadow-sm mb-6"
    >
      <div className="card-body p-4 space-y-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <Skeleton className="flex-1 h-12 rounded-lg" animate={animate} />
          <Skeleton className="h-12 w-24 rounded-lg" animate={animate} />
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" animate={animate} />
          <Skeleton className="h-4 w-20" animate={animate} />
        </div>
      </div>
    </motion.div>
  );
}
