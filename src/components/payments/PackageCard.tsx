"use client";

import { motion } from "framer-motion";

interface PackageCardProps {
  package: {
    id: string;
    title: string;
    subtitle?: string;
    price: number;
    creditAmount: number;
    popular?: boolean;
    metadata?: any;
  };
  onSelect: (packageId: string) => void;
  selected?: boolean;
  loading?: boolean;
}

export function PackageCard({ package: pkg, onSelect, selected = false, loading = false }: PackageCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(price);
  };

  const calculateValuePerCredit = (price: number, credits: number) => {
    return (price / credits).toFixed(2);
  };

  const features = pkg.metadata?.features || [
    `${pkg.creditAmount} detailed readings`,
    "Reading history access",
    "24/7 availability"
  ];

  const bonusCredits = pkg.metadata?.bonusCredits || 0;
  const totalCredits = pkg.creditAmount + bonusCredits;

  return (
    <motion.div
      className={`card card-mystical relative cursor-pointer transition-all duration-300 ${
        selected 
          ? 'ring-2 ring-primary shadow-lg scale-105' 
          : 'hover:shadow-md hover:scale-102'
      } ${
        pkg.popular 
          ? 'ring-2 ring-secondary' 
          : ''
      }`}
      onClick={() => !loading && onSelect(pkg.id)}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      {/* Popular Badge */}
      {pkg.popular && (
        <motion.div 
          className="badge badge-secondary absolute -top-3 left-1/2 transform -translate-x-1/2 z-10"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
        >
          🔥 Most Popular
        </motion.div>
      )}

      {/* Selection Indicator */}
      {selected && (
        <motion.div 
          className="absolute top-4 right-4 z-10"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="w-6 h-6 bg-primary text-primary-content rounded-full flex items-center justify-center">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </motion.div>
      )}

      <div className="card-body">
        {/* Package Title */}
        <h3 className="heading-3 text-center mb-2">{pkg.title}</h3>
        
        {/* Subtitle */}
        {pkg.subtitle && (
          <p className="text-center text-neutral-content text-sm mb-4">
            {pkg.subtitle}
          </p>
        )}

        {/* Pricing Section */}
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-primary mb-1">
            {formatPrice(pkg.price)}
          </div>
          
          {/* Credits Display */}
          <div className="flex items-center justify-center space-x-2">
            <span className="text-lg font-semibold">
              {pkg.creditAmount} credits
            </span>
            {bonusCredits > 0 && (
              <span className="badge badge-accent">
                +{bonusCredits} bonus
              </span>
            )}
          </div>
          
          {/* Value per Credit */}
          <div className="text-xs text-neutral-content mt-1">
            {formatPrice(parseFloat(calculateValuePerCredit(pkg.price, totalCredits)))} per credit
          </div>
        </div>

        {/* Features List */}
        <ul className="space-y-2 mb-6">
          {features.map((feature: string, index: number) => (
            <motion.li 
              key={index}
              className="flex items-center text-sm"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <svg className="w-4 h-4 text-primary mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {feature}
            </motion.li>
          ))}
        </ul>

        {/* Special Offers */}
        {pkg.metadata?.discount && (
          <div className="bg-accent/10 rounded-lg p-3 mb-4">
            <div className="text-center text-sm font-medium text-accent">
              💰 {pkg.metadata.discount}% OFF Limited Time!
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="card-actions justify-center">
          <button 
            className={`btn w-full transition-all duration-300 ${
              selected 
                ? 'btn-primary' 
                : pkg.popular 
                  ? 'btn-secondary' 
                  : 'btn-outline btn-primary'
            } ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Processing...
              </>
            ) : selected ? (
              <>
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Selected
              </>
            ) : (
              'Choose Package'
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}