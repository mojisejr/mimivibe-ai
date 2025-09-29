/**
 * Async Reading Submission API
 * Part of Task #243: Async Reading System Implementation
 *
 * This endpoint creates a pending reading and returns immediately,
 * allowing background processing to handle the actual reading generation.
 */

import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createPendingReading,
  getEstimatedProcessingTime,
} from "@/lib/database/reading-status";
import { ReadingSubmissionResponse, ReadingStatus } from "@/types/reading";
import { comprehensiveSecurityCheck } from "@/lib/security/ai-protection";
import { createCategorizedErrorResponse } from "@/lib/errors/categories";

// Force dynamic rendering for authentication
export const dynamic = "force-dynamic";

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
          path: "/api/readings/submit",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { question, type = "tarot" } = body;

    // Validate required fields
    if (!question || typeof question !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Bad request",
          message: "Question is required and must be a string",
          timestamp: new Date().toISOString(),
          path: "/api/readings/submit",
        },
        { status: 400 }
      );
    }

    // Sanitize and validate question
    const sanitizedQuestion = question.trim();
    if (sanitizedQuestion.length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: "Bad request",
          message: "Question must be at least 10 characters long",
          timestamp: new Date().toISOString(),
          path: "/api/readings/submit",
        },
        { status: 400 }
      );
    }

    if (sanitizedQuestion.length > 180) {
      return NextResponse.json(
        {
          success: false,
          error: "Bad request",
          message: "Question must be less than 180 characters",
          timestamp: new Date().toISOString(),
          path: "/api/readings/submit",
        },
        { status: 400 }
      );
    }

    // Security validation
    const securityAnalysis = comprehensiveSecurityCheck(sanitizedQuestion);
    if (securityAnalysis.isBlocked) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid question",
          message:
            "คำถามไม่เหมาะสมสำหรับการทำนาย กรุณาใช้คำถามที่สุภาพและเหมาะสม",
          timestamp: new Date().toISOString(),
          path: "/api/readings/submit",
        },
        { status: 400 }
      );
    }

    // Check user exists and has sufficient credits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        freePoint: true,
        stars: true,
        coins: true,
        exp: true,
        level: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
          message: "User account not found",
          timestamp: new Date().toISOString(),
          path: "/api/readings/submit",
        },
        { status: 404 }
      );
    }

    // Check if user has enough credits (validation only, no deduction yet)
    const totalCredits = user.freePoint + user.stars;
    if (totalCredits < 1) {
      return NextResponse.json(
        {
          success: false,
          error: "Insufficient credits",
          message: "ไม่มีเครดิตเพียงพอสำหรับการทำนาย",
          timestamp: new Date().toISOString(),
          path: "/api/readings/submit",
        },
        { status: 400 }
      );
    }

    console.log(
      "💳 Credit validation passed for user:",
      userId,
      "Total credits:",
      totalCredits
    );

    // Create pending reading record
    console.log("🔄 Creating pending reading for user:", userId);
    const reading = await createPendingReading(userId, sanitizedQuestion, type);
    console.log("📝 Pending reading created:", reading ? reading.id : "FAILED");

    if (!reading) {
      console.error("❌ Failed to create pending reading");
      return NextResponse.json(
        createCategorizedErrorResponse(
          "DATABASE_ERROR",
          "/api/readings/submit"
        ),
        { status: 500 }
      );
    }

    // Get estimated processing time
    const estimatedTime = await getEstimatedProcessingTime();
    const estimatedSeconds = Math.ceil(
      (estimatedTime.getTime() - Date.now()) / 1000
    );

    console.log("🚀 Triggering background processing for reading:", reading.id);

    // Trigger background processing (fire and forget)
    fetch(
      `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/api/readings/process`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          readingId: reading.id,
        }),
      }
    )
      .then((response) => {
        console.log(
          "📡 Background processing triggered, status:",
          response.status
        );
        return response.json();
      })
      .then((data) => {
        console.log("📊 Background processing response:", data);
      })
      .catch((error) => {
        console.error("❌ Failed to trigger background processing:", error);
      });

    const response: ReadingSubmissionResponse = {
      success: true,
      data: {
        readingId: reading.id,
        status: ReadingStatus.PENDING,
        estimatedCompletionTime: estimatedSeconds,
        confirmationUrl: `/readings/${reading.id}`,
      },
    };

    console.log("✅ Reading submission completed successfully:", reading.id);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Async reading submission error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Failed to submit reading request",
        timestamp: new Date().toISOString(),
        path: "/api/readings/submit",
      },
      { status: 500 }
    );
  }
}
