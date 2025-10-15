"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidEmail = isValidEmail;
exports.isValidEventType = isValidEventType;
exports.sanitizeString = sanitizeString;
exports.validatePagination = validatePagination;
exports.validateUserProfileUpdate = validateUserProfileUpdate;
// Validation utilities for API requests
const DOMPurify = __importStar(require("dompurify"));
const jsdom_1 = require("jsdom");
// Initialize DOMPurify for server-side usage
const window = new jsdom_1.JSDOM('').window;
const purify = DOMPurify.default(window);
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
function isValidEventType(eventType) {
    const validEventTypes = [
        'READING_SPEND',
        'STRIPE_TOPUP',
        'REWARD',
        'COIN_TO_STAR',
        'DAILY_LOGIN',
        'REFERRAL'
    ];
    return validEventTypes.includes(eventType);
}
function sanitizeString(str, maxLength = 255) {
    if (!str || typeof str !== 'string') {
        return '';
    }
    // Remove potential XSS attacks
    const sanitized = purify.sanitize(str, {
        ALLOWED_TAGS: [], // No HTML tags allowed
        ALLOWED_ATTR: [], // No attributes allowed
        KEEP_CONTENT: true // Keep text content
    });
    return sanitized.trim().slice(0, maxLength);
}
function validatePagination(page, limit) {
    const pageNum = Math.max(1, parseInt(page || '1'));
    const limitNum = Math.min(Math.max(1, parseInt(limit || '20')), 100);
    return {
        page: pageNum,
        limit: limitNum,
        offset: (pageNum - 1) * limitNum
    };
}
function validateUserProfileUpdate(data) {
    const errors = [];
    if (data.name && typeof data.name !== 'string') {
        errors.push({ field: 'name', message: 'Name must be a string' });
    }
    if (data.name && data.name.length > 100) {
        errors.push({ field: 'name', message: 'Name must be less than 100 characters' });
    }
    if (data.email && typeof data.email !== 'string') {
        errors.push({ field: 'email', message: 'Email must be a string' });
    }
    if (data.email && !isValidEmail(data.email)) {
        errors.push({ field: 'email', message: 'Invalid email format' });
    }
    if (data.imageUrl && typeof data.imageUrl !== 'string') {
        errors.push({ field: 'imageUrl', message: 'Image URL must be a string' });
    }
    if (data.imageUrl && data.imageUrl.length > 500) {
        errors.push({ field: 'imageUrl', message: 'Image URL must be less than 500 characters' });
    }
    return errors;
}
//# sourceMappingURL=validations.js.map