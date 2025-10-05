"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const ioredis_1 = require("ioredis");
const prisma_1 = require("@/lib/prisma");
const reading_processor_1 = require("@/lib/background/reading-processor");
// Redis connection configuration
const redis = new ioredis_1.Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    lazyConnect: true,
});
// Worker configuration
const WORKER_CONFIG = {
    connection: redis,
    removeOnComplete: { count: 10 },
    removeOnFail: { count: 5 },
    concurrency: 2,
    stalledInterval: 30000,
    maxStalledCount: 1,
};
/**
 * Process a tarot reading job
 */
async function processTarotReading(job) {
    const { id: readingId, userId, question, sessionId } = job.data;
    try {
        console.log(`Processing tarot reading job: ${job.id} for user: ${userId}`);
        // Validate readingId exists
        if (!readingId) {
            throw new Error('Reading ID is required');
        }
        // Validate user exists
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new Error(`User not found: ${userId}`);
        }
        // Process the reading using the existing processor
        const success = await (0, reading_processor_1.processReading)(readingId);
        if (!success) {
            throw new Error('Reading processing failed');
        }
        // Fetch the completed reading from database
        const reading = await prisma_1.prisma.reading.findUnique({
            where: { id: readingId },
            include: {
                user: {
                    select: { id: true, name: true }
                }
            }
        });
        if (!reading || !reading.readingData) {
            throw new Error('Reading not found or incomplete');
        }
        const readingData = reading.readingData;
        return {
            success: true,
            reading: {
                id: reading.id,
                question: reading.question,
                cards: readingData.cards || [],
                interpretation: readingData.reading?.interpretation || '',
                mood: readingData.questionAnalysis?.mood || '',
                topic: readingData.questionAnalysis?.topic || '',
                period: readingData.questionAnalysis?.period || '',
            }
        };
    }
    catch (error) {
        console.error(`❌ [WORKER] Error processing reading ${readingId}:`, error);
        return {
            success: false,
            error: {
                code: 'PROCESSING_ERROR',
                message: error instanceof Error ? error.message : 'Unknown error',
                details: { readingId, userId, sessionId }
            }
        };
    }
}
// Create the worker
const tarotWorker = new bullmq_1.Worker('tarot-reading', processTarotReading, WORKER_CONFIG);
// Event handlers
tarotWorker.on('completed', (job, result) => {
    console.log(`✅ [WORKER] Job completed: ${job.id}`, { success: result.success });
});
tarotWorker.on('failed', (job, err) => {
    console.error(`❌ [WORKER] Job failed: ${job?.id}`, err.message);
});
tarotWorker.on('stalled', (jobId) => {
    console.warn(`⚠️ [WORKER] Job stalled: ${jobId}`);
});
tarotWorker.on('error', (err) => {
    console.error('❌ [WORKER] Worker error:', err);
});
// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('🛑 [WORKER] Shutting down gracefully...');
    await tarotWorker.close();
    await redis.quit();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('🛑 [WORKER] Shutting down gracefully...');
    await tarotWorker.close();
    await redis.quit();
    process.exit(0);
});
exports.default = tarotWorker;
//# sourceMappingURL=tarot-worker.js.map