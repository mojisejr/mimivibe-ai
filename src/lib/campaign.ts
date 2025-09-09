import { prisma } from '@/lib/prisma';

/**
 * Campaign service for managing first payment campaign
 */

export interface CampaignEligibility {
  eligible: boolean;
  campaign?: {
    id: string;
    name: string;
    discountPercentage: number;
    marketingMessage: string;
    bannerText: string;
    urgencyText: string;
    ctaText: string;
  };
  reason?: string;
}

/**
 * Check if a user is eligible for the first payment campaign
 */
export async function checkFirstPaymentCampaignEligibility(userId: string): Promise<CampaignEligibility> {
  try {
    // 1. Check if campaign is active
    const campaign = await prisma.campaignTemplate.findFirst({
      where: { 
        type: 'first_payment_discount', 
        isActive: true 
      }
    });

    if (!campaign) {
      return {
        eligible: false,
        reason: 'Campaign is not active'
      };
    }

    // 2. Check if user has made any successful payments
    const paymentCount = await prisma.paymentHistory.count({
      where: { 
        userId, 
        status: 'succeeded' 
      }
    });

    if (paymentCount > 0) {
      return {
        eligible: false,
        reason: 'User has already made a payment'
      };
    }

    // 3. User is eligible - extract campaign details
    const rewards = campaign.rewards as any;
    const metadata = campaign.metadata as any;

    return {
      eligible: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        discountPercentage: rewards.discountPercentage,
        marketingMessage: metadata.marketingMessage,
        bannerText: metadata.bannerText,
        urgencyText: metadata.urgencyText,
        ctaText: metadata.ctaText
      }
    };

  } catch (error) {
    console.error('Error checking campaign eligibility:', error);
    return {
      eligible: false,
      reason: 'Error checking eligibility'
    };
  }
}

/**
 * Calculate discounted price for campaign
 */
export function calculateCampaignPrice(originalPrice: number, discountPercentage: number): number {
  const discount = Math.floor(originalPrice * (discountPercentage / 100));
  return originalPrice - discount;
}

/**
 * Get campaign configuration by type
 */
export async function getCampaignByType(type: string) {
  return await prisma.campaignTemplate.findFirst({
    where: { 
      type,
      isActive: true 
    }
  });
}

/**
 * Mark campaign as used by user (after successful payment)
 */
export async function markCampaignUsed(userId: string, campaignId: string, paymentId: string) {
  try {
    // This is tracked through PaymentHistory - first payment automatically
    // disqualifies user from future campaign eligibility
    console.log(`Campaign ${campaignId} used by user ${userId} for payment ${paymentId}`);
    return true;
  } catch (error) {
    console.error('Error marking campaign as used:', error);
    return false;
  }
}

/**
 * Admin function to toggle campaign status
 */
export async function toggleCampaignStatus(campaignId: string, isActive: boolean) {
  try {
    const campaign = await prisma.campaignTemplate.update({
      where: { id: campaignId },
      data: { isActive, updatedAt: new Date() }
    });
    return campaign;
  } catch (error) {
    console.error('Error toggling campaign status:', error);
    throw error;
  }
}

/**
 * Get campaign analytics
 */
export async function getCampaignAnalytics(campaignId: string) {
  try {
    // Get total eligible users (users with no successful payments)
    const eligibleUsers = await prisma.user.count({
      where: {
        PaymentHistory: {
          none: {
            status: 'succeeded'
          }
        }
      }
    });

    // Get users who have made their first payment (campaign conversions)
    const conversions = await prisma.paymentHistory.count({
      where: {
        status: 'succeeded',
        user: {
          PaymentHistory: {
            none: {
              id: {
                not: undefined
              },
              createdAt: {
                lt: new Date() // This is their first payment
              }
            }
          }
        }
      }
    });

    const conversionRate = eligibleUsers > 0 ? (conversions / eligibleUsers) * 100 : 0;

    return {
      eligibleUsers,
      conversions,
      conversionRate: Math.round(conversionRate * 100) / 100
    };
  } catch (error) {
    console.error('Error getting campaign analytics:', error);
    throw error;
  }
}