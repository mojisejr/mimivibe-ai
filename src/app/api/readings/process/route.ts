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
    console.log("🎯 [PROCESS-API] Processing endpoint called");
    let body: { batchSize?: number; readingId?: string } = {};
    
    // Handle empty request body gracefully
    try {
      const text = await request.text();
      if (text.trim()) {
        body = JSON.parse(text);
      }
    } catch (parseError) {
      console.log("No JSON body provided, using defaults");
    }
    
    console.log("📋 [PROCESS-API] Request body:", body);
    const { 
      batchSize = 5, 
      readingId 
    } = body;

    // Process specific reading if readingId is provided
    if (readingId) {
      console.log(`🔍 [PROCESS-API] Processing specific reading: ${readingId}`);
      const success = await processReading(readingId);
      console.log(`📊 [PROCESS-API] Processing result for ${readingId}:`, success);
      
      return NextResponse.json({
        success,
        message: success 
          ? `Reading ${readingId} processed successfully`
          : `Failed to process reading ${readingId}`,
        readingId,
      });
    }

    // Process batch of pending readings
    console.log(`📦 [PROCESS-API] Processing pending readings with batch size: ${batchSize}`);
    const result = await processPendingReadings(batchSize);
    console.log(`📊 [PROCESS-API] Batch processing result:`, result);

    return NextResponse.json({
      success: true,
      message: `Processed ${result.processed} readings`,
      stats: result,
    });

  } catch (error) {
    console.error("❌ [PROCESS-API] Reading processing error:", error);
    
    return NextResponse.json({
      success: false,
      error: "Failed to process readings",
      message: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}

/**
 * GET /api/readings/process
 * Trigger processing of pending readings (for Vercel cron jobs)
 * Also returns processing statistics
 */
export async function GET(request: NextRequest) {
  try {
    console.log("🎯 [PROCESS-API-GET] Cron job triggered processing endpoint");
    
    // Check if this is a cron job request by looking at headers
    const userAgent = request.headers.get('user-agent') || '';
    const isCronJob = userAgent.includes('vercel') || userAgent.includes('cron');
    
    if (isCronJob) {
      console.log("🤖 [PROCESS-API-GET] Detected Vercel cron job request");
      
      // Process pending readings with default batch size
      const batchSize = 5;
      console.log(`📦 [PROCESS-API-GET] Processing pending readings with batch size: ${batchSize}`);
      const result = await processPendingReadings(batchSize);
      console.log(`📊 [PROCESS-API-GET] Cron processing result:`, result);

      return NextResponse.json({
        success: true,
        message: `Cron job processed ${result.processed} readings`,
        stats: result,
        cronJob: true,
        timestamp: new Date().toISOString(),
      });
    }

    // For regular GET requests, just return statistics
    const { getProcessingStats } = await import("@/lib/database/reading-status");
    const stats = await getProcessingStats();

    return NextResponse.json({
      success: true,
      stats,
      cronJob: false,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("❌ [PROCESS-API-GET] Processing error:", error);
    
    return NextResponse.json({
      success: false,
      error: "Failed to process readings",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}