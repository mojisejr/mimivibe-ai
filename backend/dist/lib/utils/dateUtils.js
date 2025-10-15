"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeFormatDate = exports.isValidDateString = exports.safeFormatDistanceToNow = void 0;
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
/**
 * Safely format a date string to relative time in Thai
 * @param dateString - The date string to format
 * @param fallback - Fallback text if date is invalid
 * @returns Formatted relative time string or fallback
 */
const safeFormatDistanceToNow = (dateString, fallback = 'ไม่ทราบวันที่') => {
    try {
        // Check if dateString is valid
        if (!dateString || typeof dateString !== 'string') {
            return fallback;
        }
        // Try to create a date object
        const date = new Date(dateString);
        // Check if the date is valid
        if (isNaN(date.getTime())) {
            return fallback;
        }
        // Format the date
        return (0, date_fns_1.formatDistanceToNow)(date, {
            addSuffix: true,
            locale: locale_1.th
        });
    }
    catch (error) {
        // Silent error handling for production
        return fallback;
    }
};
exports.safeFormatDistanceToNow = safeFormatDistanceToNow;
/**
 * Check if a date string is valid
 * @param dateString - The date string to validate
 * @returns boolean indicating if the date is valid
 */
const isValidDateString = (dateString) => {
    if (!dateString || typeof dateString !== 'string') {
        return false;
    }
    const date = new Date(dateString);
    return !isNaN(date.getTime());
};
exports.isValidDateString = isValidDateString;
/**
 * Safely format a date string to a specific format
 * @param dateString - The date string to format
 * @param formatter - Date formatting function
 * @param fallback - Fallback text if date is invalid
 * @returns Formatted date string or fallback
 */
const safeFormatDate = (dateString, formatter, fallback) => {
    try {
        if (!dateString || typeof dateString !== 'string') {
            return fallback;
        }
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return fallback;
        }
        return formatter(date);
    }
    catch (error) {
        // Silent error handling for production
        return fallback;
    }
};
exports.safeFormatDate = safeFormatDate;
//# sourceMappingURL=dateUtils.js.map