/**
 * Campaign Styling Utilities
 * 
 * Centralized styling patterns and utilities for the first payment campaign feature.
 * Ensures consistent styling across homepage and packages page components.
 */

import { type MotionProps } from "framer-motion";

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

/**
 * Standardized fade-in animation for campaign elements
 */
export const campaignFadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" as const },
};

/**
 * Card hover animation with consistent timing
 */
export const campaignCardHover = {
  hover: {
    y: -8,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

/**
 * Campaign banner entrance animation
 */
export const campaignBannerAnimation = {
  initial: { opacity: 0, y: -20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

/**
 * Staggered children animation for package grids
 */
export const campaignStaggerChildren = {
  animate: {
    transition: { staggerChildren: 0.2 },
  },
};

// ============================================================================
// STYLING CLASSES
// ============================================================================

/**
 * Campaign banner styling with improved contrast
 * Using solid background for better WCAG compliance
 */
export const campaignBannerClasses = {
  base: "alert max-w-4xl mx-auto mb-6 border-2 transition-all duration-300",
  success: "alert-success bg-success/90 border-success/50 backdrop-blur-sm",
  gradient: "bg-gradient-to-r from-success/95 to-primary/95 border-success/40",
  text: {
    title: "font-bold text-lg text-white drop-shadow-sm",
    subtitle: "text-sm text-white/90 drop-shadow-sm",
    urgency: "text-xs text-white/80 drop-shadow-sm",
  },
} as const;

/**
 * Discount badge styling with consistent positioning
 */
export const discountBadgeClasses = {
  container: "absolute z-10",
  positions: {
    topCenter: "-top-4 left-1/2 transform -translate-x-1/2",
    topRight: "-top-4 right-4",
    topLeft: "-top-4 left-4",
  },
  badge: {
    discount: "badge badge-error badge-lg animate-pulse shadow-lg",
    popular: "badge badge-accent badge-lg shadow-lg",
  },
} as const;

/**
 * Package card styling with campaign variations
 */
export const packageCardClasses = {
  base: "card transition-all duration-300",
  variants: {
    default: "border-2 border-base-300 shadow-xl hover:shadow-2xl",
    popular: "border-2 border-primary shadow-2xl hover:shadow-3xl bg-gradient-to-br from-primary/5 to-secondary/5",
    discounted: "ring-2 ring-success ring-opacity-60 shadow-2xl hover:shadow-3xl border-2 border-success/30",
  },
  backgrounds: {
    default: "bg-gradient-to-br from-base-100 to-base-200",
    primary: "bg-gradient-to-br from-primary/10 to-secondary/10",
    success: "bg-gradient-to-br from-success/5 to-primary/5",
  },
} as const;

/**
 * Price display styling with improved hierarchy
 */
export const priceDisplayClasses = {
  container: "space-y-1",
  original: "text-lg text-base-content/60 line-through font-medium",
  discounted: "text-3xl font-bold text-success drop-shadow-sm",
  savings: "text-sm text-success font-semibold",
  regular: "text-3xl font-bold text-primary",
  colors: {
    primary: "text-primary",
    secondary: "text-secondary", 
    accent: "text-accent",
    success: "text-success",
  },
} as const;

/**
 * Button styling with campaign variations
 */
export const campaignButtonClasses = {
  base: "btn w-full shadow-lg transition-all duration-200",
  variants: {
    discounted: "btn-success hover:btn-success focus:btn-success",
    popular: "btn-primary hover:btn-primary focus:btn-primary",
    outline: "btn-outline hover:scale-[1.02] focus:scale-[1.02]",
  },
  outlineVariants: {
    primary: "btn-outline btn-primary",
    secondary: "btn-outline btn-secondary",
    accent: "btn-outline btn-accent",
  },
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get package icon based on index
 */
export const getPackageIcon = (index: number): string => {
  const icons = ["⭐", "💎", "👑"];
  return icons[index] || "🎁";
};

/**
 * Generate package card styling classes based on state
 */
export const getPackageCardStyle = (
  index: number, 
  isPopular: boolean = false, 
  hasDiscount: boolean = false
): string => {
  let classes = packageCardClasses.base;
  
  if (hasDiscount) {
    classes += ` ${packageCardClasses.variants.discounted} ${packageCardClasses.backgrounds.success}`;
  } else if (isPopular) {
    classes += ` ${packageCardClasses.variants.popular} ${packageCardClasses.backgrounds.primary}`;
  } else {
    classes += ` ${packageCardClasses.variants.default} ${packageCardClasses.backgrounds.default}`;
  }
  
  return classes;
};

/**
 * Generate button styling classes based on state
 */
export const getPackageButtonStyle = (
  index: number,
  isPopular: boolean = false,
  hasDiscount: boolean = false
): string => {
  let classes = campaignButtonClasses.base;
  
  if (hasDiscount) {
    classes += ` ${campaignButtonClasses.variants.discounted}`;
  } else if (isPopular) {
    classes += ` ${campaignButtonClasses.variants.popular}`;
  } else {
    const outlineVariants = Object.values(campaignButtonClasses.outlineVariants);
    classes += ` ${campaignButtonClasses.variants.outline} ${outlineVariants[index] || outlineVariants[0]}`;
  }
  
  return classes;
};

/**
 * Generate price color classes based on package state
 */
export const getPriceColorClass = (
  index: number,
  isPopular: boolean = false,
  hasDiscount: boolean = false
): string => {
  if (hasDiscount) return priceDisplayClasses.colors.success;
  if (isPopular) return priceDisplayClasses.colors.primary;
  
  const colors = [
    priceDisplayClasses.colors.primary,
    priceDisplayClasses.colors.secondary,
    priceDisplayClasses.colors.accent,
  ];
  return colors[index] || colors[0];
};

/**
 * Generate discount badge position classes
 */
export const getDiscountBadgePosition = (position: 'topCenter' | 'topRight' | 'topLeft' = 'topRight'): string => {
  return `${discountBadgeClasses.container} ${discountBadgeClasses.positions[position]}`;
};

// ============================================================================
// ACCESSIBILITY UTILITIES
// ============================================================================

/**
 * ARIA labels for campaign elements
 */
export const campaignAriaLabels = {
  discountBadge: (percentage: number) => `${percentage} percent discount available`,
  campaignBanner: "Special discount offer for new customers",
  discountedPrice: (original: number, discounted: number, savings: number) => 
    `Discounted price ${discounted} baht, originally ${original} baht, save ${savings} baht`,
  campaignButton: (discount: number) => `Purchase with ${discount}% discount for first-time buyers`,
} as const;

/**
 * Generate reduced motion variants for accessibility
 * Detects user's motion preference and provides appropriate animations
 */
export const getReducedMotionVariants = (enableMotion: boolean = true): MotionProps => {
  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (!enableMotion || prefersReducedMotion) {
    return {
      initial: { opacity: 0.8 },
      animate: { opacity: 1 },
      transition: { duration: 0.1 },
    };
  }
  
  return campaignFadeInUp;
};

/**
 * Reduced motion variants for different animation types
 */
export const reducedMotionVariants = {
  fadeIn: {
    initial: { opacity: 0.8 },
    animate: { opacity: 1 },
    transition: { duration: 0.1 },
  },
  slideUp: {
    initial: { opacity: 0.8, y: 4 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.15 },
  },
  scale: {
    initial: { opacity: 0.8, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.1 },
  },
} as const;

// ============================================================================
// RESPONSIVE UTILITIES
// ============================================================================

/**
 * Responsive spacing classes for campaign elements
 */
export const campaignSpacing = {
  container: "px-4 sm:px-6 lg:px-8",
  grid: "gap-6 md:gap-8",
  section: "mb-8 md:mb-12",
  card: "p-6 md:p-8",
} as const;

/**
 * Responsive text sizes for campaign content
 */
export const campaignTypography = {
  bannerTitle: "text-lg md:text-xl font-bold",
  bannerSubtitle: "text-sm md:text-base",
  bannerUrgency: "text-xs md:text-sm",
  cardTitle: "text-xl md:text-2xl font-bold",
  price: "text-2xl md:text-3xl font-bold",
  savings: "text-sm md:text-base",
} as const;