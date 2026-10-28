import { format, parseISO } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { th } from 'date-fns/locale';

export const TIMEZONE = process.env.NEXT_PUBLIC_TIMEZONE || 'Asia/Bangkok';

/**
 * Format a Date or ISO string into a Thai readable date (e.g. 28 ต.ค. 2569)
 */
export function formatThaiDate(dateInput: Date | string, formatPattern: string = 'd MMM yyyy'): string {
  const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
  return formatInTimeZone(date, TIMEZONE, formatPattern, { locale: th });
}

/**
 * Format time in Thai (e.g. 09:30 น.)
 */
export function formatThaiTime(dateInput: Date | string): string {
  const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
  return `${formatInTimeZone(date, TIMEZONE, 'HH:mm')} น.`;
}

/**
 * Format full Thai DateTime (e.g. 28 ต.ค. 2026, 09:30 - 11:30 น.)
 */
export function formatThaiDateRange(startInput: Date | string, endInput: Date | string): string {
  const start = typeof startInput === 'string' ? parseISO(startInput) : startInput;
  const end = typeof endInput === 'string' ? parseISO(endInput) : endInput;

  const dateStr = formatThaiDate(start, 'EEEEที่ d MMMM yyyy');
  const startTimeStr = formatInTimeZone(start, TIMEZONE, 'HH:mm');
  const endTimeStr = formatInTimeZone(end, TIMEZONE, 'HH:mm');

  return `${dateStr} (${startTimeStr} - ${endTimeStr} น.)`;
}

/**
 * Get current date-time zoned to Asia/Bangkok
 */
export function getBangkokNow(): Date {
  return toZonedTime(new Date(), TIMEZONE);
}

/**
 * Convert ISO string input from datetime-local to UTC Date object
 */
export function parseLocalInputToDate(isoLocalString: string): Date {
  // If string has format "YYYY-MM-DDTHH:mm", treat it in Asia/Bangkok timezone
  const date = new Date(isoLocalString);
  return date;
}
