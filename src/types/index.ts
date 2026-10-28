export type UserRole = 'EMPLOYEE' | 'ADMIN';

export type RoomStatusType = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

export type BookingStatusType = 'CONFIRMED' | 'CANCELLED';

export type NotificationType =
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_UPDATED'
  | 'BOOKING_CANCELLED'
  | 'REMINDER_15MIN'
  | 'SYSTEM';

export interface RoomItem {
  id: string;
  name: string;
  capacity: number;
  floor: number;
  description: string | null;
  amenities: string[];
  status: RoomStatusType;
  imageUrl: string | null;
  color: string;
  createdAt: string;
  updatedAt: string;
  isAvailableNow?: boolean;
  currentBooking?: {
    id: string;
    title: string;
    userName: string;
    startTime: string;
    endTime: string;
  } | null;
}

export interface BookingItem {
  id: string;
  roomId: string;
  room: {
    id: string;
    name: string;
    color: string;
    floor: number;
    capacity: number;
  };
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    department: string | null;
    avatarUrl: string | null;
  };
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  participantCount: number;
  participantsNote: string | null;
  status: BookingStatusType;
  cancelledReason: string | null;
  cancelledAt: string | null;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  linkUrl: string | null;
  createdAt: string;
}

export interface DashboardStats {
  totalRooms: number;
  availableRoomsNow: number;
  busyRoomsNow: number;
  todayBookingsCount: number;
  totalParticipantsToday: number;
  roomUtilization: {
    name: string;
    rate: number;
    color: string;
  }[];
  popularRooms: {
    name: string;
    bookingCount: number;
    hours: number;
  }[];
  peakHours: {
    hour: string;
    bookings: number;
  }[];
}
