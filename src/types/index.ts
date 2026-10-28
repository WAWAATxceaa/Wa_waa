export type RoomStatus = 'active' | 'maintenance' | 'inactive';

export type BookingStatus = 'confirmed' | 'cancelled';

export interface Room {
  id: string;
  name: string;
  capacity: number;
  floor: number;
  description?: string;
  amenities: ('projector' | 'tv' | 'videoconference' | 'whiteboard')[];
  status: RoomStatus;
  imageUrl?: string;
  color: string;
  order: number;
  // Computed properties
  isAvailableNow?: boolean;
  currentBooking?: {
    id: string;
    title: string;
    bookerName: string;
    startTime: string;
    endTime: string;
  } | null;
}

export interface Booking {
  id: string;
  bookingCode: string; // 6-digit alphanumeric code e.g. "MT-8429" or "A9K2P4"
  roomId: string;
  roomName: string;
  roomColor?: string;
  date: string; // 'YYYY-MM-DD'
  startTime: string; // 'HH:mm'
  endTime: string; // 'HH:mm'
  startDateTime: string; // ISO string
  endDateTime: string; // ISO string
  participantCount: number;
  amenities: string[];
  bookerName: string;
  department: string;
  bookerContact: string; // phone or email
  title: string; // meeting topic
  description?: string;
  status: BookingStatus;
  cancelledReason?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  type: 'new_booking' | 'booking_updated' | 'booking_cancelled' | 'reminder_15min' | 'system';
  bookingId?: string;
  bookingCode?: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface SheetWebhookPayload {
  action: 'create' | 'update' | 'cancel';
  bookingCode: string;
  status: string;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  participantCount: number;
  amenities: string;
  bookerName: string;
  department: string;
  contact: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  secretToken?: string;
}
