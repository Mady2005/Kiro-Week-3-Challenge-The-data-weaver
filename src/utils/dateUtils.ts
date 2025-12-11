/**
 * Formats a Date object to YYYY-MM-DD string format for API requests
 */
export const formatDateForAPI = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Gets the date N days ago from today
 */
export const getDaysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

/**
 * Gets today's date
 */
export const getToday = (): Date => {
  return new Date();
};

/**
 * Formats a date for display in the UI (e.g., "Dec 11, 2025")
 */
export const formatDateForDisplay = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Creates a date range for API requests (start and end dates)
 */
export const getDateRange = (daysBack: number = 7): { startDate: string; endDate: string } => {
  const endDate = getToday();
  const startDate = getDaysAgo(daysBack);
  
  return {
    startDate: formatDateForAPI(startDate),
    endDate: formatDateForAPI(endDate)
  };
};

/**
 * Parses a date string and returns a Date object
 * Handles various date formats that might come from APIs
 */
export const parseAPIDate = (dateString: string): Date => {
  // Handle YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return new Date(dateString + 'T00:00:00.000Z');
  }
  
  // Handle timestamp format
  if (/^\d+$/.test(dateString)) {
    return new Date(parseInt(dateString));
  }
  
  // Default to standard Date parsing
  return new Date(dateString);
};

/**
 * Checks if two dates are the same day (ignoring time)
 */
export const isSameDay = (date1: Date | string, date2: Date | string): boolean => {
  const d1 = typeof date1 === 'string' ? parseAPIDate(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseAPIDate(date2) : date2;
  
  return formatDateForAPI(d1) === formatDateForAPI(d2);
};