"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { UnifiedNavbar } from '@/components/layout/UnifiedNavbar';
import { StripeProvider } from '@/components/providers/StripeProvider';
import { PackageCard } from '@/components/payments/PackageCard';
import { PaymentForm } from '@/components/payments/PaymentForm';
import { PaymentConfirmation } from '@/components/payments/PaymentConfirmation';
import { usePayment } from '@/hooks/usePayment';
import { motion, AnimatePresence } from "framer-motion";

export default function PackagesPage() {
  const { user, isLoaded } = useUser();
  const {
    packages,
    selectedPackage,
    clientSecret,
    loading,
    error,
    paymentStatus,
    fetchPackages,
    selectPackage,
    createPaymentIntent,
    confirmPayment,
    resetPayment,
    getCurrentCredits,
  } = usePayment();

  const [currentCredits, setCurrentCredits] = useState(0);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [confirmationData, setConfirmationData] = useState<any>(null);

  const loadCurrentCredits = useCallback(async () => {
    const credits = await getCurrentCredits();
    setCurrentCredits(credits);
  }, [getCurrentCredits]);

  // Fetch packages and user credits on component mount
  useEffect(() => {
    if (isLoaded && user) {
      fetchPackages();
      loadCurrentCredits();
    }
  }, [isLoaded, user, fetchPackages, loadCurrentCredits]);

  const handlePackageSelect = async (packageId: string) => {
    selectPackage(packageId);
    const clientSecret = await createPaymentIntent(packageId);
    if (clientSecret) {
      setShowPaymentForm(true);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    const result = await confirmPayment(paymentIntentId);
    if (result.success) {
      setConfirmationData({
        amount: selectedPackage?.price,
        currency: 'thb',
        creditsAdded: result.creditsAdded,
        transactionId: result.transactionId,
        packageName: selectedPackage?.title,
      });
      setShowPaymentForm(false);
      loadCurrentCredits(); // Refresh credits display
    }
  };

  const handlePaymentError = (error: string) => {
    console.error("Payment failed:", error);
    // Error handling is managed by PaymentConfirmation component
  };

  const handleCloseConfirmation = () => {
    setConfirmationData(null);
    resetPayment();
  };

  const handleBackToPackages = () => {
    setShowPaymentForm(false);
    resetPayment();
  };

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  // Unauthenticated state
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 flex flex-col">
        <UnifiedNavbar />
        <main className="content-container flex-1 pb-20 md:pb-6 pt-20 flex items-center justify-center">
          <div className="text-center">
            <h1 className="heading-1 mb-4">Authentication Required</h1>
            <p className="body-normal text-neutral-content mb-4">
              Please sign in to purchase credit packages
            </p>
            <Link href="/sign-in" className="btn btn-primary">
              Sign In
            </Link>
          </div>
        </main>
        <div className="md:hidden">
          <BottomNavigation />
        </div>
      </div>
    );
  }

  return (
    <StripeProvider clientSecret={clientSecret || undefined}>
      <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 flex flex-col">
        {/* Header */}
        <UnifiedNavbar />

        {/* Main Content */}
        <main className="content-container flex-1 pb-20 md:pb-6 pt-20">
          <AnimatePresence mode="wait">
            {!showPaymentForm ? (
              <motion.div
                key="packages"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Header Section */}
                <div className="text-center mb-8">
                  <h1 className="heading-1 mb-4">Credit Packages</h1>
                  <p className="body-large text-neutral-content">
                    Choose the perfect package for your spiritual journey
                  </p>
                </div>

                {/* Error Display */}
                {error && (
                  <motion.div 
                    className="alert alert-error max-w-2xl mx-auto mb-6"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* Packages Grid */}
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="card card-mystical">
                        <div className="card-body">
                          <div className="skeleton h-6 w-3/4 mx-auto mb-4"></div>
                          <div className="skeleton h-12 w-full mb-4"></div>
                          <div className="space-y-2 mb-6">
                            <div className="skeleton h-4 w-full"></div>
                            <div className="skeleton h-4 w-full"></div>
                            <div className="skeleton h-4 w-3/4"></div>
                          </div>
                          <div className="skeleton h-12 w-full"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {packages.map((pkg, index) => (
                      <motion.div
                        key={pkg.id}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <PackageCard
                          package={pkg}
                          onSelect={handlePackageSelect}
                          selected={selectedPackage?.id === pkg.id}
                          loading={loading && selectedPackage?.id === pkg.id}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Current Credits Display */}
                <motion.div 
                  className="card card-mystical max-w-md mx-auto mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="card-body text-center">
                    <h3 className="heading-3 mb-2">Current Balance</h3>
                    <div className="text-2xl font-bold text-primary mb-4">
                      {currentCredits} Credits
                    </div>
                    <p className="body-small text-neutral-content">
                      Use your credits for detailed tarot readings
                    </p>
                  </div>
                </motion.div>

                {/* FAQ Section */}
                <motion.div 
                  className="mt-12 max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h2 className="heading-2 text-center mb-6">Frequently Asked Questions</h2>
                  
                  <div className="space-y-2">
                    <div className="collapse collapse-arrow bg-base-200">
                      <input type="radio" name="faq-accordion" />
                      <div className="collapse-title font-medium">
                        How do credits work?
                      </div>
                      <div className="collapse-content">
                        <p>Each detailed tarot reading costs 1 credit. Credits never expire and can be used anytime.</p>
                      </div>
                    </div>

                    <div className="collapse collapse-arrow bg-base-200">
                      <input type="radio" name="faq-accordion" />
                      <div className="collapse-title font-medium">
                        Is my payment information secure?
                      </div>
                      <div className="collapse-content">
                        <p>Yes! We use Stripe for payment processing, which provides bank-level security. We never store your payment information.</p>
                      </div>
                    </div>

                    <div className="collapse collapse-arrow bg-base-200">
                      <input type="radio" name="faq-accordion" />
                      <div className="collapse-title font-medium">
                        Can I get a refund?
                      </div>
                      <div className="collapse-content">
                        <p>We offer a 30-day money-back guarantee if you&apos;re not satisfied with your readings.</p>
                      </div>
                    </div>

                    <div className="collapse collapse-arrow bg-base-200">
                      <input type="radio" name="faq-accordion" />
                      <div className="collapse-title font-medium">
                        Are there any hidden fees?
                      </div>
                      <div className="collapse-content">
                        <p>No hidden fees. The price you see is exactly what you pay, and credits never expire.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="payment"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-md mx-auto"
              >
                {/* Payment Form Header */}
                <div className="text-center mb-6">
                  <button
                    onClick={handleBackToPackages}
                    className="btn btn-ghost btn-sm mb-4"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Packages
                  </button>
                  
                  <h2 className="heading-2 mb-2">Complete Your Purchase</h2>
                  {selectedPackage && (
                    <p className="text-neutral-content">
                      {selectedPackage.title} - {selectedPackage.creditAmount} Credits
                    </p>
                  )}
                </div>

                {/* Payment Form */}
                {clientSecret && selectedPackage && (
                  <PaymentForm
                    amount={selectedPackage.price}
                    currency="thb"
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    loading={loading}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Payment Confirmation Modal */}
        <PaymentConfirmation
          isOpen={paymentStatus === "success" || paymentStatus === "error" || paymentStatus === "processing"}
          onClose={handleCloseConfirmation}
          type={paymentStatus as "success" | "error" | "processing"}
          data={confirmationData}
          error={error}
        />

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <BottomNavigation />
        </div>
      </div>
    </StripeProvider>
  );
}