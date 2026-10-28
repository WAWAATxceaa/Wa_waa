import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkBookingConflict } from "@/lib/conflict-detector";
import { broadcastSSE } from "@/lib/sse-broker";

// GET /api/bookings/[code] - ดูรายละเอียดการจอง
export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const phone = searchParams.get("phone");

    const booking = await prisma.booking.findUnique({
      where: { bookingCode: code },
      include: {
        room: true,
        equipments: {
          include: { equipment: true },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลการจองตามรหัสที่ระบุ" },
        { status: 404 }
      );
    }

    // ตรวจสอบสิทธิ์ (ถ้ามี token ให้เช็คตรงกัน, หรือถ้ามีเบอร์โทรให้เช็คตรงกัน)
    const isAuthorized =
      (token && booking.manageToken === token) ||
      (phone && booking.bookerPhone.replace(/\D/g, "") === phone.replace(/\D/g, ""));

    return NextResponse.json({
      success: true,
      data: booking,
      canManage: isAuthorized,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/bookings/[code] - แก้ไขการจอง
export async function PUT(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;
    const body = await req.json();
    const {
      token,
      phone,
      title,
      description,
      startTime,
      endTime,
      participantCount,
      roomId,
      equipmentIds,
    } = body;

    const booking = await prisma.booking.findUnique({
      where: { bookingCode: code },
      include: { room: true },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "ไม่พบการจองที่ต้องการแก้ไข" },
        { status: 404 }
      );
    }

    if (booking.status === "CANCELLED") {
      return NextResponse.json(
        { success: false, message: "การจองนี้ถูกยกเลิกไปแล้ว ไม่สามารถแก้ไขได้" },
        { status: 400 }
      );
    }

    // ตรวจสอบสิทธิ์ด้วย Token หรือเบอร์โทรศัพท์
    const isAuthorized =
      (token && booking.manageToken === token) ||
      (phone && booking.bookerPhone.replace(/\D/g, "") === phone.replace(/\D/g, ""));

    if (!isAuthorized) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่มีสิทธิ์แก้ไขการจอง กรุณาระบุรหัส Token หรือเบอร์โทรศัพท์ที่ถูกต้อง",
        },
        { status: 403 }
      );
    }

    const targetRoomId = roomId || booking.roomId;
    const targetStart = startTime ? new Date(startTime) : booking.startTime;
    const targetEnd = endTime ? new Date(endTime) : booking.endTime;

    if (targetStart >= targetEnd) {
      return NextResponse.json(
        { success: false, message: "เวลาเริ่มต้นต้องน้อยกว่าเวลาสิ้นสุด" },
        { status: 400 }
      );
    }

    // ตรวจสอบเวลาชน
    const conflictResult = await checkBookingConflict({
      roomId: targetRoomId,
      startTime: targetStart,
      endTime: targetEnd,
      excludeBookingId: booking.id,
    });

    if (conflictResult.hasConflict) {
      return NextResponse.json(
        {
          success: false,
          message: conflictResult.message || "ช่วงเวลาที่ขอเปลี่ยนติดการจองอื่น",
        },
        { status: 409 }
      );
    }

    // อัปเดตข้อมูล
    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        title: title || booking.title,
        description: description !== undefined ? description : booking.description,
        startTime: targetStart,
        endTime: targetEnd,
        roomId: targetRoomId,
        participantCount: participantCount
          ? Number(participantCount)
          : booking.participantCount,
      },
      include: {
        room: true,
        equipments: {
          include: { equipment: true },
        },
      },
    });

    // อัปเดตอุปกรณ์หากส่งมา
    if (equipmentIds && Array.isArray(equipmentIds)) {
      await prisma.bookingEquipment.deleteMany({
        where: { bookingId: booking.id },
      });
      if (equipmentIds.length > 0) {
        await prisma.bookingEquipment.createMany({
          data: equipmentIds.map((eqId: string) => ({
            bookingId: booking.id,
            equipmentId: eqId,
            quantity: 1,
          })),
        });
      }
    }

    // แจ้งเตือน Real-time SSE
    broadcastSSE("booking_updated", {
      booking: {
        id: updated.id,
        bookingCode: updated.bookingCode,
        title: updated.title,
        roomName: updated.room.name,
        startTime: updated.startTime,
        endTime: updated.endTime,
      },
    });

    return NextResponse.json({
      success: true,
      message: "แก้ไขการจองสำเร็จ",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/bookings/[code] - ขอยกเลิกการจอง
export async function DELETE(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;
    const body = await req.json().catch(() => ({}));
    const { token, phone, cancelReason } = body;

    const booking = await prisma.booking.findUnique({
      where: { bookingCode: code },
      include: { room: true },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "ไม่พบการจองที่ต้องการยกเลิก" },
        { status: 404 }
      );
    }

    const isAuthorized =
      (token && booking.manageToken === token) ||
      (phone && booking.bookerPhone.replace(/\D/g, "") === phone.replace(/\D/g, ""));

    if (!isAuthorized) {
      return NextResponse.json(
        {
          success: false,
          message: "ไม่มีสิทธิ์ยกเลิก กรุณาใช้ลิงก์จัดการเฉพาะหรือระบุเบอร์โทรที่ถูกต้อง",
        },
        { status: 403 }
      );
    }

    const cancelled = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancelReason: cancelReason || "ผู้จองขอยกเลิกผ่านระบบ",
      },
    });

    // แจ้งเตือน Real-time SSE
    broadcastSSE("booking_cancelled", {
      booking: {
        id: cancelled.id,
        bookingCode: cancelled.bookingCode,
        title: cancelled.title,
        roomName: booking.room.name,
        cancelReason: cancelled.cancelReason,
      },
    });

    return NextResponse.json({
      success: true,
      message: "ยกเลิกการจองสำเร็จ",
      data: cancelled,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
