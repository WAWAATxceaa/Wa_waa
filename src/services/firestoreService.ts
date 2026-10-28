import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  getDocs,
  query,
  where,
  runTransaction,
  Firestore,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase';
import { Booking, Room, NotificationItem } from '../types';
import { INITIAL_ROOMS } from '../config/constants';
import { isTimeSlotConflicting } from '../utils/dateUtils';
import { syncToGoogleSheet } from './sheetsService';

// Local storage fallback keys
const LS_ROOMS_KEY = 'smart_meeting_rooms_v1';
const LS_BOOKINGS_KEY = 'smart_meeting_bookings_v1';
const LS_NOTIFICATIONS_KEY = 'smart_meeting_notifications_v1';

// Custom Event target for reactive updates when running in local fallback mode
const localEventBus = new EventTarget();

const getActiveDb = (): Firestore => db as Firestore;

function getStoredLocalData<T>(key: string, defaultData: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultData;
  } catch (e) {
    return defaultData;
  }
}

function saveLocalData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    localEventBus.dispatchEvent(new CustomEvent('datachange', { detail: { key } }));
  } catch (e) {
    console.error('LocalStorage write failed:', e);
  }
}

/**
 * Initialize sample rooms if not already seeded
 */
export async function seedInitialRoomsIfEmpty(): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(getActiveDb(), 'rooms'));
      if (snap.empty) {
        console.log('Seeding initial 5 rooms to Firestore...');
        for (const room of INITIAL_ROOMS) {
          await setDoc(doc(getActiveDb(), 'rooms', room.id), room);
        }
      }
    } catch (e) {
      console.warn('Firestore seeding check error:', e);
    }
  } else {
    // Local fallback check
    const localRooms = getStoredLocalData<Room[]>(LS_ROOMS_KEY, []);
    if (localRooms.length === 0) {
      saveLocalData(LS_ROOMS_KEY, INITIAL_ROOMS);
    }
  }
}

/**
 * Real-time listener for Rooms
 */
export function subscribeRooms(callback: (rooms: Room[]) => void): () => void {
  seedInitialRoomsIfEmpty();

  if (isFirebaseConfigured && db) {
    const unsubscribe = onSnapshot(
      collection(getActiveDb(), 'rooms'),
      (snapshot) => {
        const rooms: Room[] = [];
        snapshot.forEach((docItem) => {
          rooms.push({ ...(docItem.data() as Room), id: docItem.id });
        });
        rooms.sort((a, b) => (a.order || 0) - (b.order || 0));
        callback(rooms.length > 0 ? rooms : INITIAL_ROOMS);
      },
      (error) => {
        console.warn('Firestore room snapshot error, using local fallback:', error);
        callback(getStoredLocalData<Room[]>(LS_ROOMS_KEY, INITIAL_ROOMS));
      }
    );
    return unsubscribe;
  }

  // Local fallback
  const emit = () => {
    const rooms = getStoredLocalData<Room[]>(LS_ROOMS_KEY, INITIAL_ROOMS);
    callback(rooms.sort((a, b) => (a.order || 0) - (b.order || 0)));
  };
  emit();

  const listener = () => emit();
  localEventBus.addEventListener('datachange', listener);
  window.addEventListener('storage', listener);

  return () => {
    localEventBus.removeEventListener('datachange', listener);
    window.removeEventListener('storage', listener);
  };
}

/**
 * Real-time listener for Bookings
 */
export function subscribeBookings(callback: (bookings: Booking[]) => void): () => void {
  if (isFirebaseConfigured && db) {
    const unsubscribe = onSnapshot(
      collection(getActiveDb(), 'bookings'),
      (snapshot) => {
        const bookings: Booking[] = [];
        snapshot.forEach((docItem) => {
          bookings.push({ ...(docItem.data() as Booking), id: docItem.id });
        });
        callback(bookings);
      },
      (error) => {
        console.warn('Firestore bookings snapshot error, using local fallback:', error);
        callback(getStoredLocalData<Booking[]>(LS_BOOKINGS_KEY, []));
      }
    );
    return unsubscribe;
  }

  // Local fallback
  const emit = () => {
    const bookings = getStoredLocalData<Booking[]>(LS_BOOKINGS_KEY, []);
    callback(bookings);
  };
  emit();

  const listener = () => emit();
  localEventBus.addEventListener('datachange', listener);
  window.addEventListener('storage', listener);

  return () => {
    localEventBus.removeEventListener('datachange', listener);
    window.removeEventListener('storage', listener);
  };
}

/**
 * Real-time listener for Notifications
 */
export function subscribeNotifications(callback: (notifications: NotificationItem[]) => void): () => void {
  if (isFirebaseConfigured && db) {
    const unsubscribe = onSnapshot(
      collection(getActiveDb(), 'notifications'),
      (snapshot) => {
        const items: NotificationItem[] = [];
        snapshot.forEach((docItem) => {
          items.push({ ...(docItem.data() as NotificationItem), id: docItem.id });
        });
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(items);
      },
      (error) => {
        console.warn('Firestore notifications snapshot error, using local fallback:', error);
        callback(getStoredLocalData<NotificationItem[]>(LS_NOTIFICATIONS_KEY, []));
      }
    );
    return unsubscribe;
  }

  const emit = () => {
    const items = getStoredLocalData<NotificationItem[]>(LS_NOTIFICATIONS_KEY, []);
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(items);
  };
  emit();

  const listener = () => emit();
  localEventBus.addEventListener('datachange', listener);
  window.addEventListener('storage', listener);

  return () => {
    localEventBus.removeEventListener('datachange', listener);
    window.removeEventListener('storage', listener);
  };
}

/**
 * Add a notification to the system
 */
export async function addNotification(
  type: NotificationItem['type'],
  title: string,
  message: string,
  bookingId?: string,
  bookingCode?: string
): Promise<void> {
  const newNotif: NotificationItem = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type,
    title,
    message,
    bookingId,
    bookingCode,
    createdAt: new Date().toISOString(),
    read: false,
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(getActiveDb(), 'notifications', newNotif.id), newNotif);
      return;
    } catch (e) {
      console.warn('Firestore notification write failed, using local:', e);
    }
  }

  const items = getStoredLocalData<NotificationItem[]>(LS_NOTIFICATIONS_KEY, []);
  items.unshift(newNotif);
  saveLocalData(LS_NOTIFICATIONS_KEY, items);
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(getActiveDb(), 'notifications', id), { read: true });
      return;
    } catch (e) {}
  }
  const items = getStoredLocalData<NotificationItem[]>(LS_NOTIFICATIONS_KEY, []);
  const updated = items.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveLocalData(LS_NOTIFICATIONS_KEY, updated);
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  const items = getStoredLocalData<NotificationItem[]>(LS_NOTIFICATIONS_KEY, []);
  const updated = items.map((n) => ({ ...n, read: true }));
  saveLocalData(LS_NOTIFICATIONS_KEY, updated);
}

/**
 * Check for booking conflict on client before submitting
 */
export function checkBookingConflict(
  existingBookings: Booking[],
  roomId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeBookingCode?: string
): { hasConflict: boolean; conflictingBooking?: Booking; message?: string } {
  const matching = existingBookings.filter(
    (b) =>
      b.roomId === roomId &&
      b.date === date &&
      b.status === 'confirmed' &&
      (!excludeBookingCode || b.bookingCode !== excludeBookingCode)
  );

  for (const b of matching) {
    if (isTimeSlotConflicting(startTime, endTime, b.startTime, b.endTime)) {
      return {
        hasConflict: true,
        conflictingBooking: b,
        message: `ช่วงเวลา ${b.startTime} - ${b.endTime} น. ถูกจองแล้ว (${b.title} โดย ${b.bookerName})`,
      };
    }
  }

  return { hasConflict: false };
}

/**
 * Create a new booking with transaction-level double-booking prevention.
 * Returns the created booking.
 */
export async function createBooking(
  bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'status'>
): Promise<{ success: boolean; booking?: Booking; error?: string }> {
  const now = new Date().toISOString();
  const id = `bk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const newBooking: Booking = {
    ...bookingData,
    id,
    status: 'confirmed',
    createdAt: now,
    updatedAt: now,
  };

  // 1. Transaction in Firestore if configured
  if (isFirebaseConfigured && db) {
    const activeDb = getActiveDb();
    try {
      await runTransaction(activeDb, async (transaction) => {
        // Query current confirmed bookings for this room and date
        const bookingsRef = collection(activeDb, 'bookings');
        const q = query(
          bookingsRef,
          where('roomId', '==', newBooking.roomId),
          where('date', '==', newBooking.date),
          where('status', '==', 'confirmed')
        );
        const querySnapshot = await getDocs(q);
        const existing: Booking[] = [];
        querySnapshot.forEach((d) => existing.push(d.data() as Booking));

        // Check conflict inside transaction
        const conflict = checkBookingConflict(
          existing,
          newBooking.roomId,
          newBooking.date,
          newBooking.startTime,
          newBooking.endTime
        );

        if (conflict.hasConflict) {
          throw new Error(conflict.message || 'ช่วงเวลานี้เพิ่งถูกผู้อื่นจองตัดหน้า กรุณาเลือกเวลาใหม่');
        }

        const docRef = doc(activeDb, 'bookings', id);
        transaction.set(docRef, newBooking);
      });

      // Post-booking operations (notification & sheets sync)
      await addNotification(
        'new_booking',
        '🎉 มีการจองห้องใหม่',
        `${newBooking.bookerName} ได้จอง "${newBooking.roomName}" วันที่ ${newBooking.date} เวลา ${newBooking.startTime}-${newBooking.endTime} น.`,
        newBooking.id,
        newBooking.bookingCode
      );

      // Async Google Sheet sync (non-blocking)
      syncToGoogleSheet(newBooking, 'create').catch(console.warn);

      return { success: true, booking: newBooking };
    } catch (err: any) {
      console.warn('Firestore transaction failed:', err);
      return { success: false, error: err.message || 'เกิดข้อผิดพลาดในการบันทึกการจอง' };
    }
  }

  // 2. Local Fallback with conflict check
  const localBookings = getStoredLocalData<Booking[]>(LS_BOOKINGS_KEY, []);
  const conflict = checkBookingConflict(
    localBookings,
    newBooking.roomId,
    newBooking.date,
    newBooking.startTime,
    newBooking.endTime
  );

  if (conflict.hasConflict) {
    return { success: false, error: conflict.message || 'ช่วงเวลานี้มีการจองห้องแล้ว' };
  }

  localBookings.push(newBooking);
  saveLocalData(LS_BOOKINGS_KEY, localBookings);

  // Add notification
  await addNotification(
    'new_booking',
    '🎉 มีการจองห้องใหม่',
    `${newBooking.bookerName} ได้จอง "${newBooking.roomName}" วันที่ ${newBooking.date} เวลา ${newBooking.startTime}-${newBooking.endTime} น.`,
    newBooking.id,
    newBooking.bookingCode
  );

  // Async Google Sheet sync
  syncToGoogleSheet(newBooking, 'create').catch(console.warn);

  return { success: true, booking: newBooking };
}

/**
 * Update an existing booking by bookingCode
 */
export async function updateBooking(
  bookingCode: string,
  updatedFields: Partial<Booking>
): Promise<{ success: boolean; booking?: Booking; error?: string }> {
  const now = new Date().toISOString();

  if (isFirebaseConfigured && db) {
    const activeDb = getActiveDb();
    try {
      const q = query(collection(activeDb, 'bookings'), where('bookingCode', '==', bookingCode));
      const snap = await getDocs(q);
      if (snap.empty) {
        return { success: false, error: 'ไม่พบรหัสการจองนี้' };
      }

      const docItem = snap.docs[0];
      const current = docItem.data() as Booking;

      // Check conflict if room/date/time changed
      if (
        (updatedFields.roomId && updatedFields.roomId !== current.roomId) ||
        (updatedFields.date && updatedFields.date !== current.date) ||
        (updatedFields.startTime && updatedFields.startTime !== current.startTime) ||
        (updatedFields.endTime && updatedFields.endTime !== current.endTime)
      ) {
        const checkRoomId = updatedFields.roomId || current.roomId;
        const checkDate = updatedFields.date || current.date;
        const checkStart = updatedFields.startTime || current.startTime;
        const checkEnd = updatedFields.endTime || current.endTime;

        const allSnap = await getDocs(
          query(
            collection(activeDb, 'bookings'),
            where('roomId', '==', checkRoomId),
            where('date', '==', checkDate),
            where('status', '==', 'confirmed')
          )
        );
        const list: Booking[] = [];
        allSnap.forEach((d) => list.push(d.data() as Booking));

        const conflict = checkBookingConflict(
          list,
          checkRoomId,
          checkDate,
          checkStart,
          checkEnd,
          bookingCode
        );

        if (conflict.hasConflict) {
          return { success: false, error: conflict.message || 'ช่วงเวลาใหม่ทับซ้อนกับการจองอื่น' };
        }
      }

      const merged: Booking = { ...current, ...updatedFields, updatedAt: now };
      await updateDoc(doc(activeDb, 'bookings', docItem.id), merged as any);

      await addNotification(
        'booking_updated',
        '✏️ อัปเดตข้อมูลการจอง',
        `รหัส ${bookingCode} (${merged.roomName}) ได้รับการแก้ไขข้อมูลเรียบร้อยแล้ว`,
        merged.id,
        bookingCode
      );

      syncToGoogleSheet(merged, 'update').catch(console.warn);

      return { success: true, booking: merged };
    } catch (e: any) {
      return { success: false, error: e.message || 'ไม่สามารถอัปเดตการจองได้' };
    }
  }

  // Local fallback
  const list = getStoredLocalData<Booking[]>(LS_BOOKINGS_KEY, []);
  const index = list.findIndex((b) => b.bookingCode === bookingCode);
  if (index === -1) {
    return { success: false, error: 'ไม่พบรหัสการจองนี้' };
  }

  const current = list[index];
  const merged: Booking = { ...current, ...updatedFields, updatedAt: now };

  const conflict = checkBookingConflict(
    list,
    merged.roomId,
    merged.date,
    merged.startTime,
    merged.endTime,
    bookingCode
  );

  if (conflict.hasConflict) {
    return { success: false, error: conflict.message || 'ช่วงเวลาใหม่ทับซ้อนกับการจองอื่น' };
  }

  list[index] = merged;
  saveLocalData(LS_BOOKINGS_KEY, list);

  await addNotification(
    'booking_updated',
    '✏️ อัปเดตข้อมูลการจอง',
    `รหัส ${bookingCode} (${merged.roomName}) ได้รับการแก้ไขข้อมูลเรียบร้อยแล้ว`,
    merged.id,
    bookingCode
  );

  syncToGoogleSheet(merged, 'update').catch(console.warn);

  return { success: true, booking: merged };
}

/**
 * Cancel a booking by bookingCode
 */
export async function cancelBooking(
  bookingCode: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const now = new Date().toISOString();

  if (isFirebaseConfigured && db) {
    const activeDb = getActiveDb();
    try {
      const q = query(collection(activeDb, 'bookings'), where('bookingCode', '==', bookingCode));
      const snap = await getDocs(q);
      if (snap.empty) {
        return { success: false, error: 'ไม่พบรหัสการจองนี้' };
      }

      const docItem = snap.docs[0];
      const current = docItem.data() as Booking;

      const cancelledBooking: Booking = {
        ...current,
        status: 'cancelled',
        cancelledReason: reason || 'ยกเลิกโดยผู้จอง',
        cancelledAt: now,
        updatedAt: now,
      };

      await updateDoc(doc(activeDb, 'bookings', docItem.id), cancelledBooking as any);

      await addNotification(
        'booking_cancelled',
        '❌ ยกเลิกการจองห้อง',
        `รหัส ${bookingCode} ("${current.roomName}") ได้รับการยกเลิกแล้ว`,
        current.id,
        bookingCode
      );

      syncToGoogleSheet(cancelledBooking, 'cancel').catch(console.warn);

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'ไม่สามารถยกเลิกการจองได้' };
    }
  }

  // Local fallback
  const list = getStoredLocalData<Booking[]>(LS_BOOKINGS_KEY, []);
  const index = list.findIndex((b) => b.bookingCode === bookingCode);
  if (index === -1) {
    return { success: false, error: 'ไม่พบรหัสการจองนี้' };
  }

  const current = list[index];
  const cancelledBooking: Booking = {
    ...current,
    status: 'cancelled',
    cancelledReason: reason || 'ยกเลิกโดยผู้จอง',
    cancelledAt: now,
    updatedAt: now,
  };

  list[index] = cancelledBooking;
  saveLocalData(LS_BOOKINGS_KEY, list);

  await addNotification(
    'booking_cancelled',
    '❌ ยกเลิกการจองห้อง',
    `รหัส ${bookingCode} ("${current.roomName}") ได้รับการยกเลิกแล้ว`,
    current.id,
    bookingCode
  );

  syncToGoogleSheet(cancelledBooking, 'cancel').catch(console.warn);

  return { success: true };
}

/**
 * Update room details (for Admin)
 */
export async function updateRoom(
  roomId: string,
  updatedFields: Partial<Room>
): Promise<{ success: boolean; error?: string }> {
  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(getActiveDb(), 'rooms', roomId), updatedFields as any);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  const rooms = getStoredLocalData<Room[]>(LS_ROOMS_KEY, INITIAL_ROOMS);
  const idx = rooms.findIndex((r) => r.id === roomId);
  if (idx !== -1) {
    rooms[idx] = { ...rooms[idx], ...updatedFields };
    saveLocalData(LS_ROOMS_KEY, rooms);
  }
  return { success: true };
}
