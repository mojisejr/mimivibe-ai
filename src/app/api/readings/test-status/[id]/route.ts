/**
 * Test Status API endpoint without authentication
 * For testing async reading status functionality
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createCategorizedErrorResponse } from "@/lib/errors/categories";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const readingId = params.id;

    if (!readingId) {
      return NextResponse.json(
        createCategorizedErrorResponse("VALIDATION_ERROR", "/api/readings/test-status"),
        { status: 400 }
      );
    }

    // Find the reading
    const reading = await prisma.reading.findUnique({
      where: { id: readingId },
      select: {
        id: true,
        status: true,
        processingStartedAt: true,
        processingCompletedAt: true,
        errorMessage: true,
        question: true,
        type: true,
        createdAt: true,
        updatedAt: true,
        answer: true,
        cards: {
          select: {
            id: true,
            position: true,
            Card: {
              select: {
                id: true,
                name: true,
                displayName: true,
                shortMeaning: true,
                longMeaning: true,
              }
            }
          }
        },
      }
    });

    if (!reading) {
      return NextResponse.json(
        createCategorizedErrorResponse("NOT_FOUND", "/api/readings/test-status"),
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      reading: {
        id: reading.id,
        status: reading.status,
        processingStartedAt: reading.processingStartedAt,
        processingCompletedAt: reading.processingCompletedAt,
        errorMessage: reading.errorMessage,
        question: reading.question,
        type: reading.type,
        createdAt: reading.createdAt,
        updatedAt: reading.updatedAt,
        answer: reading.answer,
        cards: reading.cards,
      }
    });

  } catch (error) {
    console.error("Test status check error:", error);
    
    return NextResponse.json(
      createCategorizedErrorResponse("SYSTEM_ERROR", "/api/readings/test-status"),
      { status: 500 }
    );
  }
}