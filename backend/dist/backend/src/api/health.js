"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = healthCheck;
exports.readiness = readiness;
exports.liveness = liveness;
const ioredis_1 = require("ioredis");
const client_1 = require("@prisma/client");
const bullmq_1 = require("bullmq");
const redis = new ioredis_1.Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const prisma = new client_1.PrismaClient();
const tarotQueue = new bullmq_1.Queue('tarot-readings', { connection: redis });
async function healthCheck(req, res) {
    const startTime = Date.now();
    try {
        // Check Redis connection
        let redisStatus = 'down';
        try {
            await redis.ping();
            redisStatus = 'up';
        }
        catch (error) {
            console.error('Redis health check failed:', error);
        }
        // Check Database connection
        let databaseStatus = 'down';
        try {
            await prisma.$queryRaw `SELECT 1`;
            databaseStatus = 'up';
        }
        catch (error) {
            console.error('Database health check failed:', error);
        }
        // Check AI services (basic check)
        let aiStatus = 'up';
        if (!process.env.OPENAI_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            aiStatus = 'down';
        }
        // Get queue statistics
        let queueStats;
        try {
            const [waiting, active, completed, failed, delayed] = await Promise.all([
                tarotQueue.getWaiting(),
                tarotQueue.getActive(),
                tarotQueue.getCompleted(),
                tarotQueue.getFailed(),
                tarotQueue.getDelayed(),
            ]);
            queueStats = {
                waiting: waiting.length,
                active: active.length,
                completed: completed.length,
                failed: failed.length,
                delayed: delayed.length,
                paused: 0, // BullMQ doesn't have getPaused method
            };
        }
        catch (error) {
            console.error('Queue stats failed:', error);
            queueStats = {
                waiting: 0,
                active: 0,
                completed: 0,
                failed: 0,
                delayed: 0,
                paused: 0,
            };
        }
        // Determine overall status
        const allServicesUp = redisStatus === 'up' && databaseStatus === 'up' && aiStatus === 'up';
        const someServicesDown = redisStatus === 'down' || databaseStatus === 'down' || aiStatus === 'down';
        let overallStatus;
        if (allServicesUp) {
            overallStatus = 'healthy';
        }
        else if (someServicesDown && (redisStatus === 'up' || databaseStatus === 'up')) {
            overallStatus = 'degraded';
        }
        else {
            overallStatus = 'unhealthy';
        }
        const response = {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            services: {
                redis: redisStatus,
                database: databaseStatus,
                ai: aiStatus,
            },
            queue: queueStats,
            version: process.env.npm_package_version || '1.0.0',
            uptime: process.uptime(),
        };
        const responseTime = Date.now() - startTime;
        // Set appropriate HTTP status code
        const httpStatus = overallStatus === 'healthy' ? 200 :
            overallStatus === 'degraded' ? 200 : 503;
        res.status(httpStatus).json({
            ...response,
            responseTime,
        });
    }
    catch (error) {
        console.error('Health check error:', error);
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error',
            responseTime: Date.now() - startTime,
        });
    }
}
async function readiness(req, res) {
    try {
        // Check if all critical services are ready
        await redis.ping();
        await prisma.$queryRaw `SELECT 1`;
        res.status(200).json({
            status: 'ready',
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        res.status(503).json({
            status: 'not ready',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
async function liveness(req, res) {
    // Simple liveness check - just return 200 if the process is running
    res.status(200).json({
        status: 'alive',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
}
//# sourceMappingURL=health.js.map