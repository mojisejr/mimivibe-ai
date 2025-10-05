/**
 * Server-Sent Events (SSE) utilities for streaming tarot reading generation
 */
export interface StreamEvent {
    event: string;
    data: any;
    id?: string;
}
export declare class ReadingStreamController {
    private controller;
    private encoder;
    constructor(controller: ReadableStreamDefaultController);
    /**
     * Send a formatted SSE message
     */
    send(event: StreamEvent): void;
    /**
     * Send progress update during workflow execution
     */
    sendProgress(step: string, message: string, progress: number): void;
    /**
     * Send error message
     */
    sendError(error: string, code?: string): void;
    /**
     * Send final reading result
     */
    sendReading(readingData: any): void;
    /**
     * Send completion signal
     */
    sendComplete(): void;
    /**
     * Close the stream
     */
    close(): void;
    /**
     * Format data as Server-Sent Events
     */
    private formatSSE;
}
/**
 * Create a ReadableStream for SSE responses
 */
export declare function createReadingStream(): {
    stream: ReadableStream<any>;
    controller: ReadingStreamController | null;
};
/**
 * Create SSE Response headers
 */
export declare function createSSEHeaders(): {
    'Content-Type': string;
    'Cache-Control': string;
    Connection: string;
    'Access-Control-Allow-Origin': string;
    'Access-Control-Allow-Headers': string;
};
/**
 * Progress steps for the tarot reading workflow
 */
export declare const WORKFLOW_STEPS: {
    VALIDATING: {
        step: string;
        message: string;
        progress: number;
    };
    SELECTING_CARDS: {
        step: string;
        message: string;
        progress: number;
    };
    ANALYZING: {
        step: string;
        message: string;
        progress: number;
    };
    GENERATING: {
        step: string;
        message: string;
        progress: number;
    };
    FINALIZING: {
        step: string;
        message: string;
        progress: number;
    };
    COMPLETED: {
        step: string;
        message: string;
        progress: number;
    };
};
//# sourceMappingURL=streaming.d.ts.map