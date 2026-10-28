import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();
    // Start of today and end of today in local context
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // 1. ดึงห้องประชุมทั้งหมด
    const rooms = await prisma.room.findMany({
      where: { isActive: true },
      include: {
        bookings: {
          where: {
            status: "CONFIRMED",
            startTime: { lte: endOfToday },
            endTime: { gte: startOfToday },
          },
          orderBy: { startTime: "asc" },
        },
      },
    });

    // 2. วิเคราะห์สถานะปัจจุบันของแต่ละห้อง (ห้องที่ใช้งานอยู่ตอนนี้)
    let inUseCount = 0;
    const roomStatuses = rooms.map((room) => {
      // ตรวจสอบว่าขณะนี้ (now) มีการประชุมไหนกำลังดำเนินอยู่
      const currentBooking = room.bookings.find(
        (b) => new Date(b.startTime) <= now && new Date(b.endTime) >= now
      );

      // ค้นหาการประชุมถัดไปในวันนี้
      const nextBooking = room.bookings.find(
        (b) => new Date(b.startTime) > now
      );

      if (currentBooking) inUseCount++;

      return {
        id: room.id,
        name: room.name,
        code: room.code,
        capacity: room.capacity,
        color: room.color,
        location: room.location,
        isCurrentlyInUse: !!currentBooking,
        currentMeeting: currentBooking
          ? {
              id: currentBooking.id,
              bookingCode: currentBooking.bookingCode,
              title: currentBooking.title,
              bookerName: currentBooking.bookerName,
              bookerDepartment: currentBooking.bookerDepartment,
              startTime: currentBooking.startTime,
              endTime: currentBooking.endTime,
            }
          : null,
        nextMeeting: nextBooking
          ? {
              id: nextBooking.id,
              title: nextBooking.title,
              startTime: nextBooking.startTime,
              endTime: nextBooking.endTime,
            }
          : null,
      };
    });

    // 3. การจองวันนี้ทั้งหมด
    const todayBookings = await prisma.booking.findMany({
      where: {
        status: "CONFIRMED",
        startTime: { gte: startOfToday, lte: endOfToday },
      },
      include: {
        room: true,
      },
      orderBy: { startTime: "asc" },
    });

    // 4. คำนวณอัตราการใช้ห้อง (Room Utilization Rate)
    // สมมติเวลาทำการ 08:00 - 18:00 (10 ชั่วโมงต่อวัน ต่อห้อง)
    const totalAvailableHours = Math.max(1, rooms.length * 10);
    let totalBookedHoursToday = 0;

    todayBookings.forEach((b) => {
      const s = Math.max(new Date(b.startTime).getTime(), startOfToday.getTime());
      const e = Math.min(new Date(b.endTime).getTime(), endOfToday.getTime());
      const durationHours = (e - s) / (1000 * 60 * 60);
      if (durationHours > 0) totalBookedHoursToday += durationHours;
    });

    const utilizationRate = Math.min(
      100,
      Math.round((totalBookedHoursToday / totalAvailableHours) * 100)
    );

    // 5. ห้องยอดนิยม (Popular Rooms) จากประวัติการจองทั้งหมด
    const popularRooms = await prisma.room.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        color: true,
        _count: {
          select: {
            bookings: {
              where: { status: "CONFIRMED" },
            },
          },
        },
      },
      orderBy: {
        bookings: {
          _count: "desc",
        },
      },
      take: 5,
    });

    // 6. ช่วงเวลาที่ใช้มากที่สุด (Peak Hours 08:00 - 18:00)
    const hourCounts: { [hour: number]: number } = {};
    for (let h = 8; h <= 17; h++) {
      hourCounts[h] = 0;
    }

    // วิเคราะห์การจองในรอบ 30 วันที่ผ่านมา
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentBookings = await prisma.booking.findMany({
      where: {
        status: "CONFIRMED",
        startTime: { gte: thirtyDaysAgo },
      },
      select: { startTime: true, endTime: true },
    });

    recentBookings.forEach((b) => {
      const startH = new Date(b.startTime).getHours();
      const endH = new Date(b.endTime).getHours();
      for (let h = startH; h <= endH; h++) {
        if (hourCounts[h] !== undefined) {
          hourCounts[h]++;
        }
      }
    });

    const peakHoursData = Object.entries(hourCounts).map(([h, count]) => ({
      hour: `${h.padStart(2, "0")}:00`,
      count,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalRooms: rooms.length,
        inUseCount,
        availableCount: rooms.length - inUseCount,
        todayBookingsCount: todayBookings.length,
        utilizationRate,
        totalBookedHoursToday: Math.round(totalBookedHoursToday * 10) / 10,
        roomStatuses,
        todayBookings,
        popularRooms: popularRooms.map((r) => ({
          name: r.name,
          code: r.code,
          color: r.color,
          bookingCount: r._count.bookings,
        })),
        peakHoursData,
      },
    });
  } catch (error: any) {
    console.error("GET /api/dashboard/stats Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
