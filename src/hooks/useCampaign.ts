import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';

export interface CampaignData {
  id: string;
  name: string;
  discountPercentage: number;
  marketingMessage: string;
  bannerText: string;
  urgencyText: string;
  ctaText: string;
}

export interface CampaignEligibility {
  eligible: boolean;
  campaign?: CampaignData;
  reason?: string;
}

export function useCampaign() {
  const { user, isLoaded } = useUser();
  const [eligibility, setEligibility] = useState<CampaignEligibility | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkEligibility = useCallback(async () => {
    if (!isLoaded || !user) {
      setEligibility(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/campaigns/first-payment/status');
      const result = await response.json();

      if (result.success) {
        setEligibility(result.data);
      } else {
        setError(result.message || 'Failed to check campaign eligibility');
        setEligibility({ eligible: false, reason: result.message });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error';
      setError(errorMessage);
      setEligibility({ eligible: false, reason: errorMessage });
    } finally {
      setLoading(false);
    }
  }, [user, isLoaded]);

  // Auto-check eligibility when user is loaded
  useEffect(() => {
    if (isLoaded) {
      checkEligibility();
    }
  }, [isLoaded, checkEligibility]);

  const calculateDiscountedPrice = useCallback((originalPrice: number): number => {
    if (!eligibility?.eligible || !eligibility.campaign) {
      return originalPrice;
    }
    
    const discountPercentage = eligibility.campaign.discountPercentage;
    const discount = originalPrice * (discountPercentage / 100);
    return Math.round((originalPrice - discount) * 100) / 100;
  }, [eligibility]);

  const getDiscountAmount = useCallback((originalPrice: number): number => {
    if (!eligibility?.eligible || !eligibility.campaign) {
      return 0;
    }
    
    const discountPercentage = eligibility.campaign.discountPercentage;
    const discount = originalPrice * (discountPercentage / 100);
    return Math.round(discount * 100) / 100;
  }, [eligibility]);

  const formatPrice = useCallback((price: number): string => {
    return price.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, []);

  const refresh = useCallback(() => {
    checkEligibility();
  }, [checkEligibility]);

  return {
    // Campaign eligibility data
    eligible: eligibility?.eligible || false,
    campaign: eligibility?.campaign || null,
    reason: eligibility?.reason || null,
    
    // Loading and error states
    loading,
    error,
    
    // Utility functions
    calculateDiscountedPrice,
    getDiscountAmount,
    formatPrice,
    
    // Actions
    refresh
  };
}