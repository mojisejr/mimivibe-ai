// Error message mapping for Thai localization
// Maps error keys from API responses to user-friendly Thai messages

export interface ErrorMapping {
  [key: string]: {
    title: string;
    message: string;
    suggestion?: string;
  };
}

export const ERROR_MESSAGES: ErrorMapping = {
  // Validation errors (400)
  'Invalid question': {
    title: 'คำถามไม่เหมาะสม',
    message: 'คำถามนี้มีหลายประเด็น กรุณาถามทีละเรื่องเพื่อให้การทำนายแม่นยำ',
    suggestion: 'ลองแยกคำถามออกเป็นหลายๆ คำถาม หรือเลือกประเด็นหลักที่ต้องการทราบมากที่สุด'
  },

  // Processing errors (422)
  'Processing error': {
    title: 'เกิดข้อผิดพลาดในการประมวลผล',
    message: 'ระบบไม่สามารถประมวลผลคำถามของคุณได้ในขณะนี้',
    suggestion: 'กรุณาลองใหม่อีกครั้ง หรือปรับคำถามให้ชัดเจนมากขึ้น'
  },

  // Timeout errors (504)
  'Gateway timeout': {
    title: 'การประมวลผลใช้เวลานานเกินไป',
    message: 'ระบบใช้เวลาในการประมวลผลนานเกินกำหนด',
    suggestion: 'กรุณารอสักครู่แล้วลองใหม่อีกครั้ง'
  },

  // System errors (502)
  'Upstream error': {
    title: 'เกิดข้อผิดพลาดของระบบ',
    message: 'เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง',
    suggestion: 'หากปัญหายังคงอยู่ กรุณาติดต่อทีมสนับสนุน'
  },

  // Reading timeout (specific case)
  'Reading timeout': {
    title: 'การทำนายใช้เวลานานเกินไป',
    message: 'การสร้างการทำนายใช้เวลานานเกินกำหนด',
    suggestion: 'กรุณาลองใหม่อีกครั้ง เครดิตของคุณจะไม่ถูกหักในครั้งนี้'
  },

  // Default fallback
  'Unknown error': {
    title: 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
    message: 'เกิดข้อผิดพลาดที่ไม่คาดคิด',
    suggestion: 'กรุณาลองใหม่อีกครั้ง หรือติดต่อทีมสนับสนุน'
  }
};

/**
 * Get Thai error message from error key
 * @param errorKey - Error key from API response
 * @param fallbackMessage - Optional fallback message if key not found
 * @returns Thai error message object
 */
export function getErrorMessage(errorKey: string, fallbackMessage?: string) {
  const errorInfo = ERROR_MESSAGES[errorKey];
  
  if (errorInfo) {
    return errorInfo;
  }

  // Fallback for unknown error keys
  return {
    title: ERROR_MESSAGES['Unknown error'].title,
    message: fallbackMessage || ERROR_MESSAGES['Unknown error'].message,
    suggestion: ERROR_MESSAGES['Unknown error'].suggestion
  };
}

/**
 * Check if error key exists in mapping
 * @param errorKey - Error key to check
 * @returns boolean indicating if key exists
 */
export function hasErrorMapping(errorKey: string): boolean {
  return errorKey in ERROR_MESSAGES;
}

/**
 * Get all available error keys
 * @returns Array of all error keys
 */
export function getAvailableErrorKeys(): string[] {
  return Object.keys(ERROR_MESSAGES);
}