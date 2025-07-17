"use client";

import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { motion } from "framer-motion";

interface PaymentFormProps {
  amount: number;
  currency: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  loading?: boolean;
}

export function PaymentForm({
  amount,
  currency,
  onSuccess,
  onError,
  loading: externalLoading = false,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoading = loading || externalLoading;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || "Payment submission failed");
        setLoading(false);
        return;
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/packages/success`,
        },
        redirect: "if_required",
      });

      if (confirmError) {
        if (confirmError.type === "card_error" || confirmError.type === "validation_error") {
          setError(confirmError.message || "Payment failed");
        } else {
          setError("An unexpected error occurred");
        }
        setLoading(false);
        onError(confirmError.message || "Payment failed");
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        setLoading(false);
        onSuccess(paymentIntent.id);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError("An unexpected error occurred");
      setLoading(false);
      onError("An unexpected error occurred");
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Payment Amount Display */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 text-center">
        <div className="text-sm text-neutral-content mb-1">Amount to pay</div>
        <div className="text-2xl font-bold text-primary">
          {formatAmount(amount, currency)}
        </div>
      </div>

      {/* Payment Element */}
      <div className="space-y-4">
        <div className="text-sm font-medium text-neutral-content">
          Payment Information
        </div>
        <div className="p-4 border border-base-300 rounded-lg bg-base-100">
          <PaymentElement
            options={{
              layout: "tabs",
              paymentMethodOrder: ["card", "promptpay"],
            }}
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="alert alert-error"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </motion.div>
      )}

      {/* Payment Button */}
      <button
        type="submit"
        disabled={!stripe || !elements || isLoading}
        className={`btn btn-primary w-full ${isLoading ? "loading" : ""}`}
      >
        {isLoading ? (
          <>
            <span className="loading loading-spinner loading-sm"></span>
            Processing Payment...
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Pay {formatAmount(amount, currency)}
          </>
        )}
      </button>

      {/* Security Notice */}
      <div className="text-center">
        <div className="text-xs text-neutral-content flex items-center justify-center space-x-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>Secured by Stripe • Your payment information is encrypted</span>
        </div>
      </div>
    </motion.form>
  );
}