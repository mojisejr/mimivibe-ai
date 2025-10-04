import { Request, Response } from 'express';
import { Redis } from 'ioredis';
import { PrismaClient } from '@prisma/client';
import { Queue } from 'bullmq';
import { HealthCheckResponse, QueueStats } from '@shared/types/queue';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const prisma = new PrismaClient();
const tarotQueue = new Queue('tarot-readings', { connection: redis });

export async function healthCheck(req: Request, res: Response) {
  const startTime = Date.now();
  
  try {
    // Check Redis connection
    let redisStatus: 'up' | 'down' = 'down';
    try {
      await redis.ping();
      redisStatus = 'up';
    } catch (error) {
      console.error('Redis health check failed:', error);
    }

    // Check Database connection
    let databaseStatus: 'up' | 'down' = 'down';
    try {
      await prisma.$queryRaw`SELECT 1`;
      databaseStatus = 'up';
    } catch (error) {
      console.error('Database health check failed:', error);
    }

    // Check AI services (basic check)
    let aiStatus: 'up' | 'down' = 'up';
    if (!process.env.OPENAI_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      aiStatus = 'down';
    }

    // Get queue statistics
    let queueStats: QueueStats;
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
    } catch (error) {
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
    
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded';
    if (allServicesUp) {
      overallStatus = 'healthy';
    } else if (someServicesDown && (redisStatus === 'up' || databaseStatus === 'up')) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'unhealthy';
    }

    const response: HealthCheckResponse = {
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

  } catch (error) {
    console.error('Health check error:', error);
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime,
    });
  }
}

export async function readiness(req: Request, res: Response) {
  try {
    // Check if all critical services are ready
    await redis.ping();
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function liveness(req: Request, res: Response) {
  // Simple liveness check - just return 200 if the process is running
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}