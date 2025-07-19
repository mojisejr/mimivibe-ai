"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PaymentFilters } from "@/types/payment";

interface Package {
  id: number;
  title: string;
  subtitle?: string;
}

interface PaymentFiltersProps {
  onFiltersChange: (filters: PaymentFilters) => void;
  initialFilters?: Partial<PaymentFilters>;
  totalResults?: number;
  isLoading?: boolean;
}

const defaultFilters: PaymentFilters = {
  search: "",
  status: undefined,
  packId: undefined,
  startDate: undefined,
  endDate: undefined,
};

export function PaymentFilters({
  onFiltersChange,
  initialFilters = {},
  totalResults,
  isLoading = false,
}: PaymentFiltersProps) {
  const [filters, setFilters] = useState<PaymentFilters>({
    ...defaultFilters,
    ...initialFilters,
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [packages, setPackages] = useState<Package[]>([]);

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

  // Fetch packages for filter
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch('/api/payments/packages');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data?.packages) {
            setPackages(result.data.packages);
          }
        }
      } catch (error) {
        console.error('Failed to fetch packages for filter:', error);
      }
    };

    fetchPackages();
  }, []);

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

  const handleFilterChange = (key: keyof PaymentFilters, value: any) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = { ...defaultFilters };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = () => {
    return filters.search || filters.status || filters.packId || filters.startDate || filters.endDate;
  };

  return (
    <div className="bg-base-100 rounded-lg border border-base-300/50 shadow-sm mb-6">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-base-300/50">
        <div className="flex items-center space-x-4">
          <h3 className="text-sm font-semibold text-base-content">
            ค้นหาและกรอง
          </h3>
          {totalResults !== undefined && (
            <span className="text-xs text-neutral-content">
              {totalResults} รายการ
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {hasActiveFilters() && (
            <button
              onClick={clearFilters}
              className="btn btn-ghost btn-xs text-neutral-content hover:text-base-content"
              disabled={isLoading}
            >
              ล้างตัวกรอง
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn btn-ghost btn-sm"
            disabled={isLoading}
          >
            <span className="mr-1">🔍</span>
            {isExpanded ? "ย่อ" : "ขยาย"}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-base-300/50">
        <div className="form-control">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-neutral-content text-sm">🔍</span>
            </div>
            <input
              type="text"
              placeholder="ค้นหาด้วย Payment ID..."
              className="input input-bordered input-sm w-full pl-10 pr-10 text-sm"
              value={filters.search || ""}
              onChange={(e) => handleSearchChange(e.target.value)}
              disabled={isLoading}
            />
            {filters.search && (
              <button
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-content hover:text-base-content transition-colors"
                onClick={() => handleSearchChange("")}
                disabled={isLoading}
              >
                <span className="text-sm">✕</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Status Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-xs font-medium">สถานะการชำระ</span>
                </label>
                <select
                  className="select select-bordered select-sm w-full max-w-xs"
                  value={filters.status || ""}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">ทั้งหมด</option>
                  <option value="succeeded">สำเร็จ ✅</option>
                  <option value="pending">รอดำเนินการ ⏳</option>
                  <option value="failed">ล้มเหลว ❌</option>
                </select>
              </div>

              {/* Date Range Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-xs font-medium">จากวันที่</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered input-sm"
                    value={filters.startDate || ""}
                    onChange={(e) => handleFilterChange("startDate", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-xs font-medium">ถึงวันที่</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered input-sm"
                    value={filters.endDate || ""}
                    onChange={(e) => handleFilterChange("endDate", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Package Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-xs font-medium">แพ็คเกจ</span>
                </label>
                <select
                  className="select select-bordered select-sm w-full max-w-xs"
                  value={filters.packId || ""}
                  onChange={(e) => handleFilterChange("packId", e.target.value ? parseInt(e.target.value) : undefined)}
                  disabled={isLoading}
                >
                  <option value="">ทั้งหมด</option>
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}