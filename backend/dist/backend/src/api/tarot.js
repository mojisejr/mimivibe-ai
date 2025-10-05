"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitTarotReading = submitTarotReading;
exports.getJobStatus = getJobStatus;
exports.getQueueStats = getQueueStats;
const bullmq_1 = require("bullmq");
const ioredis_1 = require("ioredis");
const zod_1 = require("zod");
const redis = new ioredis_1.Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const tarotQueue = new bullmq_1.Queue('tarot-readings', { connection: redis });
// Validation schema for tarot reading submission
const submitReadingSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1),
    question: zod_1.z.string().min(1).max(500),
    cardCount: zod_1.z.number().min(1).max(5).default(3),
    sessionId: zod_1.z.string().optional(),
});
async function submitTarotReading(req, res) {
    try {
        // Validate request body
        const validatedData = submitReadingSchema.parse(req.body);
        // Create job data
        const jobData = {
            userId: validatedData.userId,
            question: validatedData.question,
            cardCount: validatedData.cardCount,
            sessionId: validatedData.sessionId,
            timestamp: new Date().toISOString(),
        };
        // Add job to queue with options
        const job = await tarotQueue.add('process-tarot-reading', jobData, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 2000,
            },
            removeOnComplete: 50, // Keep last 50 completed jobs
            removeOnFail: 20, // Keep last 20 failed jobs
        });
        const response = {
            success: true,
            jobId: job.id,
            message: 'Tarot reading job submitted successfully',
            estimatedWaitTime: 30, // seconds
        };
        res.status(202).json(response);
        return;
    }
    catch (error) {
        console.error('Submit tarot reading error:', error);
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors,
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: 'Failed to submit tarot reading job',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
        return;
    }
}
async function getJobStatus(req, res) {
    try {
        const { jobId } = req.params;
        if (!jobId) {
            res.status(400).json({
                success: false,
                error: 'Job ID is required',
            });
            return;
        }
        // Get job from queue
        const job = await tarotQueue.getJob(jobId);
        if (!job) {
            res.status(404).json({
                success: false,
                error: 'Job not found',
            });
            return;
        }
        // Get job state and progress
        const state = await job.getState();
        const progress = job.progress;
        const result = job.returnvalue;
        const failedReason = job.failedReason;
        let status;
        switch (state) {
            case 'waiting':
            case 'delayed':
                status = 'pending';
                break;
            case 'active':
                status = 'processing';
                break;
            case 'completed':
                status = 'completed';
                break;
            case 'failed':
                status = 'failed';
                break;
            default:
                status = 'pending';
        }
        const response = {
            success: true,
            jobId,
            status,
            progress: typeof progress === 'number' ? progress : 0,
            result: status === 'completed' ? result : undefined,
            error: status === 'failed' ? failedReason : undefined,
            createdAt: new Date(job.timestamp).toISOString(),
            updatedAt: new Date(job.processedOn || job.timestamp).toISOString(),
        };
        res.json(response);
        return;
    }
    catch (error) {
        console.error('Get job status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get job status',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
        return;
    }
}
// Get queue statistics (admin endpoint)
async function getQueueStats(req, res) {
    try {
        const [waiting, active, completed, failed, delayed] = await Promise.all([
            tarotQueue.getWaiting(),
            tarotQueue.getActive(),
            tarotQueue.getCompleted(),
            tarotQueue.getFailed(),
            tarotQueue.getDelayed(),
        ]);
        res.json({
            success: true,
            stats: {
                waiting: waiting.length,
                active: active.length,
                completed: completed.length,
                failed: failed.length,
                delayed: delayed.length,
                paused: 0, // BullMQ doesn't have getPaused method
            },
            jobs: {
                waiting: waiting.slice(0, 10).map((job) => ({
                    id: job.id,
                    data: job.data,
                    timestamp: job.timestamp,
                })),
                active: active.slice(0, 10).map((job) => ({
                    id: job.id,
                    data: job.data,
                    progress: job.progress,
                    timestamp: job.timestamp,
                })),
            },
        });
        return;
    }
    catch (error) {
        console.error('Get queue stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get queue statistics',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
        return;
    }
}
//# sourceMappingURL=tarot.js.map