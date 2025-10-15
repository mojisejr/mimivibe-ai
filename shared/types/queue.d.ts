export interface TarotReadingJob {
    id?: string;
    userId: string;
    sessionId?: string;
    question: string;
    cardCount: number;
    timestamp?: string;
    mood?: string;
    topic?: string;
    period?: string;
}
export interface TarotReadingJobResult {
    id?: string;
    success: boolean;
    status?: string;
    reading?: {
        id: string;
        question: string;
        cards: Array<{
            name: string;
            position: string;
            meaning: string;
            image: string;
        }>;
        interpretation: string;
        mood: string;
        topic: string;
        period: string;
    };
    error?: string | {
        code: string;
        message: string;
        details: unknown;
    };
}
export interface QueueStats {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
}
export interface HealthCheckResponse {
    status: 'healthy' | 'unhealthy' | 'degraded';
    timestamp: string;
    services: {
        redis: 'up' | 'down';
        database: 'up' | 'down';
        ai: 'up' | 'down';
    };
    queue: QueueStats;
    version: string;
    uptime: number;
}
export interface JobProgress {
    step: string;
    percentage: number;
    message?: string;
}
export interface SubmitReadingResponse {
    success: boolean;
    jobId: string;
    message: string;
    estimatedWaitTime: number;
}
export interface JobStatusResponse {
    success: boolean;
    jobId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    result?: TarotReadingJobResult;
    error?: string;
    createdAt: string;
    updatedAt: string;
}
//# sourceMappingURL=queue.d.ts.map