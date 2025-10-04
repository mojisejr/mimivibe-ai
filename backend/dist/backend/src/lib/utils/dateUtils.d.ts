/**
 * Safely format a date string to relative time in Thai
 * @param dateString - The date string to format
 * @param fallback - Fallback text if date is invalid
 * @returns Formatted relative time string or fallback
 */
export declare const safeFormatDistanceToNow: (dateString: string | null | undefined, fallback?: string) => string;
/**
 * Check if a date string is valid
 * @param dateString - The date string to validate
 * @returns boolean indicating if the date is valid
 */
export declare const isValidDateString: (dateString: string | null | undefined) => boolean;
/**
 * Safely format a date string to a specific format
 * @param dateString - The date string to format
 * @param formatter - Date formatting function
 * @param fallback - Fallback text if date is invalid
 * @returns Formatted date string or fallback
 */
export declare const safeFormatDate: <T>(dateString: string | null | undefined, formatter: (date: Date) => T, fallback: T) => T;
//# sourceMappingURL=dateUtils.d.ts.map