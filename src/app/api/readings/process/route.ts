/**
 * API endpoint to trigger background reading processing
 * Part of Task #243: Async Reading System Implementation
 */

import { NextRequest, NextResponse } from "next/server";
import { processPendingReadings, processReading } from "@/lib/background/reading-processor";

// Force dynamic rendering and prevent caching for cron jobs
export const dynamic = "force-dynamic";
export const revalidate = 0;

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
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  try {
    // Enhanced logging for debugging
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const referer = request.headers.get('referer') || 'none';
    
    console.log(`🔍 [CRON-DEBUG] ${timestamp} - GET request received`);
    console.log(`🔍 [CRON-DEBUG] User-Agent: ${userAgent}`);
    console.log(`🔍 [CRON-DEBUG] IP: ${ip}`);
    console.log(`🔍 [CRON-DEBUG] Referer: ${referer}`);
    
    // Check if this is a cron job request by looking at headers
    const isCronJob = userAgent.includes('vercel') || userAgent.includes('cron');
    
    console.log(`🔍 [CRON-DEBUG] Is Vercel Cron: ${isCronJob}`);
    
    if (isCronJob) {
      console.log("🤖 [CRON-START] Vercel cron job detected - starting authentication");
      
      // Verify CRON_SECRET for security
      const cronSecret = request.headers.get("authorization") || 
                        request.nextUrl.searchParams.get("secret");
      const expectedSecret = process.env.CRON_SECRET;

      console.log(`🔍 [CRON-DEBUG] CRON_SECRET configured: ${!!expectedSecret}`);
      console.log(`🔍 [CRON-DEBUG] Secret provided: ${!!cronSecret}`);

      if (!expectedSecret) {
        console.warn("⚠️ [CRON-WARN] CRON_SECRET not configured - cron job authentication disabled");
      } else if (cronSecret !== expectedSecret) {
        console.error("🚫 [CRON-ERROR] Invalid CRON_SECRET provided for cron job");
        console.error(`🚫 [CRON-ERROR] Expected length: ${expectedSecret.length}, Provided length: ${cronSecret?.length || 0}`);
        return NextResponse.json(
          { error: "Unauthorized - Invalid CRON_SECRET" },
          { status: 401 }
        );
      }

      console.log("✅ [CRON-AUTH] Authentication successful - proceeding with processing");
      
      // Process pending readings with default batch size
      const batchSize = 5;
      console.log(`🤖 [CRON-PROCESS] Starting pending readings processing (batch size: ${batchSize})`);
      const result = await processPendingReadings(batchSize);
      
      const executionTime = Date.now() - startTime;
      console.log(`✅ [CRON-COMPLETE] Processing completed in ${executionTime}ms`);
      console.log(`📊 [CRON-STATS] Processed: ${result.processed}, Failed: ${result.failed}`);

      return NextResponse.json({
        success: true,
        message: `Cron job processed ${result.processed} readings`,
        stats: result,
        cronJob: true,
        executionTime: `${executionTime}ms`,
        timestamp: timestamp,
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