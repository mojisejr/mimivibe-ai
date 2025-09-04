import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateReferralCode } from "@/lib/utils/referrals";
// Gamification config removed during refactor

// Force dynamic rendering for database access
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referralCode, newUserId } = body;

    if (!referralCode || !newUserId) {
      return NextResponse.json(
        { error: "Referral code and new user ID required" },
        { status: 400 }
      );
    }

    // Find referral code
    const referral = await prisma.referralCode.findUnique({
      where: { code: referralCode },
      include: { user: true },
    });

    if (!referral) {
      return NextResponse.json(
        { error: "Invalid referral code" },
        { status: 404 }
      );
    }

    if (referral.userId === newUserId) {
      return NextResponse.json(
        { error: "Cannot use own referral code" },
        { status: 400 }
      );
    }

    // Check if new user already has a referral
    const existingReferral = await prisma.referralCode.findFirst({
      where: { userId: newUserId, referredBy: { not: null } },
    });

    if (existingReferral) {
      return NextResponse.json(
        { error: "User already referred" },
        { status: 409 }
      );
    }

    // Referral rewards removed during gamification refactor
    const referrerReward = { exp: 25, coins: 0, stars: 1 };
    const referredReward = { exp: 0, coins: 5, stars: 1 };

    // Process referral
    await prisma.$transaction(async (tx) => {
      // Create referral record for new user
      await tx.referralCode.create({
        data: {
          userId: newUserId,
          code: generateReferralCode(newUserId),
          referredBy: referral.userId,
          isUsed: true,
          usedAt: new Date(),
        },
      });

      // Note: Referrer reward will be given later when referral completes first reading
      // This is handled by /api/referrals/claim-first-reading endpoint

      // Reward referred user (immediate signup bonus)
      await tx.user.update({
        where: { id: newUserId },
        data: {
          exp: { increment: referredReward.exp },
          coins: { increment: referredReward.coins },
          stars: { increment: referredReward.stars },
        },
      });

      // Record transaction for referred user signup bonus
      await tx.pointTransaction.create({
        data: {
          id: `referral_welcome_${newUserId}_${Date.now()}`,
          userId: newUserId,
          eventType: "REFERRAL_WELCOME",
          deltaPoint: referredReward.stars,
          deltaCoins: referredReward.coins,
          deltaExp: referredReward.exp,
          metadata: { referredBy: referral.userId, rewardType: "signup_bonus" },
        },
      });
    });

    // Achievement system removed during refactor

    return NextResponse.json({
      success: true,
      data: {
        referrerReward: {
          note: "Referrer will receive reward when referral completes first reading",
          ...referrerReward,
        },
        referredReward,
      },
    });
  } catch (error) {
    console.error("Process referral error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
