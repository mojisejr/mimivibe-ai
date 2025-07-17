"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface PaymentConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  type: "success" | "error" | "processing";
  data?: {
    amount?: number;
    currency?: string;
    creditsAdded?: number;
    transactionId?: string;
    packageName?: string;
  };
  error?: string | null;
}

export function PaymentConfirmation({ 
  isOpen, 
  onClose, 
  type, 
  data, 
  error 
}: PaymentConfirmationProps) {
  const [showReceipt, setShowReceipt] = useState(false);

  if (!isOpen) return null;

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const handleDownloadReceipt = () => {
    // This would generate and download a PDF receipt
    console.log("Downloading receipt for transaction:", data?.transactionId);
    // Implementation would use a PDF generation library
  };

  return (
    <div className="modal modal-open">
      <motion.div 
        className="modal-box max-w-md"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="text-center">
          {/* Success State */}
          {type === "success" && (
            <>
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
              
              <motion.h3 
                className="text-2xl font-bold text-success mb-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Payment Successful!
              </motion.h3>
              
              <motion.p 
                className="text-neutral-content mb-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Your payment has been processed successfully and credits have been added to your account.
              </motion.p>

              {/* Payment Details */}
              {data && (
                <motion.div 
                  className="bg-gradient-to-r from-success/10 to-primary/10 rounded-lg p-4 mb-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-neutral-content">Package</div>
                      <div className="font-semibold">{data.packageName}</div>
                    </div>
                    <div>
                      <div className="text-neutral-content">Amount</div>
                      <div className="font-semibold">
                        {data.amount && data.currency && formatAmount(data.amount, data.currency)}
                      </div>
                    </div>
                    <div>
                      <div className="text-neutral-content">Credits Added</div>
                      <div className="font-semibold text-primary">
                        +{data.creditsAdded} credits
                      </div>
                    </div>
                    <div>
                      <div className="text-neutral-content">Transaction ID</div>
                      <div className="font-mono text-xs">
                        {data.transactionId?.slice(-8)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <motion.div 
                className="flex flex-col space-y-3"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={handleDownloadReceipt}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Receipt
                </button>
                
                <button 
                  className="btn btn-primary"
                  onClick={onClose}
                >
                  Continue Reading
                </button>
              </motion.div>
            </>
          )}

          {/* Processing State */}
          {type === "processing" && (
            <>
              <motion.div 
                className="text-6xl mb-4"
                animate={{ rotate: 360 }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
              >
                ⏳
              </motion.div>
              
              <h3 className="text-2xl font-bold text-primary mb-2">
                Processing Payment...
              </h3>
              
              <p className="text-neutral-content mb-6">
                Please wait while we process your payment. This may take a few moments.
              </p>

              <div className="flex justify-center">
                <span className="loading loading-dots loading-lg text-primary"></span>
              </div>
            </>
          )}

          {/* Error State */}
          {type === "error" && (
            <>
              <motion.div 
                className="text-6xl mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.5 }}
              >
                ❌
              </motion.div>
              
              <h3 className="text-2xl font-bold text-error mb-2">
                Payment Failed
              </h3>
              
              <p className="text-neutral-content mb-6">
                {error || "We encountered an issue processing your payment. Please try again."}
              </p>

              {/* Error Details */}
              <div className="bg-error/10 border border-error/20 rounded-lg p-4 mb-6">
                <div className="text-sm text-error">
                  <strong>What happened?</strong>
                  <br />
                  {error?.includes('card') && "Your card was declined. Please check your card details or try a different payment method."}
                  {error?.includes('insufficient') && "Insufficient funds. Please check your account balance or try a different payment method."}
                  {!error?.includes('card') && !error?.includes('insufficient') && "A technical error occurred. Our team has been notified."}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-3">
                <button 
                  className="btn btn-primary"
                  onClick={onClose}
                >
                  Try Again
                </button>
                
                <button 
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    // This would open a help/contact modal
                    console.log("Opening help center");
                  }}
                >
                  Contact Support
                </button>
              </div>
            </>
          )}
        </div>

        {/* Close button for success/error states */}
        {type !== "processing" && (
          <div className="modal-action">
            <button 
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        )}
      </motion.div>
      
      {/* Backdrop */}
      <div className="modal-backdrop bg-black/50" onClick={type !== "processing" ? onClose : undefined}>
        {/* Prevent closing during processing */}
      </div>
    </div>
  );
}