import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// Gamification config removed during refactor

// Force dynamic rendering for authentication
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { coinAmount, targetCurrency } = body;

    if (targetCurrency !== "STARS") {
      return NextResponse.json(
        { error: "Only STARS exchange supported" },
        { status: 400 }
      );
    }

    if (!coinAmount || coinAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid coin amount" },
        { status: 400 }
      );
    }

    // Exchange config removed during gamification refactor
    const rate = 15; // 15 coins = 1 free point
    const dailyLimit = 100; // max 100 free points per day
    const minExchange = 15; // minimum 15 coins

    if (coinAmount < minExchange) {
      return NextResponse.json(
        { error: `Minimum exchange is ${minExchange} coins` },
        { status: 400 }
      );
    }

    const starsToReceive = Math.floor(coinAmount / rate);

    // Check daily limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayExchanges = await prisma.pointTransaction.aggregate({
      where: {
        userId,
        eventType: "COIN_TO_STAR",
        createdAt: { gte: today },
      },
      _sum: { deltaPoint: true },
    });

    const todayStarsExchanged = todayExchanges._sum.deltaPoint || 0;

    if (todayStarsExchanged + starsToReceive > dailyLimit) {
      return NextResponse.json(
        { error: "Daily exchange limit exceeded" },
        { status: 429 }
      );
    }

    // Check user has enough coins
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { coins: true, stars: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.coins < coinAmount) {
      return NextResponse.json(
        { error: "Insufficient coins" },
        { status: 400 }
      );
    }

    // Perform exchange
    const coinsToSpend = starsToReceive * rate;
    const transactionId = `coin_exchange_${userId}_${Date.now()}`;

    await prisma.$transaction(async (tx) => {
      // Update user balances
      await tx.user.update({
        where: { id: userId },
        data: {
          coins: { decrement: coinsToSpend },
          stars: { increment: starsToReceive },
          updatedAt: new Date(),
        },
      });

      // Record transaction
      await tx.pointTransaction.create({
        data: {
          id: transactionId,
          userId,
          eventType: "COIN_TO_STAR",
          deltaPoint: starsToReceive,
          deltaCoins: -coinsToSpend,
          deltaExp: 0,
          metadata: {
            exchangeRate: rate,
            coinsSpent: coinsToSpend,
            starsReceived: starsToReceive,
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        exchanged: {
          coinsSpent: coinsToSpend,
          starsReceived: starsToReceive,
          rate,
        },
        newBalances: {
          coins: user.coins - coinsToSpend,
          stars: user.stars + starsToReceive,
        },
        transaction: {
          id: transactionId,
          createdAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Coin exchange error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
