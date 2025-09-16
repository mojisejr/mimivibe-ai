/**
 * Error Dictionary for MiMiVibes AI Tarot Platform
 * 
 * This file contains user-friendly error messages in both Thai and English
 * for all error codes defined in the application. Messages are designed to be
 * empathetic, actionable, and maintain the warm personality of "แม่หมอมีมี่".
 * 
 * Created: 2025-09-16 17:40:29
 * Issue: #176 - Error Message Improvements
 */

import { ErrorCode, ErrorCategory, ErrorSeverity } from '@/types/errors';

// Language Support
export type Language = 'th' | 'en';

// Error Message Structure
export interface ErrorMessage {
  title: string;
  description: string;
  suggestion: string;
  actionLabel?: string;
}

// Error Dictionary Type
export type ErrorDictionary = {
  [key in ErrorCode]: {
    [lang in Language]: ErrorMessage;
  };
};

// Main Error Dictionary
export const ERROR_DICTIONARY: ErrorDictionary = {
  // Validation Errors
  [ErrorCode.QUESTION_TOO_SHORT]: {
    th: {
      title: 'คำถามสั้นเกินไป',
      description: 'แม่หมอมีมี่ต้องการคำถามที่ละเอียดกว่านี้เพื่อให้คำทำนายที่แม่นยำค่ะ',
      suggestion: 'กรุณาเขียนคำถามให้ยาวอย่างน้อย 10 ตัวอักษร และอธิบายสถานการณ์ให้ชัดเจนมากขึ้น',
      actionLabel: 'แก้ไขคำถาม'
    },
    en: {
      title: 'Question Too Short',
      description: 'Mae Moh Mimi needs more details to provide an accurate reading',
      suggestion: 'Please write at least 10 characters and describe your situation more clearly',
      actionLabel: 'Edit Question'
    }
  },

  [ErrorCode.QUESTION_TOO_LONG]: {
    th: {
      title: 'คำถามยาวเกินไป',
      description: 'แม่หมอมีมี่อยากให้คุณเขียนคำถามให้กระชับและตรงประเด็นมากกว่านี้ค่ะ',
      suggestion: 'กรุณาย่อคำถามให้สั้นลงไม่เกิน 500 ตัวอักษร และเน้นประเด็นหลักที่ต้องการทราบ',
      actionLabel: 'ย่อคำถาม'
    },
    en: {
      title: 'Question Too Long',
      description: 'Mae Moh Mimi would like you to make your question more concise and focused',
      suggestion: 'Please shorten your question to under 500 characters and focus on the main point',
      actionLabel: 'Shorten Question'
    }
  },

  [ErrorCode.QUESTION_INAPPROPRIATE]: {
    th: {
      title: 'คำถามไม่เหมาะสม',
      description: 'แม่หมอมีมี่ไม่สามารถตอบคำถามประเภทนี้ได้ค่ะ เพื่อรักษาพลังงานบวกในการทำนาย',
      suggestion: 'กรุณาถามเกี่ยวกับความรัก การงาน สุขภาพ หรือการเงินแทน และหลีกเลี่ยงเนื้อหาที่ไม่เหมาะสม',
      actionLabel: 'เปลี่ยนคำถาม'
    },
    en: {
      title: 'Inappropriate Question',
      description: 'Mae Moh Mimi cannot answer this type of question to maintain positive energy',
      suggestion: 'Please ask about love, career, health, or finances instead, and avoid inappropriate content',
      actionLabel: 'Change Question'
    }
  },

  [ErrorCode.INVALID_INPUT_FORMAT]: {
    th: {
      title: 'รูปแบบข้อมูลไม่ถูกต้อง',
      description: 'ข้อมูลที่ส่งมามีรูปแบบที่แม่หมอมีมี่อ่านไม่ได้ค่ะ',
      suggestion: 'กรุณาตรวจสอบและส่งข้อมูลใหม่อีกครั้ง หรือลองรีเฟรชหน้าเว็บ',
      actionLabel: 'ลองใหม่'
    },
    en: {
      title: 'Invalid Input Format',
      description: 'The data format sent cannot be read by Mae Moh Mimi',
      suggestion: 'Please check and resend your data, or try refreshing the page',
      actionLabel: 'Try Again'
    }
  },

  // Authentication Errors
  [ErrorCode.USER_NOT_AUTHENTICATED]: {
    th: {
      title: 'กรุณาเข้าสู่ระบบ',
      description: 'แม่หมอมีมี่ต้องการให้คุณเข้าสู่ระบบก่อนเพื่อบันทึกประวัติการทำนายค่ะ',
      suggestion: 'กรุณาเข้าสู่ระบบด้วย Google, Facebook หรืออีเมลเพื่อใช้งานต่อ',
      actionLabel: 'เข้าสู่ระบบ'
    },
    en: {
      title: 'Please Sign In',
      description: 'Mae Moh Mimi needs you to sign in first to save your reading history',
      suggestion: 'Please sign in with Google, Facebook, or email to continue',
      actionLabel: 'Sign In'
    }
  },

  [ErrorCode.SESSION_EXPIRED]: {
    th: {
      title: 'เซสชันหมดอายุ',
      description: 'การเข้าสู่ระบบของคุณหมดอายุแล้วค่ะ เพื่อความปลอดภัยของข้อมูล',
      suggestion: 'กรุณาเข้าสู่ระบบใหม่เพื่อใช้งานต่อ ข้อมูลของคุณจะยังคงปลอดภัย',
      actionLabel: 'เข้าสู่ระบบใหม่'
    },
    en: {
      title: 'Session Expired',
      description: 'Your login session has expired for security reasons',
      suggestion: 'Please sign in again to continue. Your data remains secure',
      actionLabel: 'Sign In Again'
    }
  },

  [ErrorCode.INVALID_CREDENTIALS]: {
    th: {
      title: 'ข้อมูลเข้าสู่ระบบไม่ถูกต้อง',
      description: 'อีเมลหรือรหัสผ่านที่ใส่ไม่ถูกต้องค่ะ',
      suggestion: 'กรุณาตรวจสอบอีเมลและรหัสผ่านอีกครั้ง หรือใช้การเข้าสู่ระบบผ่าน Google/Facebook',
      actionLabel: 'ลองใหม่'
    },
    en: {
      title: 'Invalid Credentials',
      description: 'The email or password entered is incorrect',
      suggestion: 'Please check your email and password again, or use Google/Facebook sign-in',
      actionLabel: 'Try Again'
    }
  },

  // Authorization Errors
  [ErrorCode.INSUFFICIENT_CREDITS]: {
    th: {
      title: 'เครดิตไม่เพียงพอ',
      description: 'แม่หมอมีมี่เสียใจค่ะ คุณต้องมีเครดิตเพื่อขอคำทำนายใหม่',
      suggestion: 'คุณสามารถซื้อเครดิตเพิ่ม หรือรอรับเครดิตฟรีจากกิจกรรมต่างๆ',
      actionLabel: 'ซื้อเครดิต'
    },
    en: {
      title: 'Insufficient Credits',
      description: 'Mae Moh Mimi is sorry, you need credits to request a new reading',
      suggestion: 'You can purchase more credits or wait for free credits from activities',
      actionLabel: 'Buy Credits'
    }
  },

  [ErrorCode.FEATURE_NOT_AVAILABLE]: {
    th: {
      title: 'ฟีเจอร์ไม่พร้อมใช้งาน',
      description: 'ฟีเจอร์นี้ยังไม่เปิดให้ใช้งานสำหรับบัญชีของคุณค่ะ',
      suggestion: 'กรุณาอัปเกรดบัญชีหรือรอการเปิดใช้งานในอนาคต',
      actionLabel: 'ดูแพ็กเกจ'
    },
    en: {
      title: 'Feature Not Available',
      description: 'This feature is not yet available for your account',
      suggestion: 'Please upgrade your account or wait for future availability',
      actionLabel: 'View Packages'
    }
  },

  [ErrorCode.ACCOUNT_SUSPENDED]: {
    th: {
      title: 'บัญชีถูกระงับ',
      description: 'บัญชีของคุณถูกระงับชั่วคราวเนื่องจากการใช้งานที่ผิดเงื่อนไข',
      suggestion: 'กรุณาติดต่อทีมสนับสนุนเพื่อขอความช่วยเหลือ',
      actionLabel: 'ติดต่อสนับสนุน'
    },
    en: {
      title: 'Account Suspended',
      description: 'Your account has been temporarily suspended due to terms violation',
      suggestion: 'Please contact support team for assistance',
      actionLabel: 'Contact Support'
    }
  },

  // Rate Limiting
  [ErrorCode.TOO_MANY_REQUESTS]: {
    th: {
      title: 'ขอคำทำนายบ่อยเกินไป',
      description: 'แม่หมอมีมี่ต้องการเวลาในการเตรียมพลังงานสำหรับคำทำนายที่ดีค่ะ',
      suggestion: 'กรุณารอสักครู่แล้วลองใหม่ การรอคอยจะทำให้คำทำนายแม่นยำมากขึ้น',
      actionLabel: 'รอและลองใหม่'
    },
    en: {
      title: 'Too Many Requests',
      description: 'Mae Moh Mimi needs time to prepare energy for a good reading',
      suggestion: 'Please wait a moment and try again. Patience will make the reading more accurate',
      actionLabel: 'Wait and Retry'
    }
  },

  [ErrorCode.DAILY_LIMIT_EXCEEDED]: {
    th: {
      title: 'เกินขีดจำกัดรายวัน',
      description: 'คุณได้ใช้คำทำนายครบตามขีดจำกัดรายวันแล้วค่ะ',
      suggestion: 'กรุณารอจนถึงวันพรุ่งนี้ หรือซื้อเครดิตเพิ่มเพื่อใช้งานต่อ',
      actionLabel: 'ซื้อเครดิต'
    },
    en: {
      title: 'Daily Limit Exceeded',
      description: 'You have reached your daily reading limit',
      suggestion: 'Please wait until tomorrow or purchase additional credits to continue',
      actionLabel: 'Buy Credits'
    }
  },

  // AI Service Errors
  [ErrorCode.AI_SERVICE_UNAVAILABLE]: {
    th: {
      title: 'บริการ AI ไม่พร้อมใช้งาน',
      description: 'แม่หมอมีมี่กำลังพักผ่อนชั่วคราว ระบบ AI ไม่สามารถให้บริการได้ในขณะนี้',
      suggestion: 'กรุณาลองใหม่ในอีกสักครู่ หรือติดต่อทีมสนับสนุนหากปัญหายังคงอยู่',
      actionLabel: 'ลองใหม่'
    },
    en: {
      title: 'AI Service Unavailable',
      description: 'Mae Moh Mimi is taking a temporary rest, AI service is currently unavailable',
      suggestion: 'Please try again in a moment or contact support if the problem persists',
      actionLabel: 'Try Again'
    }
  },

  [ErrorCode.AI_PROCESSING_FAILED]: {
    th: {
      title: 'การประมวลผล AI ล้มเหลว',
      description: 'แม่หมอมีมี่ไม่สามารถประมวลผลคำถามของคุณได้ในขณะนี้',
      suggestion: 'กรุณาลองถามใหม่ด้วยคำถามที่ชัดเจนกว่านี้ หรือลองใหม่ในอีกสักครู่',
      actionLabel: 'ถามใหม่'
    },
    en: {
      title: 'AI Processing Failed',
      description: 'Mae Moh Mimi cannot process your question at this time',
      suggestion: 'Please try asking again with a clearer question, or try again in a moment',
      actionLabel: 'Ask Again'
    }
  },

  [ErrorCode.AI_TIMEOUT]: {
    th: {
      title: 'การประมวลผลใช้เวลานานเกินไป',
      description: 'แม่หมอมีมี่ใช้เวลาในการทำนายนานกว่าปกติ อาจเป็นเพราะคำถามซับซ้อน',
      suggestion: 'กรุณาลองใหม่ หรือลองถามด้วยคำถามที่ง่ายกว่านี้',
      actionLabel: 'ลองใหม่'
    },
    en: {
      title: 'Processing Timeout',
      description: 'Mae Moh Mimi is taking longer than usual, possibly due to a complex question',
      suggestion: 'Please try again or ask with a simpler question',
      actionLabel: 'Try Again'
    }
  },

  [ErrorCode.READING_GENERATION_FAILED]: {
    th: {
      title: 'ไม่สามารถสร้างคำทำนายได้',
      description: 'แม่หมอมีมี่ไม่สามารถสร้างคำทำนายสำหรับคำถามนี้ได้ค่ะ',
      suggestion: 'กรุณาลองถามใหม่ด้วยคำถามที่แตกต่าง หรือติดต่อทีมสนับสนุน',
      actionLabel: 'ถามใหม่'
    },
    en: {
      title: 'Reading Generation Failed',
      description: 'Mae Moh Mimi cannot generate a reading for this question',
      suggestion: 'Please try asking again with a different question or contact support',
      actionLabel: 'Ask Again'
    }
  },

  // System Errors
  [ErrorCode.DATABASE_ERROR]: {
    th: {
      title: 'ข้อผิดพลาดของฐานข้อมูล',
      description: 'เกิดปัญหาในการเชื่อมต่อฐานข้อมูล ข้อมูลของคุณอาจไม่ถูกบันทึก',
      suggestion: 'กรุณาลองใหม่ในอีกสักครู่ หากปัญหายังคงอยู่ กรุณาติดต่อทีมสนับสนุน',
      actionLabel: 'ลองใหม่'
    },
    en: {
      title: 'Database Error',
      description: 'There is a database connection issue, your data may not be saved',
      suggestion: 'Please try again in a moment. If the problem persists, contact support',
      actionLabel: 'Try Again'
    }
  },

  [ErrorCode.NETWORK_ERROR]: {
    th: {
      title: 'ข้อผิดพลาดเครือข่าย',
      description: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
      suggestion: 'กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและลองใหม่',
      actionLabel: 'ลองใหม่'
    },
    en: {
      title: 'Network Error',
      description: 'Cannot connect to server. Please check your internet connection',
      suggestion: 'Please check your internet connection and try again',
      actionLabel: 'Try Again'
    }
  },

  [ErrorCode.INTERNAL_SERVER_ERROR]: {
    th: {
      title: 'ข้อผิดพลาดของเซิร์ฟเวอร์',
      description: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์ ทีมงานได้รับแจ้งแล้ว',
      suggestion: 'กรุณาลองใหม่ในอีกสักครู่ หรือติดต่อทีมสนับสนุนหากปัญหายังคงอยู่',
      actionLabel: 'ลองใหม่'
    },
    en: {
      title: 'Server Error',
      description: 'An internal server error occurred. The team has been notified',
      suggestion: 'Please try again in a moment or contact support if the problem persists',
      actionLabel: 'Try Again'
    }
  },

  [ErrorCode.SERVICE_MAINTENANCE]: {
    th: {
      title: 'ระบบอยู่ระหว่างการบำรุงรักษา',
      description: 'แม่หมอมีมี่กำลังปรับปรุงระบบเพื่อให้บริการที่ดีขึ้น',
      suggestion: 'กรุณารอสักครู่และลองใหม่ การบำรุงรักษาจะเสร็จเร็วๆ นี้',
      actionLabel: 'ลองใหม่ภายหลัง'
    },
    en: {
      title: 'System Maintenance',
      description: 'Mae Moh Mimi is upgrading the system for better service',
      suggestion: 'Please wait a moment and try again. Maintenance will be completed soon',
      actionLabel: 'Try Later'
    }
  }
};

// Helper Functions
export const getErrorMessage = (
  errorCode: ErrorCode,
  language: Language = 'th'
): ErrorMessage => {
  return ERROR_DICTIONARY[errorCode]?.[language] || ERROR_DICTIONARY[ErrorCode.INTERNAL_SERVER_ERROR][language];
};

export const getErrorTitle = (errorCode: ErrorCode, language: Language = 'th'): string => {
  return getErrorMessage(errorCode, language).title;
};

export const getErrorDescription = (errorCode: ErrorCode, language: Language = 'th'): string => {
  return getErrorMessage(errorCode, language).description;
};

export const getErrorSuggestion = (errorCode: ErrorCode, language: Language = 'th'): string => {
  return getErrorMessage(errorCode, language).suggestion;
};

export const getErrorActionLabel = (errorCode: ErrorCode, language: Language = 'th'): string | undefined => {
  return getErrorMessage(errorCode, language).actionLabel;
};

// Error Category Messages
export const ERROR_CATEGORY_MESSAGES: { [key in ErrorCategory]: { [lang in Language]: string } } = {
  [ErrorCategory.VALIDATION]: {
    th: 'ข้อผิดพลาดในการตรวจสอบข้อมูล',
    en: 'Data Validation Error'
  },
  [ErrorCategory.AUTHENTICATION]: {
    th: 'ข้อผิดพลาดในการยืนยันตัวตน',
    en: 'Authentication Error'
  },
  [ErrorCategory.AUTHORIZATION]: {
    th: 'ข้อผิดพลาดในการอนุญาต',
    en: 'Authorization Error'
  },
  [ErrorCategory.RATE_LIMIT]: {
    th: 'เกินขีดจำกัดการใช้งาน',
    en: 'Rate Limit Exceeded'
  },
  [ErrorCategory.AI_SERVICE]: {
    th: 'ข้อผิดพลาดของบริการ AI',
    en: 'AI Service Error'
  },
  [ErrorCategory.SYSTEM]: {
    th: 'ข้อผิดพลาดของระบบ',
    en: 'System Error'
  }
};

export const getCategoryMessage = (category: ErrorCategory, language: Language = 'th'): string => {
  return ERROR_CATEGORY_MESSAGES[category][language];
};