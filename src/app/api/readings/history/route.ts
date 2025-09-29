import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ReadingStructure } from "@/types/reading";

// Force dynamic rendering for authentication and request.url
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          message: "Authentication required",
          timestamp: new Date().toISOString(),
          path: "/api/readings/history",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50); // Max 50 per page
    const offset = (page - 1) * limit;

    // Get readings with their associated cards
    const [readings, total] = await Promise.all([
      prisma.reading.findMany({
        where: {
          userId,
          isDeleted: false, // Only show non-deleted readings
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        select: {
          id: true,
          question: true,
          answer: true,
          type: true,
          status: true,
          isReviewed: true,
          isDeleted: true,
          createdAt: true,
          updatedAt: true,
          cards: {
            select: {
              position: true,
              Card: {
                select: {
                  id: true,
                  name: true,
                  displayName: true,
                  arcana: true,
                  shortMeaning: true,
                  keywords: true,
                  imageUrl: true,
                },
              },
            },
            orderBy: { position: "asc" },
          },
          reviews: {
            where: { userId },
            select: {
              id: true,
              accurateLevel: true,
              createdAt: true,
              reviewPeriod: true,
              liked: true,
            },
          },
        },
      }),
      prisma.reading.count({
        where: {
          userId,
          isDeleted: false, // Only count non-deleted readings
        },
      }),
    ]);

    console.log("DEBUG: Raw readings data:", readings);

    // Get review comments from point transactions
    const reviewComments = await Promise.all(
      readings
        .filter((r) => r.reviews.length > 0)
        .map(async (reading) => {
          const transaction = await prisma.pointTransaction.findFirst({
            where: {
              userId,
              eventType: "REVIEW_REWARD",
              metadata: {
                path: ["readingId"],
                equals: reading.id,
              },
            },
            orderBy: { createdAt: "desc" },
          });

          const comment =
            transaction?.metadata &&
            typeof transaction.metadata === "object" &&
            "comment" in transaction.metadata
              ? (transaction.metadata as any).comment
              : null;

          return {
            readingId: reading.id,
            comment,
          };
        })
    );

    const commentMap = new Map(
      reviewComments.map((rc) => [rc.readingId, rc.comment])
    );

    // Format readings for response
    const formattedReadings = readings.map((reading) => {
      // Parse answer from JSON string to ReadingStructure object
      let parsedAnswer: ReadingStructure | null = null;
      if (reading.answer) {
        try {
          // If answer is already an object, use it directly; if it's a string, parse it
          parsedAnswer = typeof reading.answer === 'string' 
            ? JSON.parse(reading.answer) 
            : reading.answer as unknown as ReadingStructure;
        } catch (error) {
          console.error(`Failed to parse answer for reading ${reading.id}:`, error);
          parsedAnswer = null;
        }
      }

      const review = reading.reviews?.[0] || null;
      const reviewComment = commentMap.get(reading.id) || null;

      return {
        id: reading.id,
        question: reading.question,
        answer: parsedAnswer,
        type: reading.type,
        status: reading.status,
        cards: reading.cards.map((rc) => ({
          id: rc.Card.id,
          name: rc.Card.name,
          nameTh: rc.Card.displayName,
          displayName: rc.Card.displayName,
          imageUrl: rc.Card.imageUrl,
          position: rc.position,
          keywords: rc.Card.keywords,
          keywordsTh: rc.Card.keywords,
          meaning: rc.Card.shortMeaning,
          meaningTh: rc.Card.shortMeaning,
          category: rc.Card.arcana,
        })),
        analysis: {
          mood: "neutral", // Default values for compatibility
          topic: "general",
          timeframe: "present",
        },
        createdAt: reading.createdAt.toISOString(),
        expEarned: 15, // Default values for compatibility
        coinsEarned: 3,
        isReviewed: reading.isReviewed, // Use actual value from database
        reviewAccuracy: review?.accurateLevel || undefined,
        reviewComment: reviewComment || undefined,
        reviewData: review
          ? {
              id: review.id,
              accurateLevel: review.accurateLevel,
              createdAt: review.createdAt.toISOString(),
              reviewPeriod: review.reviewPeriod,
              liked: review.liked,
            }
          : null,
      };
    });

    console.log("DEBUG: Formatted readings:", formattedReadings);

    return NextResponse.json({
      success: true,
      data: {
        readings: formattedReadings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasMore: offset + readings.length < total,
        },
      },
    });
  } catch (error) {
    console.error("Reading history fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Failed to fetch reading history",
        timestamp: new Date().toISOString(),
        path: "/api/readings/history",
      },
      { status: 500 }
    );
  }
}

// Get a specific reading by ID
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          message: "Authentication required",
          timestamp: new Date().toISOString(),
          path: "/api/readings/history",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { readingId } = body;

    if (!readingId) {
      return NextResponse.json(
        {
          success: false,
          error: "Bad request",
          message: "Reading ID is required",
          timestamp: new Date().toISOString(),
          path: "/api/readings/history",
        },
        { status: 400 }
      );
    }

    const reading = await prisma.reading.findFirst({
      where: {
        id: readingId,
        userId, // Ensure user can only access their own readings
        isDeleted: false, // Only allow access to non-deleted readings
      },
      select: {
        id: true,
        question: true,
        answer: true,
        type: true,
        isReviewed: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
        cards: {
          select: {
            position: true,
            Card: {
              select: {
                id: true,
                name: true,
                displayName: true,
                arcana: true,
                shortMeaning: true,
                keywords: true,
                imageUrl: true,
              },
            },
          },
          orderBy: { position: "asc" },
        },
      },
    });

    if (!reading) {
      return NextResponse.json(
        {
          success: false,
          error: "Not found",
          message: "Reading not found",
          timestamp: new Date().toISOString(),
          path: "/api/readings/history",
        },
        { status: 404 }
      );
    }

    // Format reading for response
    const readingAnswer = reading.answer as unknown as ReadingStructure;
    const formattedReading = {
      id: reading.id,
      question: reading.question,
      answer: readingAnswer, // Now JSON object instead of string
      type: reading.type,
      cards: reading.cards.map((rc) => ({
        id: rc.Card.id,
        name: rc.Card.name,
        displayName: rc.Card.displayName,
        imageUrl: rc.Card.imageUrl,
        position: rc.position,
      })),
      createdAt: reading.createdAt.toISOString(),
      updatedAt: reading.updatedAt.toISOString(),
      isReviewed: reading.isReviewed,
      isDeleted: reading.isDeleted,
    };

    return NextResponse.json({
      success: true,
      data: formattedReading,
    });
  } catch (error) {
    console.error("Reading fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Failed to fetch reading",
        timestamp: new Date().toISOString(),
        path: "/api/readings/history",
      },
      { status: 500 }
    );
  }
}
