"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { UnifiedNavbar } from "@/components/layout/UnifiedNavbar";
import { StripeProvider } from "@/components/providers/StripeProvider";
import { PackageCard } from "@/components/payments/PackageCard";
import { PaymentForm } from "@/components/payments/PaymentForm";
import { PaymentConfirmation } from "@/components/payments/PaymentConfirmation";
import { usePayment } from "@/hooks/usePayment";
import { useCampaign } from "@/hooks/useCampaign";
import { motion, AnimatePresence } from "framer-motion";
import {
  campaignBannerClasses,
  campaignBannerAnimation,
  campaignFadeInUp,
  getPackageCardStyle,
  getPackageButtonStyle,
  priceDisplayClasses,
  discountBadgeClasses,
  campaignAriaLabels,
  campaignSpacing,
} from "@/utils/campaignStyles";
import { useTranslation } from "@/lib/i18n";

export default function PackagesPage() {
  const { user, isLoaded } = useUser();
  const { t } = useTranslation();
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

  const {
    eligible: campaignEligible,
    campaign,
    calculateDiscountedPrice,
    getDiscountAmount,
    formatPrice,
    refresh: refreshCampaign,
  } = useCampaign();

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
        currency: "thb",
        creditsAdded: result.creditsAdded,
        transactionId: result.transactionId,
        packageName: selectedPackage?.title,
      });
      setShowPaymentForm(false);
      loadCurrentCredits(); // Refresh credits display
      refreshCampaign(); // Refresh campaign eligibility (will become ineligible)
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
            <h1 className="heading-1 mb-4">{t('common.payment.authRequired')}</h1>
            <p className="body-normal text-neutral-content mb-4">
              {t('common.payment.signInToPurchase')}
            </p>
            <Link href="/sign-in" className="btn btn-primary">
              {t('common.buttons.signIn')}
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
                <h1 className="heading-1 mb-4">{t('pages.packages.title')}</h1>
                <p className="body-large text-neutral-content">
                  {t('pages.packages.subtitle')}
                </p>
              </div>

              {/* Campaign Banner - Enhanced Contrast */}
              {campaignEligible && campaign && (
                <motion.div
                  className={`${campaignBannerClasses.base} ${campaignBannerClasses.gradient}`}
                  {...campaignBannerAnimation}
                  role="alert"
                  aria-label={campaignAriaLabels.campaignBanner}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-start">
                      <div className="flex-1">
                        <h3 className={campaignBannerClasses.text.title}>
                          {campaign.bannerText}
                        </h3>
                        <p className={campaignBannerClasses.text.subtitle}>
                          {campaign.marketingMessage}
                        </p>
                        <p
                          className={`${campaignBannerClasses.text.urgency} mt-1`}
                        >
                          {campaign.urgencyText}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Error Display */}
              {error && (
                <motion.div
                  className="alert alert-error max-w-2xl mx-auto mb-6"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
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
                  {packages.map((pkg, index) => {
                    const originalPrice = pkg.price;
                    const discountedPrice = campaignEligible
                      ? calculateDiscountedPrice(originalPrice)
                      : originalPrice;
                    const discountAmount = campaignEligible
                      ? getDiscountAmount(originalPrice)
                      : 0;
                    const hasDiscount = campaignEligible && discountAmount > 0;

                    return (
                      <motion.div
                        key={pkg.id}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative"
                      >
                        {hasDiscount && (
                          <div
                            className={
                              discountBadgeClasses.container +
                              " " +
                              discountBadgeClasses.positions.topCenter
                            }
                          >
                            <div
                              className={discountBadgeClasses.badge.discount}
                              aria-label={campaignAriaLabels.discountBadge(
                                campaign?.discountPercentage || 0
                              )}
                            >
                              {t('common.payment.discount')} {campaign?.discountPercentage}%
                            </div>
                          </div>
                        )}

                        <div
                          className={getPackageCardStyle(
                            index,
                            pkg.popular,
                            hasDiscount
                          )}
                        >
                          <div className="card-body">
                            <div className="text-center mb-4">
                              <h3 className="text-xl font-bold mb-2">
                                {pkg.title}
                              </h3>
                              {pkg.subtitle && (
                                <p className="text-sm text-neutral-content mb-4">
                                  {pkg.subtitle}
                                </p>
                              )}

                              <div className="price-display">
                                {hasDiscount ? (
                                  <div
                                    className={priceDisplayClasses.container}
                                    aria-label={campaignAriaLabels.discountedPrice(
                                      originalPrice,
                                      discountedPrice,
                                      discountAmount
                                    )}
                                  >
                                    <div
                                      className={priceDisplayClasses.original}
                                    >
                                      ฿{formatPrice(originalPrice)}
                                    </div>
                                    <div
                                      className={priceDisplayClasses.discounted}
                                    >
                                      ฿{formatPrice(discountedPrice)}
                                    </div>
                                    <div
                                      className={priceDisplayClasses.savings}
                                    >
                                      {t('common.payment.savings')} ฿{formatPrice(discountAmount)}
                                    </div>
                                  </div>
                                ) : (
                                  <div className={priceDisplayClasses.regular}>
                                    ฿{formatPrice(originalPrice)}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="text-center mb-4">
                              <div className="text-lg">
                                ⭐ {pkg.creditAmount} {t('common.payment.credits')}
                              </div>
                            </div>

                            {hasDiscount && (
                              <div className="alert alert-success alert-sm mb-4">
                                <span className="text-xs">
                                  🎁 {t('common.payment.specialOfferNewMember')}
                                </span>
                              </div>
                            )}

                            <button
                              className={`${getPackageButtonStyle(
                                index,
                                pkg.popular,
                                hasDiscount
                              )} ${
                                loading && selectedPackage?.id === pkg.id
                                  ? "loading"
                                  : ""
                              }`}
                              onClick={() => handlePackageSelect(pkg.id)}
                              disabled={loading}
                              aria-label={
                                hasDiscount
                                  ? campaignAriaLabels.campaignButton(
                                      campaign?.discountPercentage || 0
                                    )
                                  : undefined
                              }
                            >
                              {hasDiscount && campaign?.ctaText
                                ? campaign.ctaText
                                : pkg.ctaText}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Current Credits Display - Enhanced Spacing */}
              <motion.div
                className={`card card-mystical max-w-md mx-auto ${campaignSpacing.section} mt-6`}
                {...campaignFadeInUp}
                transition={{ ...campaignFadeInUp.transition, delay: 0.4 }}
              >
                <div className="card-body text-center">
                  <h3 className="heading-3 mb-2">{t('common.payment.currentBalance')}</h3>
                  <div className="text-2xl font-bold text-primary mb-4">
                    {currentCredits} {t('common.payment.credits')}
                  </div>
                  <p className="body-small text-neutral-content">
                    {t('common.payment.useCreditsFor')}
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
                <h2 className="heading-2 text-center mb-6">
                  {t('common.payment.faq')}
                </h2>

                <div className="space-y-2">
                  <div className="collapse collapse-arrow bg-base-200">
                    <input type="radio" name="faq-accordion" />
                    <div className="collapse-title font-medium">
                      {t('common.payment.howCreditsWork')}
                    </div>
                    <div className="collapse-content">
                      <p>
                        {t('common.payment.creditsDescription')}
                      </p>
                    </div>
                  </div>

                  <div className="collapse collapse-arrow bg-base-200">
                    <input type="radio" name="faq-accordion" />
                    <div className="collapse-title font-medium">
                      {t('common.payment.paymentSecurity')}
                    </div>
                    <div className="collapse-content">
                      <p>
                        {t('common.payment.securityDescription')}
                      </p>
                    </div>
                  </div>

                  <div className="collapse collapse-arrow bg-base-200">
                    <input type="radio" name="faq-accordion" />
                    <div className="collapse-title font-medium">
                      {t('common.payment.refundPolicy')}
                    </div>
                    <div className="collapse-content">
                      <p>
                        {t('common.payment.refundDescription')}
                      </p>
                    </div>
                  </div>

                  <div className="collapse collapse-arrow bg-base-200">
                    <input type="radio" name="faq-accordion" />
                    <div className="collapse-title font-medium">
                      {t('common.payment.hiddenFees')}
                    </div>
                    <div className="collapse-content">
                      <p>
                        {t('common.payment.hiddenFeesDescription')}
                      </p>
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
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
{t('common.payment.backToPackages')}
                </button>

                <h2 className="heading-2 mb-2">{t('common.payment.completePurchase')}</h2>
                {selectedPackage && (
                  <div className="space-y-2">
                    <p className="text-neutral-content">
                      {selectedPackage.title} - {selectedPackage.creditAmount}{" "}
                      {t('common.payment.credits')}
                    </p>
                    {campaignEligible && campaign && (
                      <div className="alert alert-success alert-sm">
                        <span className="text-sm">
                          🎉 {t('common.payment.specialOffer')}: {t('common.payment.firstTimeBuyer', { percentage: campaign.discountPercentage })}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Payment Form */}
              {clientSecret && selectedPackage && (
                <StripeProvider clientSecret={clientSecret}>
                  <PaymentForm
                    amount={
                      campaignEligible
                        ? calculateDiscountedPrice(selectedPackage.price)
                        : selectedPackage.price
                    }
                    currency="thb"
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    loading={loading}
                  />
                </StripeProvider>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Payment Confirmation Modal */}
      <PaymentConfirmation
        isOpen={
          paymentStatus === "success" ||
          paymentStatus === "error" ||
          paymentStatus === "processing"
        }
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
  );
}
