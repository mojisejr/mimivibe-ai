// Standardized Error System for MiMiVibes API
// Provides consistent error responses with Thai user-friendly messages

export enum ErrorCode {
  // Input Validation Errors (4xx)
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_QUESTION = 'MISSING_QUESTION',
  QUESTION_TOO_LONG = 'QUESTION_TOO_LONG',
  QUESTION_TOO_SHORT = 'QUESTION_TOO_SHORT',
  MULTIPLE_QUESTIONS = 'MULTIPLE_QUESTIONS',
  INAPPROPRIATE_CONTENT = 'INAPPROPRIATE_CONTENT',
  SECURITY_VIOLATION = 'SECURITY_VIOLATION',
  
  // Authentication & Authorization (4xx)
  UNAUTHORIZED = 'UNAUTHORIZED',
  INSUFFICIENT_CREDITS = 'INSUFFICIENT_CREDITS',
  
  // Rate Limiting (4xx)
  RATE_LIMITED = 'RATE_LIMITED',
  RATE_LIMITED_STRICT = 'RATE_LIMITED_STRICT',
  RATE_LIMITED_ABUSE = 'RATE_LIMITED_ABUSE',
  
  // AI Generation Errors (5xx)
  AI_GENERATION_FAILED = 'AI_GENERATION_FAILED',
  AI_TIMEOUT = 'AI_TIMEOUT',
  AI_PROVIDER_UNAVAILABLE = 'AI_PROVIDER_UNAVAILABLE',
  AI_PARSING_ERROR = 'AI_PARSING_ERROR',
  
  // Database Errors (5xx)
  DATABASE_ERROR = 'DATABASE_ERROR',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  
  // System Errors (5xx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE'
}

export interface StandardizedError {
  success: false;
  error: {
    code: ErrorCode;
    message: string; // Thai user-friendly message
    details?: string; // Technical details (optional)
    field?: string; // For validation errors
    retryAfter?: number; // For rate limiting (seconds)
    timestamp: string;
    path: string;
  };
}

export interface StandardizedSuccess<T = any> {
  success: true;
  data: T;
}

export type APIResponse<T = any> = StandardizedSuccess<T> | StandardizedError;

// Thai error messages mapping
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // Input Validation Errors
  [ErrorCode.INVALID_INPUT]: 'ข้อมูลที่ส่งมาไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง',
  [ErrorCode.MISSING_QUESTION]: 'กรุณาใส่คำถามที่ต้องการถามแม่หมอมีมี่',
  [ErrorCode.QUESTION_TOO_LONG]: 'คำถามยาวเกินไป กรุณาใส่คำถามไม่เกิน 500 ตัวอักษร',
  [ErrorCode.QUESTION_TOO_SHORT]: 'คำถามสั้นเกินไป กรุณาใส่คำถามอย่างน้อย 10 ตัวอักษร',
  [ErrorCode.MULTIPLE_QUESTIONS]: 'กรุณาถามคำถามเพียงข้อเดียวในแต่ละครั้ง',
  [ErrorCode.INAPPROPRIATE_CONTENT]: 'เนื้อหาไม่เหมาะสม กรุณาถามคำถามที่เกี่ยวข้องกับการทำนายไพ่ทาโรต์',
  [ErrorCode.SECURITY_VIOLATION]: 'ตรวจพบการใช้งานที่ไม่ปลอดภัย กรุณาลองใหม่อีกครั้ง',
  
  // Authentication & Authorization
  [ErrorCode.UNAUTHORIZED]: 'กรุณาเข้าสู่ระบบก่อนใช้งาน',
  [ErrorCode.INSUFFICIENT_CREDITS]: 'เครดิตไม่เพียงพอ กรุณาเติมเครดิตหรือใช้คะแนนฟรี',
  
  // Rate Limiting
  [ErrorCode.RATE_LIMITED]: 'คุณใช้งานบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง',
  [ErrorCode.RATE_LIMITED_STRICT]: 'ตรวจพบการใช้งานผิดปกติ กรุณารอ 5 นาทีแล้วลองใหม่',
  [ErrorCode.RATE_LIMITED_ABUSE]: 'การใช้งานเกินขั้นตอนที่กำหนด กรุณารอ 1 ชั่วโมงแล้วลองใหม่',
  
  // AI Generation Errors
  [ErrorCode.AI_GENERATION_FAILED]: 'ไม่สามารถสร้างการทำนายได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง',
  [ErrorCode.AI_TIMEOUT]: 'การทำนายใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง',
  [ErrorCode.AI_PROVIDER_UNAVAILABLE]: 'ระบบ AI ไม่พร้อมใช้งานชั่วคราว กรุณาลองใหม่ในอีกสักครู่',
  [ErrorCode.AI_PARSING_ERROR]: 'เกิดข้อผิดพลาดในการประมวลผลการทำนาย กรุณาลองใหม่อีกครั้ง',
  
  // Database Errors
  [ErrorCode.DATABASE_ERROR]: 'เกิดข้อผิดพลาดในระบบฐานข้อมูล กรุณาลองใหม่อีกครั้ง',
  [ErrorCode.TRANSACTION_FAILED]: 'ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง',
  
  // System Errors
  [ErrorCode.INTERNAL_ERROR]: 'เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง',
  [ErrorCode.SERVICE_UNAVAILABLE]: 'ระบบไม่พร้อมใช้งานชั่วคราว กรุณาลองใหม่ในอีกสักครู่'
};

// Helper function to create standardized error responses
export function createErrorResponse(
  code: ErrorCode,
  path: string,
  details?: string,
  field?: string,
  retryAfter?: number
): StandardizedError {
  return {
    success: false,
    error: {
      code,
      message: ERROR_MESSAGES[code],
      details,
      field,
      retryAfter,
      timestamp: new Date().toISOString(),
      path
    }
  };
}

// Helper function to create success responses
export function createSuccessResponse<T>(data: T): StandardizedSuccess<T> {
  return {
    success: true,
    data
  };
}

// HTTP status code mapping for error codes
export const ERROR_STATUS_CODES: Record<ErrorCode, number> = {
  // Input Validation Errors (400)
  [ErrorCode.INVALID_INPUT]: 400,
  [ErrorCode.MISSING_QUESTION]: 400,
  [ErrorCode.QUESTION_TOO_LONG]: 400,
  [ErrorCode.QUESTION_TOO_SHORT]: 400,
  [ErrorCode.MULTIPLE_QUESTIONS]: 400,
  [ErrorCode.INAPPROPRIATE_CONTENT]: 400,
  [ErrorCode.SECURITY_VIOLATION]: 400,
  
  // 401 Unauthorized
  [ErrorCode.UNAUTHORIZED]: 401,
  
  // 402 Payment Required
  [ErrorCode.INSUFFICIENT_CREDITS]: 402,
  
  // 429 Too Many Requests
  [ErrorCode.RATE_LIMITED]: 429,
  [ErrorCode.RATE_LIMITED_STRICT]: 429,
  [ErrorCode.RATE_LIMITED_ABUSE]: 429,
  
  // 500 Internal Server Error
  [ErrorCode.AI_GENERATION_FAILED]: 500,
  [ErrorCode.AI_TIMEOUT]: 500,
  [ErrorCode.AI_PROVIDER_UNAVAILABLE]: 500,
  [ErrorCode.AI_PARSING_ERROR]: 500,
  [ErrorCode.DATABASE_ERROR]: 500,
  [ErrorCode.TRANSACTION_FAILED]: 500,
  [ErrorCode.INTERNAL_ERROR]: 500,
  
  // 503 Service Unavailable
  [ErrorCode.SERVICE_UNAVAILABLE]: 503
};

// Backward compatibility: Legacy error format for existing UI
export interface LegacyReadingError {
  success: false;
  error: string;
  message: string;
  timestamp: string;
  path: string;
}

// Helper to convert standardized error to legacy format
export function toLegacyError(standardError: StandardizedError): LegacyReadingError {
  return {
    success: false,
    error: standardError.error.code,
    message: standardError.error.message,
    timestamp: standardError.error.timestamp,
    path: standardError.error.path
  };
}