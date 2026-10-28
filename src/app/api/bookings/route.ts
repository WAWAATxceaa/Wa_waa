import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkBookingConflict } from "@/lib/conflict-detector";
import { generateBookingCode, generateManageToken } from "@/lib/booking-code";
import { broadcastSSE } from "@/lib/sse-broker";

// GET /api/bookings - ค้นหาและดึงรายการจองห้อง
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");
    const department = searchParams.get("department");
    const query = searchParams.get("q");

    const whereClause: any = {};

    if (roomId && roomId !== "all") {
      whereClause.roomId = roomId;
    }

    if (status && status !== "all") {
      whereClause.status = status;
    } else {
      // ค่าเริ่มต้นแสดงเฉพาะที่ยืนยันแล้ว ถ้าไม่ได้ระบุ
      whereClause.status = "CONFIRMED";
    }

    if (department && department !== "all") {
      whereClause.bookerDepartment = department;
    }

    if (startDate && endDate) {
      whereClause.AND = [
        { startTime: { gte: new Date(startDate) } },
        { endTime: { lte: new Date(endDate) } },
      ];
    } else if (startDate) {
      whereClause.startTime = { gte: new Date(startDate) };
    }

    if (query) {
      whereClause.OR = [
        { title: { contains: query } },
        { bookerName: { contains: query } },
        { bookingCode: { contains: query } },
        { bookerDepartment: { contains: query } },
      ];
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        room: true,
        equipments: {
          include: {
            equipment: true,
          },
        },
      },
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json({ success: true, data: bookings });
  } catch (error: any) {
    console.error("GET /api/bookings Error:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงรายการจอง" },
      { status: 500 }
    );
  }
}

// POST /api/bookings - สร้างการจองห้องใหม่ (Zero-Auth + Conflict Prevention)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      roomId,
      bookerName,
      bookerDepartment,
      bookerEmail,
      bookerPhone,
      title,
      description,
      startTime,
      endTime,
      participantCount,
      equipmentIds,
    } = body;

    // 1. ตรวจสอบข้อมูลจำเป็น
    if (
      !roomId ||
      !bookerName ||
      !bookerDepartment ||
      !bookerPhone ||
      !title ||
      !startTime ||
      !endTime
    ) {
      return NextResponse.json(
        { success: false, message: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน" },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      return NextResponse.json(
        { success: false, message: "ช่วงเวลาเริ่มต้นและสิ้นสุดไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // 2. ตรวจสอบสถานะและความจุห้อง
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json(
        { success: false, message: "ไม่พบห้องประชุมที่เลือก" },
        { status: 404 }
      );
    }

    if (!room.isActive) {
      return NextResponse.json(
        { success: false, message: `ห้อง "${room.name}" ปิดปรับปรุงอยู่ ไม่สามารถจองได้` },
        { status: 400 }
      );
    }

    const participants = Number(participantCount) || 1;
    if (participants > room.capacity) {
      return NextResponse.json(
        {
          success: false,
          message: `จำนวนผู้เข้าร่วม (${participants} คน) เกินความจุของห้อง (${room.capacity} คน)`,
        },
        { status: 400 }
      );
    }

    // 3. ตรวจสอบเวลาชน (Double Booking Check)
    const conflictResult = await checkBookingConflict({
      roomId,
      startTime: start,
      endTime: end,
    });

    if (conflictResult.hasConflict) {
      return NextResponse.json(
        {
          success: false,
          message: conflictResult.message || "ช่วงเวลานี้มีการจองห้องประชุมแล้ว",
          conflictBooking: conflictResult.conflictBooking,
        },
        { status: 409 }
      );
    }

    // 4. สร้าง Booking Code และ Manage Token
    const bookingCode = generateBookingCode();
    const manageToken = generateManageToken();

    // 5. บันทึกลงฐานข้อมูลใน Transaction
    const newBooking = await prisma.$transaction(async (tx) => {
      // Re-verify conflict inside transaction to avoid race condition
      const checkAgain = await tx.booking.findFirst({
        where: {
          roomId,
          status: "CONFIRMED",
          AND: [
            { startTime: { lt: end } },
            { endTime: { gt: start } },
          ],
        },
      });

      if (checkAgain) {
        throw new Error("ช่วงเวลานี้ถูกผู้อื่นจองตัดหน้าไปแล้ว กรุณาเลือกเวลาใหม่");
      }

      return await tx.booking.create({
        data: {
          bookingCode,
          manageToken,
          roomId,
          bookerName,
          bookerDepartment,
          bookerEmail: bookerEmail || "",
          bookerPhone,
          title,
          description: description || null,
          startTime: start,
          endTime: end,
          participantCount: participants,
          status: "CONFIRMED",
          equipments:
            equipmentIds && Array.isArray(equipmentIds) && equipmentIds.length > 0
              ? {
                  create: equipmentIds.map((eqId: string) => ({
                    equipmentId: eqId,
                    quantity: 1,
                  })),
                }
              : undefined,
        },
        include: {
          room: true,
          equipments: {
            include: { equipment: true },
          },
        },
      });
    });

    // 6. Broadcast Real-time Event ผ่าน SSE
    broadcastSSE("booking_created", {
      booking: {
        id: newBooking.id,
        bookingCode: newBooking.bookingCode,
        title: newBooking.title,
        roomName: newBooking.room.name,
        roomColor: newBooking.room.color,
        startTime: newBooking.startTime,
        endTime: newBooking.endTime,
        bookerName: newBooking.bookerName,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "จองห้องประชุมสำเร็จ",
        data: {
          id: newBooking.id,
          bookingCode: newBooking.bookingCode,
          manageToken: newBooking.manageToken,
          manageUrl: `/manage/${newBooking.bookingCode}?token=${newBooking.manageToken}`,
          title: newBooking.title,
          room: newBooking.room,
          startTime: newBooking.startTime,
          endTime: newBooking.endTime,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/bookings Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "เกิดข้อผิดพลาดในการจองห้องประชุม",
      },
      { status: error.message?.includes("จองตัดหน้า") ? 409 : 500 }
    );
  }
}
