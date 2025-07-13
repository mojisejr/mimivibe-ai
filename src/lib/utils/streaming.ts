/**
 * Server-Sent Events (SSE) utilities for streaming tarot reading generation
 */

export interface StreamEvent {
  event: string
  data: any
  id?: string
}

export class ReadingStreamController {
  private controller: ReadableStreamDefaultController | null = null
  private encoder = new TextEncoder()

  constructor(controller: ReadableStreamDefaultController) {
    this.controller = controller
  }

  /**
   * Send a formatted SSE message
   */
  send(event: StreamEvent) {
    if (!this.controller) return

    const sseData = this.formatSSE(event)
    this.controller.enqueue(this.encoder.encode(sseData))
  }

  /**
   * Send progress update during workflow execution
   */
  sendProgress(step: string, message: string, progress: number) {
    this.send({
      event: 'progress',
      data: {
        step,
        message,
        progress,
        timestamp: new Date().toISOString()
      }
    })
  }

  /**
   * Send error message
   */
  sendError(error: string, code?: string) {
    this.send({
      event: 'error',
      data: {
        error,
        code,
        timestamp: new Date().toISOString()
      }
    })
  }

  /**
   * Send final reading result
   */
  sendReading(readingData: any) {
    this.send({
      event: 'reading',
      data: readingData
    })
  }

  /**
   * Send completion signal
   */
  sendComplete() {
    this.send({
      event: 'complete',
      data: { status: 'finished' }
    })
  }

  /**
   * Close the stream
   */
  close() {
    if (this.controller) {
      this.controller.close()
      this.controller = null
    }
  }

  /**
   * Format data as Server-Sent Events
   */
  private formatSSE(event: StreamEvent): string {
    let sse = ''
    
    if (event.id) {
      sse += `id: ${event.id}\n`
    }
    
    sse += `event: ${event.event}\n`
    sse += `data: ${JSON.stringify(event.data)}\n\n`
    
    return sse
  }
}

/**
 * Create a ReadableStream for SSE responses
 */
export function createReadingStream() {
  let streamController: ReadingStreamController

  const stream = new ReadableStream({
    start(controller) {
      streamController = new ReadingStreamController(controller)
    },
    cancel() {
      if (streamController) {
        streamController.close()
      }
    }
  })

  return {
    stream,
    controller: streamController!
  }
}

/**
 * Create SSE Response headers
 */
export function createSSEHeaders() {
  return {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  }
}

/**
 * Progress steps for the tarot reading workflow
 */
export const WORKFLOW_STEPS = {
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
}