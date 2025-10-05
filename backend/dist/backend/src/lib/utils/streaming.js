"use strict";
/**
 * Server-Sent Events (SSE) utilities for streaming tarot reading generation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WORKFLOW_STEPS = exports.ReadingStreamController = void 0;
exports.createReadingStream = createReadingStream;
exports.createSSEHeaders = createSSEHeaders;
class ReadingStreamController {
    controller = null;
    encoder = new TextEncoder();
    constructor(controller) {
        this.controller = controller;
    }
    /**
     * Send a formatted SSE message
     */
    send(event) {
        if (!this.controller) {
            return;
        }
        const sseData = this.formatSSE(event);
        try {
            this.controller.enqueue(this.encoder.encode(sseData));
        }
        catch (error) {
            // Silent fail for production
        }
    }
    /**
     * Send progress update during workflow execution
     */
    sendProgress(step, message, progress) {
        this.send({
            event: 'progress',
            data: {
                step,
                message,
                progress,
                timestamp: new Date().toISOString()
            }
        });
    }
    /**
     * Send error message
     */
    sendError(error, code) {
        this.send({
            event: 'error',
            data: {
                error,
                code,
                timestamp: new Date().toISOString()
            }
        });
    }
    /**
     * Send final reading result
     */
    sendReading(readingData) {
        this.send({
            event: 'reading',
            data: readingData
        });
    }
    /**
     * Send completion signal
     */
    sendComplete() {
        this.send({
            event: 'complete',
            data: { status: 'finished' }
        });
    }
    /**
     * Close the stream
     */
    close() {
        if (this.controller) {
            this.controller.close();
            this.controller = null;
        }
    }
    /**
     * Format data as Server-Sent Events
     */
    formatSSE(event) {
        let sse = '';
        if (event.id) {
            sse += `id: ${event.id}\n`;
        }
        sse += `event: ${event.event}\n`;
        sse += `data: ${JSON.stringify(event.data)}\n\n`;
        return sse;
    }
}
exports.ReadingStreamController = ReadingStreamController;
/**
 * Create a ReadableStream for SSE responses
 */
function createReadingStream() {
    let streamController;
    const stream = new ReadableStream({
        start(controller) {
            streamController = new ReadingStreamController(controller);
        },
        cancel() {
            if (streamController) {
                streamController.close();
            }
        }
    });
    return {
        stream,
        controller: streamController || null
    };
}
/**
 * Create SSE Response headers
 */
function createSSEHeaders() {
    return {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
    };
}
/**
 * Progress steps for the tarot reading workflow
 */
exports.WORKFLOW_STEPS = {
    VALIDATING: {
        step: 'validating',
        message: 'กำลังตรวจสอบคำถาม...',
        progress: 20
    },
    SELECTING_CARDS: {
        step: 'selecting_cards',
        message: 'กำลังเลือกไพ่ยิปซี...',
        progress: 40
    },
    ANALYZING: {
        step: 'analyzing',
        message: 'กำลังวิเคราะห์คำถาม...',
        progress: 60
    },
    GENERATING: {
        step: 'generating',
        message: 'กำลังสร้างคำทำนาย...',
        progress: 80
    },
    FINALIZING: {
        step: 'finalizing',
        message: 'กำลังจัดเตรียมผลลัพธ์...',
        progress: 95
    },
    COMPLETED: {
        step: 'completed',
        message: 'เสร็จสิ้น',
        progress: 100
    }
};
//# sourceMappingURL=streaming.js.map