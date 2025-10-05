import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';

/**
 * Safely format a date string to relative time in Thai
 * @param dateString - The date string to format
 * @param fallback - Fallback text if date is invalid
 * @returns Formatted relative time string or fallback
 */
export const safeFormatDistanceToNow = (
  dateString: string | null | undefined,
  fallback: string = 'ไม่ทราบวันที่'
): string => {
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
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: th 
    });
  } catch (error) {
    // Silent error handling for production
    return fallback;
  }
};

/**
 * Check if a date string is valid
 * @param dateString - The date string to validate
 * @returns boolean indicating if the date is valid
 */
export const isValidDateString = (dateString: string | null | undefined): boolean => {
  if (!dateString || typeof dateString !== 'string') {
    return false;
  }
  
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Safely format a date string to a specific format
 * @param dateString - The date string to format
 * @param formatter - Date formatting function
 * @param fallback - Fallback text if date is invalid
 * @returns Formatted date string or fallback
 */
export const safeFormatDate = <T>(
  dateString: string | null | undefined,
  formatter: (date: Date) => T,
  fallback: T
): T => {
  try {
    if (!dateString || typeof dateString !== 'string') {
      return fallback;
    }

    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return fallback;
    }

    return formatter(date);
  } catch (error) {
    // Silent error handling for production
    return fallback;
  }
};