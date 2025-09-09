"use client";

import { useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";

interface Package {
  id: string;
  title: string;
  subtitle?: string;
  price: number;
  creditAmount: number;
  ctaText: string;
  popular?: boolean;
  metadata?: any;
}

interface PaymentState {
  packages: Package[];
  selectedPackage: Package | null;
  clientSecret: string | null;
  loading: boolean;
  error: string | null;
  paymentStatus: "idle" | "processing" | "success" | "error";
}

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  creditsAdded?: number;
  error?: string;
}

export function usePayment() {
  const { user } = useUser();
  const [state, setState] = useState<PaymentState>({
    packages: [],
    selectedPackage: null,
    clientSecret: null,
    loading: false,
    error: null,
    paymentStatus: "idle",
  });

  // Fetch available packages
  const fetchPackages = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch('/api/payments/packages');
      const result = await response.json();
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          packages: result.data.packages,
          loading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: result.message || 'Failed to fetch packages',
          loading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Network error occurred',
        loading: false,
      }));
    }
  }, []);

  // Select a package
  const selectPackage = useCallback((packageId: string) => {
    const selectedPkg = state.packages.find(pkg => pkg.id === packageId);
    if (selectedPkg) {
      setState(prev => ({
        ...prev,
        selectedPackage: selectedPkg,
        error: null,
      }));
    }
  }, [state.packages]);

  // Create payment intent
  const createPaymentIntent = useCallback(async (packageId: string) => {
    if (!user) {
      setState(prev => ({ ...prev, error: 'Authentication required' }));
      return null;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packId: packageId }),
      });

      const result = await response.json();

      if (result.success) {
        setState(prev => ({
          ...prev,
          clientSecret: result.data.clientSecret,
          loading: false,
        }));
        return result.data.clientSecret;
      } else {
        setState(prev => ({
          ...prev,
          error: result.message || 'Failed to create payment intent',
          loading: false,
        }));
        return null;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Network error occurred',
        loading: false,
      }));
      return null;
    }
  }, [user]);

  // Confirm payment
  const confirmPayment = useCallback(async (paymentIntentId: string): Promise<PaymentResult> => {
    setState(prev => ({ ...prev, paymentStatus: "processing" }));

    try {
      const response = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentIntentId }),
      });

      const result = await response.json();

      if (result.success) {
        setState(prev => ({ ...prev, paymentStatus: "success" }));
        return {
          success: true,
          transactionId: paymentIntentId,
          creditsAdded: result.data?.transaction?.creditsAdded,
        };
      } else {
        setState(prev => ({ 
          ...prev, 
          paymentStatus: "error",
          error: result.message || 'Payment confirmation failed',
        }));
        return {
          success: false,
          error: result.message || 'Payment confirmation failed',
        };
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        paymentStatus: "error",
        error: 'Network error occurred',
      }));
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  }, []);

  // Reset payment state
  const resetPayment = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedPackage: null,
      clientSecret: null,
      error: null,
      paymentStatus: "idle",
    }));
  }, []);

  // Get current user credits (this would typically come from a separate hook or context)
  const getCurrentCredits = useCallback(async () => {
    if (!user) return 0;

    try {
      const response = await fetch('/api/user/credits');
      const result = await response.json();
      
      if (result.success) {
        return result.data.stars + result.data.freePoint;
      }
      return 0;
    } catch (error) {
      console.error('Failed to fetch credits:', error);
      return 0;
    }
  }, [user]);

  return {
    // State
    packages: state.packages,
    selectedPackage: state.selectedPackage,
    clientSecret: state.clientSecret,
    loading: state.loading,
    error: state.error,
    paymentStatus: state.paymentStatus,
    
    // Actions
    fetchPackages,
    selectPackage,
    createPaymentIntent,
    confirmPayment,
    resetPayment,
    getCurrentCredits,
  };
}