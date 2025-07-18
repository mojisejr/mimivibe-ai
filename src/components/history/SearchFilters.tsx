"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface FilterOptions {
  search: string;
  dateRange: "all" | "today" | "week" | "month" | "year" | "custom";
  customStartDate?: string;
  customEndDate?: string;
  sortBy: "newest" | "oldest" | "rating" | "reviewed" | "unreviewed";
  hasReview: "all" | "reviewed" | "unreviewed";
  cardCount: "all" | "3" | "5";
}

interface SearchFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
  initialFilters?: Partial<FilterOptions>;
  totalResults?: number;
  isLoading?: boolean;
}

const defaultFilters: FilterOptions = {
  search: "",
  dateRange: "all",
  sortBy: "newest",
  hasReview: "all",
  cardCount: "all",
};

export function SearchFilters({
  onFiltersChange,
  initialFilters = {},
  totalResults,
  isLoading = false,
}: SearchFiltersProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    ...defaultFilters,
    ...initialFilters,
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCustomDate, setShowCustomDate] = useState(false);

  // Debounced search to avoid too many API calls
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const debouncedSearch = useCallback((searchValue: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      const newFilters = { ...filters, search: searchValue };
      setFilters(newFilters);
      onFiltersChange(newFilters);
    }, 300);
  }, [filters, onFiltersChange]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    debouncedSearch(value);
  };

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    
    // Handle date range logic
    if (key === "dateRange") {
      if (value === "custom") {
        setShowCustomDate(true);
      } else {
        setShowCustomDate(false);
        newFilters.customStartDate = undefined;
        newFilters.customEndDate = undefined;
      }
    }
    
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = { ...defaultFilters };
    setFilters(clearedFilters);
    setShowCustomDate(false);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).some(key => {
      const filterKey = key as keyof FilterOptions;
      if (filterKey === 'search') return filters[filterKey] !== '';
      if (filterKey === 'customStartDate' || filterKey === 'customEndDate') return false;
      return filters[filterKey] !== defaultFilters[filterKey];
    });
  }, [filters]);

  const cardCountOptions = [
    { value: "all", label: "ทุกจำนวน" },
    { value: "3", label: "3 ใบ" },
    { value: "5", label: "5 ใบ" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card bg-base-100 shadow-sm mb-6"
    >
      <div className="card-body p-4 space-y-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-base-content/50">🔍</span>
            </div>
            <input
              type="text"
              placeholder="Search by question, card names, or reading content..."
              className="input input-bordered w-full pl-10 pr-4"
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              disabled={isLoading}
            />
            {filters.search && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-base-content/50 hover:text-base-content"
              >
                ✕
              </button>
            )}
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`btn btn-outline ${hasActiveFilters ? 'btn-primary' : ''} relative`}
          >
            <span className="mr-1">🎛️</span>
            Filters
            {hasActiveFilters && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></div>
            )}
          </button>
        </div>

        {/* Results Summary */}
        {totalResults !== undefined && (
          <div className="flex items-center justify-between text-sm text-base-content/70">
            <span>
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-xs mr-1"></span>
                  Searching...
                </>
              ) : (
                `${totalResults.toLocaleString()} reading${totalResults !== 1 ? 's' : ''} found`
              )}
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="btn btn-ghost btn-xs text-primary hover:text-primary-focus"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Advanced Filters */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-base-200 pt-4 space-y-4"
            >
              {/* First Row: Date Range and Sort */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label label-text font-medium">Date Range</label>
                  <select
                    className="select select-bordered w-full"
                    value={filters.dateRange}
                    onChange={(e) => handleFilterChange("dateRange", e.target.value)}
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>

                <div>
                  <label className="label label-text font-medium">Sort By</label>
                  <select
                    className="select select-bordered w-full"
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  >
                    <option value="newest">📅 Newest First</option>
                    <option value="oldest">📅 Oldest First</option>
                    <option value="rating">⭐ Highest Rated</option>
                    <option value="reviewed">✅ Reviewed First</option>
                    <option value="unreviewed">❓ Unreviewed First</option>
                  </select>
                </div>
              </div>

              {/* Custom Date Range */}
              <AnimatePresence>
                {showCustomDate && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div>
                      <label className="label label-text">Start Date</label>
                      <input
                        type="date"
                        className="input input-bordered w-full"
                        value={filters.customStartDate || ""}
                        onChange={(e) => handleFilterChange("customStartDate", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="label label-text">End Date</label>
                      <input
                        type="date"
                        className="input input-bordered w-full"
                        value={filters.customEndDate || ""}
                        onChange={(e) => handleFilterChange("customEndDate", e.target.value)}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Second Row: Review Status and Card Count */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label label-text font-medium">Review Status</label>
                  <select
                    className="select select-bordered w-full"
                    value={filters.hasReview}
                    onChange={(e) => handleFilterChange("hasReview", e.target.value)}
                  >
                    <option value="all">All Readings</option>
                    <option value="reviewed">✅ Reviewed</option>
                    <option value="unreviewed">❓ Unreviewed</option>
                  </select>
                </div>

                <div>
                  <label className="label label-text font-medium">Card Count</label>
                  <select
                    className="select select-bordered w-full"
                    value={filters.cardCount}
                    onChange={(e) => handleFilterChange("cardCount", e.target.value)}
                  >
                    {cardCountOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex justify-between items-center pt-2">
                <div className="text-sm text-base-content/60">
                  {hasActiveFilters ? "Filters applied" : "No filters active"}
                </div>
                <div className="flex gap-2">
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="btn btn-ghost btn-sm"
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="btn btn-primary btn-sm"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}