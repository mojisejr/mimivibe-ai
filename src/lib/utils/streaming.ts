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
    if (!this.controller) {
      console.warn('⚠️ SSE Controller not available, cannot send event:', event.event)
      return
    }

    const sseData = this.formatSSE(event)
    console.log('📡 SSE Sending:', event.event, 'Data:', event.data)
    console.log('📡 SSE Formatted:', sseData)
    
    try {
      this.controller.enqueue(this.encoder.encode(sseData))
      console.log('✅ SSE Event sent successfully')
    } catch (error) {
      console.error('❌ SSE Send error:', error)
    }
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
    
    console.log('📡 SSE Format result:', JSON.stringify(sse))
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
      console.log('📡 ReadableStream start called, creating controller...')
      streamController = new ReadingStreamController(controller)
      console.log('📡 ReadingStreamController created:', !!streamController)
    },
    cancel() {
      console.log('📡 ReadableStream cancel called')
      if (streamController) {
        streamController.close()
      }
    }
  })

  console.log('📡 ReadableStream created, returning controller:', !!streamController)
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