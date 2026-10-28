import { prisma } from "@/lib/prisma";
import { BookingInput } from "@/lib/validations/booking";
import { BookingStatus, NotificationType, Role } from "@prisma/client";
import { broadcastEvent } from "@/lib/sse";

export class BookingConflictError extends Error {
  constructor(message = "ห้องประชุมนี้ถูกจองแล้วในช่วงเวลาดังกล่าว กรุณาเลือกช่วงเวลาอื่น") {
    super(message);
    this.name = "BookingConflictError";
  }
}

export class BookingValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BookingValidationError";
  }
}

export class BookingForbiddenError extends Error {
  constructor(message = "คุณไม่มีสิทธิ์ในการยกเลิกหรือแก้ไขการจองนี้") {
    super(message);
    this.name = "BookingForbiddenError";
  }
}

export async function createBooking(userId: string, input: BookingInput) {
  return await prisma.$transaction(async (tx) => {
    // 1. ตรวจสอบว่าห้องประชุมมีอยู่จริงและเปิดใช้งานอยู่หรือไม่
    const room = await tx.room.findUnique({
      where: { id: input.roomId },
    });

    if (!room) {
      throw new BookingValidationError("ไม่พบห้องประชุมที่เลือก");
    }

    if (room.status !== "ACTIVE") {
      throw new BookingValidationError(
        `ห้องประชุม "${room.name}" ปัจจุบันอยู่ในสถานะ ${room.status === "MAINTENANCE" ? "ปิดปรับปรุง" : "ปิดใช้งาน"} ไม่สามารถจองได้`
      );
    }

    // 2. ตรวจสอบเงื่อนไขการจองทับซ้อน (Strict Overlapping Check)
    // เงื่อนไข: (startTime < newEndTime) AND (endTime > newStartTime)
    const conflictingBooking = await tx.booking.findFirst({
      where: {
        roomId: input.roomId,
        status: BookingStatus.CONFIRMED,
        startTime: { lt: input.endTime },
        endTime: { gt: input.startTime },
      },
      include: {
        user: { select: { name: true } },
      },
    });

    if (conflictingBooking) {
      throw new BookingConflictError(
        `ห้องประชุม "${room.name}" ถูกจองแล้วในช่วงเวลาดังกล่าว โดยคุณ${conflictingBooking.user.name} (${conflictingBooking.title})`
      );
    }

    // 3. บันทึกข้อมูลการจอง
    const booking = await tx.booking.create({
      data: {
        roomId: input.roomId,
        userId: userId,
        title: input.title,
        description: input.description,
        startTime: input.startTime,
        endTime: input.endTime,
        participantCount: input.participantCount,
        participantsNote: input.participantsNote,
        status: BookingStatus.CONFIRMED,
      },
      include: {
        room: true,
        user: { select: { id: true, name: true, email: true, department: true } },
      },
    });

    // 4. สร้างการแจ้งเตือนในระบบให้แก่ผู้จอง
    const notification = await tx.notification.create({
      data: {
        userId: userId,
        title: "จองห้องประชุมสำเร็จ",
        message: `คุณได้จอง "${room.name}" สำหรับ "${booking.title}" เรียบร้อยแล้ว`,
        type: NotificationType.BOOKING_CONFIRMED,
        linkUrl: `/calendar`,
      },
    });

    // 5. Broadcast ผ่าน SSE ไปยังผู้ใช้ทุกคนให้ปฏิทินอัปเดตแบบเรียลไทม์
    broadcastEvent({
      type: "booking:created",
      payload: booking,
    });

    broadcastEvent({
      type: "notification:new",
      payload: notification,
      targetUserId: userId,
    });

    return booking;
  });
}

export async function cancelBooking(
  bookingId: string,
  userId: string,
  userRole: Role,
  reason?: string
) {
  return await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: { room: true, user: true },
    });

    if (!booking) {
      throw new BookingValidationError("ไม่พบรายการจองนี้ในระบบ");
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BookingValidationError("รายการจองนี้ถูกยกเลิกไปแล้ว");
    }

    // กฎธุรกิจ: ยกเลิกได้เฉพาะเจ้าของการจองหรือ Admin
    const isOwner = booking.userId === userId;
    const isAdmin = userRole === Role.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new BookingForbiddenError("คุณสามารถยกเลิกได้เฉพาะการจองของตนเองเท่านั้น");
    }

    const cancelledReason = reason || (isAdmin && !isOwner ? "ยกเลิกโดยผู้ดูแลระบบ (Admin)" : "ยกเลิกโดยผู้จอง");

    const updatedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledReason: cancelledReason,
        cancelledAt: new Date(),
      },
      include: {
        room: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // สร้างแจ้งเตือนให้เจ้าของการจอง (หาก Admin เป็นผู้ยกเลิก)
    const notification = await tx.notification.create({
      data: {
        userId: booking.userId,
        title: "การจองห้องประชุมถูกยกเลิก",
        message: `การจอง "${booking.title}" ณ ห้อง "${booking.room.name}" ถูกยกเลิก (${cancelledReason})`,
        type: NotificationType.BOOKING_CANCELLED,
        linkUrl: `/bookings`,
      },
    });

    // Broadcast Real-time event
    broadcastEvent({
      type: "booking:cancelled",
      payload: updatedBooking,
    });

    broadcastEvent({
      type: "notification:new",
      payload: notification,
      targetUserId: booking.userId,
    });

    return updatedBooking;
  });
}

export async function getBookings(params?: {
  roomId?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: BookingStatus;
}) {
  const where: any = {};

  if (params?.roomId) where.roomId = params.roomId;
  if (params?.userId) where.userId = params.userId;
  if (params?.status) where.status = params.status;

  if (params?.startDate || params?.endDate) {
    where.AND = [];
    if (params.startDate) {
      where.AND.push({ endTime: { gte: params.startDate } });
    }
    if (params.endDate) {
      where.AND.push({ startTime: { lte: params.endDate } });
    }
  }

  return await prisma.booking.findMany({
    where,
    include: {
      room: {
        select: {
          id: true,
          name: true,
          color: true,
          floor: true,
          capacity: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          department: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: {
      startTime: "asc",
    },
  });
}
