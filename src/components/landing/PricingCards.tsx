"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePackages } from "@/hooks/usePackages";
import { useCampaign } from "@/hooks/useCampaign";
import {
  campaignFadeInUp,
  campaignCardHover,
  campaignStaggerChildren,
  getPackageCardStyle,
  getPackageButtonStyle,
  getPriceColorClass,
  getPackageIcon,
  priceDisplayClasses,
  discountBadgeClasses,
  campaignAriaLabels,
} from "@/utils/campaignStyles";

export function PricingCards() {
  const { packages, loading, error } = usePackages();
  const {
    eligible: campaignEligible,
    campaign,
    calculateDiscountedPrice,
    formatPrice,
  } = useCampaign();

  if (loading) {
    return (
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
        initial="initial"
        animate="animate"
        variants={campaignStaggerChildren}
      >
        {[...Array(3)].map((_, i) => (
          <motion.div key={i} variants={campaignFadeInUp}>
            <div className="card bg-gradient-to-br from-base-100 to-base-200 shadow-xl">
              <div className="card-body text-center p-8">
                <div className="skeleton h-8 w-8 mx-auto mb-6 rounded-full"></div>
                <div className="skeleton h-6 w-32 mx-auto mb-2"></div>
                <div className="skeleton h-8 w-24 mx-auto mb-4"></div>
                <div className="space-y-3 mb-8">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="skeleton h-4 w-full"></div>
                  ))}
                </div>
                <div className="skeleton h-12 w-full"></div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="alert alert-error max-w-md mx-auto">
          <span>ไม่สามารถโหลดแพ็คเกจได้: {error}</span>
        </div>
      </motion.div>
    );
  }

  if (!packages || packages.length === 0) {
    return (
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="alert alert-warning max-w-md mx-auto">
          <span>ไม่พบแพ็คเกจในระบบ</span>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
        initial="initial"
        animate="animate"
        variants={campaignStaggerChildren}
      >
        {packages.map((pkg, index) => {
          const originalPrice = pkg.price;
          const discountedPrice = campaignEligible
            ? calculateDiscountedPrice(originalPrice)
            : originalPrice;
          const hasDiscount =
            campaignEligible && discountedPrice < originalPrice;

          return (
            <motion.div
              key={pkg.id}
              variants={{
                ...campaignFadeInUp,
                ...campaignCardHover,
              }}
              className="group relative"
              whileHover="hover"
            >
              {/* Popular Badge */}
              {pkg.popular && (
                <div className={`${discountBadgeClasses.container} ${discountBadgeClasses.positions.topCenter}`}>
                  <div className={discountBadgeClasses.badge.popular}>ยอดนิยม</div>
                </div>
              )}

              {/* Discount Badge */}
              {hasDiscount && (
                <div className={`${discountBadgeClasses.container} ${discountBadgeClasses.positions.topRight}`}>
                  <div 
                    className={discountBadgeClasses.badge.discount}
                    aria-label={campaignAriaLabels.discountBadge(campaign?.discountPercentage || 0)}
                  >
                    ลด {campaign?.discountPercentage}%
                  </div>
                </div>
              )}

              {/* Package Card */}
              <div className={getPackageCardStyle(index, pkg.popular || false, hasDiscount)}>
                <div className="card-body text-center p-8">
                  {/* Package Icon */}
                  <div className="mb-6">
                    <span className="text-4xl">{getPackageIcon(index)}</span>
                  </div>

                  {/* Package Title */}
                  <h3 className="text-2xl font-bold text-base-content mb-2">
                    {pkg.title}
                  </h3>

                  {/* Price Display */}
                  <div className="price-section mb-4">
                    {hasDiscount ? (
                      <div 
                        className={priceDisplayClasses.container}
                        aria-label={campaignAriaLabels.discountedPrice(
                          originalPrice,
                          discountedPrice, 
                          originalPrice - discountedPrice
                        )}
                      >
                        <div className={priceDisplayClasses.original}>
                          {formatPrice(originalPrice)}฿
                        </div>
                        <div className={priceDisplayClasses.discounted}>
                          {formatPrice(discountedPrice)}฿
                        </div>
                        <div className={priceDisplayClasses.savings}>
                          ประหยัด {formatPrice(originalPrice - discountedPrice)}฿
                        </div>
                      </div>
                    ) : (
                      <div className={`text-3xl font-bold ${getPriceColorClass(index, pkg.popular || false, hasDiscount)}`}>
                        {formatPrice(originalPrice)}฿
                      </div>
                    )}
                  </div>

                  {/* Features List */}
                  <ul className="text-left space-y-3 mb-8">
                    <li className="flex items-center">
                      <span className="text-success mr-2">✓</span>
                      <span>⭐ {pkg.creditAmount} ดาว</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-success mr-2">✓</span>
                      <span>🎁 เหรียญโบนัส</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-success mr-2">✓</span>
                      <span>📱 ใช้งานได้ทันที</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-success mr-2">✓</span>
                      <span>🔮 คำแนะนำจาก AI</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-success mr-2">✓</span>
                      <span>📋 บันทึกผลการทำนาย</span>
                    </li>
                  </ul>

                  {/* Campaign Alert */}
                  {hasDiscount && (
                    <div className="alert alert-success alert-sm mb-4">
                      <span className="text-xs">
                        🎁 ข้อเสนอพิเศษสำหรับสมาชิกใหม่!
                      </span>
                    </div>
                  )}

                  {/* CTA Button */}
                  <Link href="/packages">
                    <button
                      className={getPackageButtonStyle(index, pkg.popular || false, hasDiscount)}
                      aria-label={hasDiscount ? campaignAriaLabels.campaignButton(campaign?.discountPercentage || 0) : undefined}
                    >
                      {hasDiscount && campaign?.ctaText
                        ? campaign.ctaText
                        : "เลือกแพ็คเกจนี้"}
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}