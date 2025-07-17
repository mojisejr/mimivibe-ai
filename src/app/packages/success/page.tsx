"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { motion } from "framer-motion";

export default function PaymentSuccessPage() {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);

  // Get payment intent ID from URL
  const paymentIntentId = searchParams.get('payment_intent');
  const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');

  const confirmPayment = useCallback(async () => {
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
        setPaymentData(result.data);
      } else {
        setError(result.message || 'Payment confirmation failed');
      }
    } catch (error) {
      setError('Failed to confirm payment');
      console.error('Payment confirmation error:', error);
    } finally {
      setLoading(false);
    }
  }, [paymentIntentId]);

  useEffect(() => {
    if (isLoaded && user && paymentIntentId) {
      confirmPayment();
    } else if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [isLoaded, user, paymentIntentId, router, confirmPayment]);

  // Loading state
  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <p className="text-neutral-content">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 flex items-center justify-center">
        <div className="card card-mystical max-w-md">
          <div className="card-body text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="heading-2 text-error mb-2">Payment Error</h2>
            <p className="text-neutral-content mb-6">{error}</p>
            <div className="card-actions justify-center">
              <Link href="/packages" className="btn btn-primary">
                Back to Packages
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 flex items-center justify-center">
      <motion.div 
        className="card card-mystical max-w-md"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="card-body text-center">
          <motion.div 
            className="text-6xl mb-4"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              delay: 0.2, 
              type: "spring", 
              stiffness: 300,
              damping: 20 
            }}
          >
            🎉
          </motion.div>
          
          <motion.h2 
            className="heading-2 text-success mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Payment Successful!
          </motion.h2>
          
          <motion.p 
            className="text-neutral-content mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Your payment has been processed successfully and credits have been added to your account.
          </motion.p>

          {paymentData && (
            <motion.div 
              className="bg-gradient-to-r from-success/10 to-primary/10 rounded-lg p-4 mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-content">Credits Added:</span>
                  <span className="font-semibold text-primary">
                    +{paymentData.transaction?.creditsAdded} credits
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-content">Total Credits:</span>
                  <span className="font-semibold">
                    {paymentData.credits} credits
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div 
            className="card-actions justify-center space-y-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Link href="/ask" className="btn btn-primary w-full">
              <span className="mr-2">🔮</span>
              Start Reading
            </Link>
            
            <Link href="/packages" className="btn btn-ghost btn-sm">
              Back to Packages
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}