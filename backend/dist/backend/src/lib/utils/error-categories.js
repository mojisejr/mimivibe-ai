"use strict";
/**
 * Error Categories Utility for Ask Feature
 *
 * Provides structured error categorization, Thai user messages, and
 * standardized error response functions for the MiMiVibes Ask system.
 *
 * This utility builds upon the existing error-messages.ts system while
 * adding categorization and retry logic for improved user experience.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_MAPPINGS = exports.ErrorCategory = void 0;
exports.categorizeError = categorizeError;
exports.createCategorizedErrorResponse = createCategorizedErrorResponse;
exports.getErrorCodesByCategory = getErrorCodesByCategory;
exports.isErrorRetryable = isErrorRetryable;
exports.getRetryDelay = getRetryDelay;
exports.getAvailableCategories = getAvailableCategories;
exports.getErrorStatsByCategory = getErrorStatsByCategory;
const error_messages_1 = require("./error-messages");
// Error categories for structured error handling
var ErrorCategory;
(function (ErrorCategory) {
    ErrorCategory["VALIDATION"] = "validation";
    ErrorCategory["AI_PROCESSING"] = "ai_processing";
    ErrorCategory["RATE_LIMIT"] = "rate_limit";
    ErrorCategory["AUTHENTICATION"] = "authentication";
    ErrorCategory["SYSTEM"] = "system";
})(ErrorCategory || (exports.ErrorCategory = ErrorCategory = {}));
// Comprehensive error mappings with Thai messages
exports.ERROR_MAPPINGS = {
    // Validation Errors
    'QUESTION_TOO_SHORT': {
        code: 'QUESTION_TOO_SHORT',
        category: ErrorCategory.VALIDATION,
        isRetryable: true,
        title: 'คำถามสั้นเกินไป',
        message: 'กรุณาใส่คำถามที่ยาวกว่า 10 ตัวอักษร',
        suggestion: 'ลองเขียนคำถามให้ละเอียดมากขึ้น เช่น "ความรักของฉันจะเป็นอย่างไรในเดือนหน้า"'
    },
    'QUESTION_TOO_LONG': {
        code: 'QUESTION_TOO_LONG',
        category: ErrorCategory.VALIDATION,
        isRetryable: true,
        title: 'คำถามยาวเกินไป',
        message: 'กรุณาใส่คำถามที่สั้นกว่า 500 ตัวอักษร',
        suggestion: 'ลองแยกคำถามออกเป็นหลายๆ คำถาม หรือเลือกประเด็นหลักที่ต้องการทราบมากที่สุด'
    },
    'INAPPROPRIATE_CONTENT': {
        code: 'INAPPROPRIATE_CONTENT',
        category: ErrorCategory.VALIDATION,
        isRetryable: true,
        title: 'เนื้อหาไม่เหมาะสม',
        message: 'คำถามนี้มีเนื้อหาที่ไม่เหมาะสมสำหรับการทำนาย',
        suggestion: 'กรุณาใช้คำถามที่สุภาพและเหมาะสมสำหรับการทำนายไพ่ทาโรต์'
    },
    'INVALID_QUESTION_FORMAT': {
        code: 'INVALID_QUESTION_FORMAT',
        category: ErrorCategory.VALIDATION,
        isRetryable: true,
        title: 'รูปแบบคำถามไม่ถูกต้อง',
        message: 'คำถามนี้มีหลายประเด็น กรุณาถามทีละเรื่องเพื่อให้การทำนายแม่นยำ',
        suggestion: 'ลองแยกคำถามออกเป็นหลายๆ คำถาม หรือเลือกประเด็นหลักที่ต้องการทราบมากที่สุด'
    },
    // AI Processing Errors
    'AI_PROCESSING_ERROR': {
        code: 'AI_PROCESSING_ERROR',
        category: ErrorCategory.AI_PROCESSING,
        isRetryable: true,
        title: 'เกิดข้อผิดพลาดในการประมวลผล',
        message: 'ระบบไม่สามารถประมวลผลคำถามของคุณได้ในขณะนี้',
        suggestion: 'กรุณาลองใหม่อีกครั้ง หรือปรับคำถามให้ชัดเจนมากขึ้น',
        retryAfter: 30
    },
    'AI_TIMEOUT': {
        code: 'AI_TIMEOUT',
        category: ErrorCategory.AI_PROCESSING,
        isRetryable: true,
        title: 'การทำนายใช้เวลานานเกินไป',
        message: 'การสร้างการทำนายใช้เวลานานเกินกำหนด',
        suggestion: 'กรุณาลองใหม่อีกครั้ง เครดิตของคุณจะไม่ถูกหักในครั้งนี้',
        retryAfter: 60
    },
    'AI_PROVIDER_ERROR': {
        code: 'AI_PROVIDER_ERROR',
        category: ErrorCategory.AI_PROCESSING,
        isRetryable: true,
        title: 'เกิดข้อผิดพลาดจากผู้ให้บริการ AI',
        message: 'ระบบ AI ไม่สามารถให้บริการได้ในขณะนี้',
        suggestion: 'กรุณารอสักครู่แล้วลองใหม่อีกครั้ง',
        retryAfter: 120
    },
    'WORKFLOW_ERROR': {
        code: 'WORKFLOW_ERROR',
        category: ErrorCategory.AI_PROCESSING,
        isRetryable: true,
        title: 'เกิดข้อผิดพลาดในขั้นตอนการทำนาย',
        message: 'ระบบไม่สามารถดำเนินการทำนายให้เสร็จสิ้นได้',
        suggestion: 'กรุณาลองใหม่อีกครั้ง หากปัญหายังคงอยู่ กรุณาติดต่อทีมสนับสนุน',
        retryAfter: 30
    },
    // Rate Limit Errors
    'RATE_LIMIT_EXCEEDED': {
        code: 'RATE_LIMIT_EXCEEDED',
        category: ErrorCategory.RATE_LIMIT,
        isRetryable: true,
        title: 'ใช้งานบ่อยเกินไป',
        message: 'คุณใช้งานบ่อยเกินกำหนด กรุณารอสักครู่ก่อนลองใหม่',
        suggestion: 'กรุณารอ 1 นาทีก่อนทำการทำนายครั้งต่อไป',
        retryAfter: 60
    },
    'DAILY_LIMIT_EXCEEDED': {
        code: 'DAILY_LIMIT_EXCEEDED',
        category: ErrorCategory.RATE_LIMIT,
        isRetryable: false,
        title: 'ใช้งานครบจำนวนรายวัน',
        message: 'คุณได้ใช้งานครบจำนวนที่กำหนดสำหรับวันนี้แล้ว',
        suggestion: 'กรุณาลองใหม่ในวันถัดไป หรือซื้อเครดิตเพิ่มเติม'
    },
    // Authentication Errors
    'INSUFFICIENT_CREDITS': {
        code: 'INSUFFICIENT_CREDITS',
        category: ErrorCategory.AUTHENTICATION,
        isRetryable: false,
        title: 'เครดิตไม่เพียงพอ',
        message: 'คุณมีเครดิตไม่เพียงพอสำหรับการทำนายครั้งนี้',
        suggestion: 'กรุณาซื้อเครดิตเพิ่มเติม หรือใช้เครดิตฟรีจากกิจกรรม'
    },
    'AUTHENTICATION_REQUIRED': {
        code: 'AUTHENTICATION_REQUIRED',
        category: ErrorCategory.AUTHENTICATION,
        isRetryable: false,
        title: 'จำเป็นต้องเข้าสู่ระบบ',
        message: 'กรุณาเข้าสู่ระบบก่อนใช้งานการทำนาย',
        suggestion: 'กรุณาเข้าสู่ระบบด้วย Google, Facebook หรืออีเมล'
    },
    'USER_SUSPENDED': {
        code: 'USER_SUSPENDED',
        category: ErrorCategory.AUTHENTICATION,
        isRetryable: false,
        title: 'บัญชีถูกระงับ',
        message: 'บัญชีของคุณถูกระงับการใช้งานชั่วคราว',
        suggestion: 'กรุณาติดต่อทีมสนับสนุนสำหรับข้อมูลเพิ่มเติม'
    },
    // System Errors
    'DATABASE_ERROR': {
        code: 'DATABASE_ERROR',
        category: ErrorCategory.SYSTEM,
        isRetryable: true,
        title: 'เกิดข้อผิดพลาดของฐานข้อมูล',
        message: 'ระบบฐานข้อมูลไม่สามารถให้บริการได้ในขณะนี้',
        suggestion: 'กรุณาลองใหม่อีกครั้ง หากปัญหายังคงอยู่ กรุณาติดต่อทีมสนับสนุน',
        retryAfter: 30
    },
    'NETWORK_ERROR': {
        code: 'NETWORK_ERROR',
        category: ErrorCategory.SYSTEM,
        isRetryable: true,
        title: 'เกิดข้อผิดพลาดเครือข่าย',
        message: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
        suggestion: 'กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและลองใหม่อีกครั้ง',
        retryAfter: 15
    },
    'SERVER_ERROR': {
        code: 'SERVER_ERROR',
        category: ErrorCategory.SYSTEM,
        isRetryable: true,
        title: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์',
        message: 'เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง',
        suggestion: 'หากปัญหายังคงอยู่ กรุณาติดต่อทีมสนับสนุน',
        retryAfter: 60
    },
    'MAINTENANCE_MODE': {
        code: 'MAINTENANCE_MODE',
        category: ErrorCategory.SYSTEM,
        isRetryable: true,
        title: 'ระบบอยู่ในช่วงปรับปรุง',
        message: 'ระบบกำลังอยู่ในช่วงปรับปรุง กรุณาลองใหม่ในภายหลัง',
        suggestion: 'กรุณาลองใหม่ในอีก 15-30 นาที',
        retryAfter: 900
    }
};
/**
 * Categorize an error based on error code or message
 * @param errorCode - Error code from API response
 * @param errorMessage - Optional error message for fallback categorization
 * @returns CategorizedError object with category and retry information
 */
function categorizeError(errorCode, errorMessage) {
    // Check if we have a direct mapping
    if (exports.ERROR_MAPPINGS[errorCode]) {
        return exports.ERROR_MAPPINGS[errorCode];
    }
    // Fallback to existing error-messages.ts system for backward compatibility
    const existingError = (0, error_messages_1.getErrorMessage)(errorCode, errorMessage);
    // Try to categorize based on existing error keys
    let category = ErrorCategory.SYSTEM;
    let isRetryable = true;
    let retryAfter;
    // Categorize based on error patterns
    if (errorCode.includes('Invalid') || errorCode.includes('validation')) {
        category = ErrorCategory.VALIDATION;
    }
    else if (errorCode.includes('timeout') || errorCode.includes('Processing')) {
        category = ErrorCategory.AI_PROCESSING;
        retryAfter = 30;
    }
    else if (errorCode.includes('rate') || errorCode.includes('limit')) {
        category = ErrorCategory.RATE_LIMIT;
        retryAfter = 60;
    }
    else if (errorCode.includes('auth') || errorCode.includes('credit')) {
        category = ErrorCategory.AUTHENTICATION;
        isRetryable = false;
    }
    return {
        code: errorCode,
        category,
        isRetryable,
        title: existingError.title,
        message: existingError.message,
        suggestion: existingError.suggestion,
        retryAfter
    };
}
/**
 * Create a standardized categorized error response
 * @param errorCode - Error code
 * @param path - API path where error occurred
 * @param validationReason - Optional validation reason
 * @returns Structured error response compatible with ReadingError interface
 */
function createCategorizedErrorResponse(errorCode, path, validationReason) {
    const categorizedError = categorizeError(errorCode);
    return {
        success: false,
        error: categorizedError.code,
        message: categorizedError.message,
        category: categorizedError.category,
        isRetryable: categorizedError.isRetryable,
        retryAfter: categorizedError.retryAfter,
        timestamp: new Date().toISOString(),
        path,
        validationReason,
        isValid: !validationReason, // If there's a validation reason, it's invalid
        // Additional fields for enhanced error handling
        title: categorizedError.title,
        suggestion: categorizedError.suggestion
    };
}
/**
 * Get all error codes for a specific category
 * @param category - Error category to filter by
 * @returns Array of error codes in the specified category
 */
function getErrorCodesByCategory(category) {
    return Object.entries(exports.ERROR_MAPPINGS)
        .filter(([_, error]) => error.category === category)
        .map(([code, _]) => code);
}
/**
 * Check if an error is retryable
 * @param errorCode - Error code to check
 * @returns boolean indicating if the error is retryable
 */
function isErrorRetryable(errorCode) {
    const categorizedError = categorizeError(errorCode);
    return categorizedError.isRetryable;
}
/**
 * Get retry delay for an error
 * @param errorCode - Error code to check
 * @returns number of seconds to wait before retry, or undefined if not retryable
 */
function getRetryDelay(errorCode) {
    const categorizedError = categorizeError(errorCode);
    return categorizedError.retryAfter;
}
/**
 * Get all available error categories
 * @returns Array of all error categories
 */
function getAvailableCategories() {
    return Object.values(ErrorCategory);
}
/**
 * Get error statistics by category
 * @returns Object with count of errors per category
 */
function getErrorStatsByCategory() {
    const stats = Object.values(ErrorCategory).reduce((acc, category) => {
        acc[category] = 0;
        return acc;
    }, {});
    Object.values(exports.ERROR_MAPPINGS).forEach(error => {
        stats[error.category]++;
    });
    return stats;
}
//# sourceMappingURL=error-categories.js.map