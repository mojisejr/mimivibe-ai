// Test API endpoint for async reading without authentication
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPendingReading, getEstimatedProcessingTime } from "@/lib/database/reading-status";
import { createCategorizedErrorResponse } from "@/lib/errors/categories";
import { ReadingStatus } from "@/types/reading";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  console.log("=== TEST-ASYNC ROUTE CALLED ===");
  try {
    // Create or get test user
    const testUserId = "test-user-123";
    
    console.log("Looking for test user:", testUserId);
    let user = await prisma.user.findUnique({
      where: { id: testUserId }
    });

    if (!user) {
      console.log("Test user not found, creating new user...");
      try {
        // Create test user
        user = await prisma.user.create({
          data: {
            id: testUserId,
            email: "test@example.com",
            name: "Test User",
            stars: 10, // Give some credits for testing
            freePoint: 5,
            coins: 100,
            level: 1,
            exp: 0,
            updatedAt: new Date(),
          }
        });
        console.log("Test user created successfully:", user.id);
      } catch (userCreateError) {
        console.error("Failed to create test user:", userCreateError);
        return NextResponse.json(
          createCategorizedErrorResponse("SYSTEM_ERROR", "/api/readings/test-async"),
          { status: 500 }
        );
      }
    } else {
      console.log("Test user found:", user.id);
    }

    const body = await request.json();
    const { question, type = "general" } = body;

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        createCategorizedErrorResponse("VALIDATION_ERROR", "/api/readings/test-async"),
        { status: 400 }
      );
    }

    // Check if user has enough credits
    if (user.stars < 1 && user.freePoint < 1) {
      return NextResponse.json(
        createCategorizedErrorResponse("INSUFFICIENT_CREDITS", "/api/readings/test-async"),
        { status: 402 }
      );
    }

    // Deduct credits in a transaction
    const result = await prisma.$transaction(async (tx) => {
      let updatedUser;
      let creditType: "stars" | "freePoint";

      if (user.stars > 0) {
        // Use stars first
        updatedUser = await tx.user.update({
          where: { id: user.id },
          data: { 
            stars: { decrement: 1 }
          }
        });
        creditType = "stars";
      } else {
        // Use free points
        updatedUser = await tx.user.update({
          where: { id: user.id },
          data: { 
            freePoint: { decrement: 1 }
          }
        });
        creditType = "freePoint";
      }

      // Create point transaction record
      await tx.pointTransaction.create({
        data: {
          id: `test-${Date.now()}`,
          userId: user.id,
          eventType: "READING_DEDUCT",
          deltaPoint: creditType === "freePoint" ? -1 : 0,
          deltaCoins: 0,
          deltaExp: 0,
          metadata: { 
            question: question.substring(0, 50) + "...",
            creditType 
          }
        }
      });

      return updatedUser;
    });

    // Create pending reading
    console.log("Creating pending reading with data:", { userId: user.id, question, type });
    
    let pendingReading;
    try {
      pendingReading = await createPendingReading(user.id, question, type);
      console.log("Pending reading created:", pendingReading);
    } catch (createError) {
      console.error("Error creating pending reading:", createError);
      return NextResponse.json(
        createCategorizedErrorResponse("SYSTEM_ERROR", "/api/readings/test-async"),
        { status: 500 }
      );
    }

    if (!pendingReading) {
      console.error("createPendingReading returned null/undefined");
      return NextResponse.json(
        createCategorizedErrorResponse("SYSTEM_ERROR", "/api/readings/test-async"),
        { status: 500 }
      );
    }

    // Get estimated processing time
    const estimatedTime = await getEstimatedProcessingTime();

    return NextResponse.json({
      success: true,
      readingId: pendingReading.id,
      status: ReadingStatus.PENDING,
      estimatedCompletionTime: estimatedTime,
      message: "การทำนายของคุณอยู่ในคิวการประมวลผล",
      user: {
        stars: result.stars,
        freePoint: result.freePoint,
        level: result.level
      }
    });

  } catch (error) {
    console.error("Test async reading error:", error);
    return NextResponse.json(
      createCategorizedErrorResponse("SYSTEM_ERROR", "/api/readings/test-async"),
      { status: 500 }
    );
  }
}