import { prisma } from "./prisma";

export interface ConflictCheckParams {
  roomId: string;
  startTime: Date | string;
  endTime: Date | string;
  excludeBookingId?: string;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictBooking?: {
    id: string;
    bookingCode: string;
    title: string;
    startTime: Date;
    endTime: Date;
    bookerName: string;
  } | null;
  message?: string;
}

/**
 * ตรวจสอบว่าช่วงเวลาที่เลือกมีการจองซ้อนทับหรือไม่
 * เงื่อนไขการชน: (startTime < newEndTime) AND (endTime > newStartTime)
 */
export async function checkBookingConflict({
  roomId,
  startTime,
  endTime,
  excludeBookingId,
}: ConflictCheckParams): Promise<ConflictCheckResult> {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (start >= end) {
    return {
      hasConflict: true,
      message: "เวลาเริ่มต้นต้องน้อยกว่าเวลาสิ้นสุด",
    };
  }

  // ค้นหาการจองที่ชนกัน
  const conflict = await prisma.booking.findFirst({
    where: {
      roomId,
      status: "CONFIRMED",
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
      AND: [
        {
          startTime: {
            lt: end,
          },
        },
        {
          endTime: {
            gt: start,
          },
        },
      ],
    },
    select: {
      id: true,
      bookingCode: true,
      title: true,
      startTime: true,
      endTime: true,
      bookerName: true,
    },
  });

  if (conflict) {
    return {
      hasConflict: true,
      conflictBooking: conflict,
      message: `ช่วงเวลานี้มีการจองแล้ว: "${conflict.title}" โดย ${conflict.bookerName}`,
    };
  }

  return {
    hasConflict: false,
  };
}
