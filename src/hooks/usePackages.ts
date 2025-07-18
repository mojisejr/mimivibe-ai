"use client";

import { useState, useEffect } from "react";

interface Package {
  id: number;
  title: string;
  subtitle?: string;
  price: number;
  creditAmount: number;
  ctaText: string;
  popular?: boolean;
  metadata?: any;
}

interface PackagesState {
  packages: Package[];
  loading: boolean;
  error: string | null;
}

export function usePackages() {
  const [state, setState] = useState<PackagesState>({
    packages: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const response = await fetch("/api/payments/packages");

        if (!response.ok) {
          throw new Error(`Failed to fetch packages: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch packages");
        }

        setState({
          packages: data.data?.packages || [],
          loading: false,
          error: null,
        });
      } catch (error) {
        setState({
          packages: [],
          loading: false,
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
      }
    };

    fetchPackages();
  }, []);

  return {
    packages: state.packages,
    loading: state.loading,
    error: state.error,
  };
}
