import { Booking, SheetWebhookPayload } from '../types';

const WEBHOOK_URL = import.meta.env.VITE_SHEETS_WEBHOOK_URL || '';
const SECRET_TOKEN = import.meta.env.VITE_SHEETS_SECRET_TOKEN || 'SMART_MEETING_2026_SECURE_KEY';

/**
 * Maps Booking object to Google Sheets Webhook payload format
 */
export function createSheetPayload(
  booking: Booking,
  action: 'create' | 'update' | 'cancel'
): SheetWebhookPayload {
  const statusThai =
    action === 'cancel' || booking.status === 'cancelled'
      ? 'ยกเลิก'
      : action === 'update'
      ? 'แก้ไข'
      : 'จองสำเร็จ';

  return {
    action,
    bookingCode: booking.bookingCode,
    status: statusThai,
    roomName: booking.roomName,
    date: booking.date,
    startTime: booking.startTime,
    endTime: booking.endTime,
    participantCount: booking.participantCount,
    amenities: (booking.amenities || []).join(', ') || '-',
    bookerName: booking.bookerName,
    department: booking.department,
    contact: booking.bookerContact,
    title: booking.title,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt || booking.createdAt,
    secretToken: SECRET_TOKEN,
  };
}

/**
 * Sends booking update to Google Sheet Webhook via fetch POST (Content-Type: text/plain).
 * Retries up to 3 times with exponential backoff on failure.
 * Non-blocking: will never crash the main booking flow.
 */
export async function syncToGoogleSheet(
  booking: Booking,
  action: 'create' | 'update' | 'cancel' = 'create'
): Promise<{ success: boolean; message?: string }> {
  if (!WEBHOOK_URL) {
    console.log('ℹ️ Google Sheets Webhook URL is not configured (VITE_SHEETS_WEBHOOK_URL). Skipping sheet sync.');
    return { success: false, message: 'ไม่ได้ตั้งค่า URL Webhook' };
  }

  const payload = createSheetPayload(booking, action);
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Content-Type: text/plain is used deliberately to prevent CORS Preflight OPTIONS in Google Apps Script
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log(`✅ Google Sheet synced successfully on attempt ${attempt}`);
        return { success: true };
      }
    } catch (err) {
      console.warn(`⚠️ Google Sheet sync attempt ${attempt}/${maxRetries} failed:`, err);
    }

    // Wait before retrying (exponential backoff: 500ms, 1000ms, 2000ms)
    if (attempt < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 500));
    }
  }

  console.warn('⚠️ Google Sheet sync failed after 3 attempts. Local & Firestore data remains intact.');
  return { success: false, message: 'ไม่สามารถส่งข้อมูลไปยัง Google Sheet ได้ (ลองครบ 3 ครั้ง)' };
}
