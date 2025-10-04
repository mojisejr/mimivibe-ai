import { Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { prisma } from '@/lib/prisma';
import { processReading } from '@/lib/background/reading-processor';
import { TarotReadingJob, TarotReadingJobResult } from '@shared/types/queue';

// Redis connection configuration
const redis = new Redis({
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
async function processTarotReading(job: Job<TarotReadingJob>): Promise<TarotReadingJobResult> {
  const { id: readingId, userId, question, sessionId } = job.data;

  try {
    console.log(`Processing tarot reading job: ${job.id} for user: ${userId}`);
    
    // Validate readingId exists
    if (!readingId) {
      throw new Error('Reading ID is required');
    }
    
    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }
    
    // Process the reading using the existing processor
    const success = await processReading(readingId);
    
    if (!success) {
      throw new Error('Reading processing failed');
    }
    
    // Fetch the completed reading from database
    const reading = await prisma.reading.findUnique({
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
    
    const readingData = reading.readingData as any;
    
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
    
  } catch (error) {
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
const tarotWorker = new Worker('tarot-reading', processTarotReading, WORKER_CONFIG);

// Event handlers
tarotWorker.on('completed', (job: Job, result: TarotReadingJobResult) => {
  console.log(`✅ [WORKER] Job completed: ${job.id}`, { success: result.success });
});

tarotWorker.on('failed', (job: Job | undefined, err: Error) => {
  console.error(`❌ [WORKER] Job failed: ${job?.id}`, err.message);
});

tarotWorker.on('stalled', (jobId: string) => {
  console.warn(`⚠️ [WORKER] Job stalled: ${jobId}`);
});

tarotWorker.on('error', (err: Error) => {
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

export default tarotWorker;