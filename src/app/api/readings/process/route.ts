/**
 * API endpoint to trigger background reading processing
 * Part of Task #243: Async Reading System Implementation
 */

import { NextRequest, NextResponse } from "next/server";
import { processPendingReadings, processReading } from "@/lib/background/reading-processor";

// Force dynamic rendering
export const dynamic = "force-dynamic";

/**
 * POST /api/readings/process
 * Trigger processing of pending readings
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      batchSize = 5, 
      readingId 
    } = body;

    // Process specific reading if readingId is provided
    if (readingId) {
      console.log(`🎯 Processing specific reading: ${readingId}`);
      const success = await processReading(readingId);
      
      return NextResponse.json({
        success,
        message: success 
          ? `Reading ${readingId} processed successfully`
          : `Failed to process reading ${readingId}`,
        readingId,
      });
    }

    // Process batch of pending readings
    console.log(`🚀 Processing batch of pending readings (size: ${batchSize})`);
    const result = await processPendingReadings(batchSize);

    return NextResponse.json({
      success: true,
      message: `Processed ${result.processed} readings`,
      stats: result,
    });

  } catch (error) {
    console.error("Reading processing error:", error);
    
    return NextResponse.json({
      success: false,
      error: "Failed to process readings",
      message: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}

/**
 * GET /api/readings/process
 * Get processing statistics
 */
export async function GET() {
  try {
    const { getProcessingStats } = await import("@/lib/database/reading-status");
    const stats = await getProcessingStats();

    return NextResponse.json({
      success: true,
      stats,
    });

  } catch (error) {
    console.error("Failed to get processing stats:", error);
    
    return NextResponse.json({
      success: false,
      error: "Failed to get processing statistics",
      message: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}