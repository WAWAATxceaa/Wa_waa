import { prisma } from "@/lib/prisma";
import { BookingStatus, RoomStatus } from "@prisma/client";
import { startOfDay, endOfDay, differenceInMinutes, format } from "date-fns";

export async function getDashboardStats() {
  const now = new Date();
  const startToday = startOfDay(now);
  const endToday = endOfDay(now);

  // 1. ห้องทั้งหมดและสถานะว่าง/ไม่ว่างขณะนี้
  const rooms = await prisma.room.findMany();
  const totalRooms = rooms.length;

  const currentBookings = await prisma.booking.findMany({
    where: {
      status: BookingStatus.CONFIRMED,
      startTime: { lte: now },
      endTime: { gte: now },
    },
  });

  const busyRoomIds = new Set(currentBookings.map((b) => b.roomId));
  const busyRoomsNow = busyRoomIds.size;
  const availableRoomsNow = rooms.filter(
    (r) => r.status === RoomStatus.ACTIVE && !busyRoomIds.has(r.id)
  ).length;

  // 2. การจองวันนี้
  const todayBookings = await prisma.booking.findMany({
    where: {
      status: BookingStatus.CONFIRMED,
      startTime: { gte: startToday, lte: endToday },
    },
    include: { room: true },
  });

  const todayBookingsCount = todayBookings.length;
  const totalParticipantsToday = todayBookings.reduce(
    (sum, b) => sum + (b.participantCount || 1),
    0
  );

  // 3. อัตราการใช้ห้อง (Room Utilization Rate) - คำนวณจากยอดการใช้งานรวม
  const allConfirmedBookings = await prisma.booking.findMany({
    where: { status: BookingStatus.CONFIRMED },
    include: { room: true },
  });

  // Calculate booked minutes per room
  const roomUsageMinutes: Record<string, { name: string; minutes: number; color: string }> = {};
  rooms.forEach((r) => {
    roomUsageMinutes[r.id] = { name: r.name, minutes: 0, color: r.color };
  });

  allConfirmedBookings.forEach((b) => {
    if (roomUsageMinutes[b.roomId]) {
      const duration = differenceInMinutes(new Date(b.endTime), new Date(b.startTime));
      roomUsageMinutes[b.roomId].minutes += duration;
    }
  });

  // Utilization Rate representation
  const maxCapacityMinutes = 40 * 60; // 40 hours per week base
  const roomUtilization = Object.values(roomUsageMinutes).map((r) => {
    const rate = Math.min(100, Math.round((r.minutes / maxCapacityMinutes) * 100));
    return {
      name: r.name.replace(/ \(.*\)/, ""), // shorten label
      rate: rate > 0 ? rate : 15, // fallback small baseline for visual
      color: r.color,
    };
  });

  // 4. ห้องยอดนิยม (Popular Rooms)
  const roomBookingCount: Record<string, { name: string; count: number; hours: number }> = {};
  rooms.forEach((r) => {
    roomBookingCount[r.id] = { name: r.name, count: 0, hours: 0 };
  });

  allConfirmedBookings.forEach((b) => {
    if (roomBookingCount[b.roomId]) {
      roomBookingCount[b.roomId].count += 1;
      const durationHours = differenceInMinutes(new Date(b.endTime), new Date(b.startTime)) / 60;
      roomBookingCount[b.roomId].hours += Number(durationHours.toFixed(1));
    }
  });

  const popularRooms = Object.values(roomBookingCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((item) => ({
      name: item.name.replace(/ \(.*\)/, ""),
      bookingCount: item.count,
      hours: item.hours,
    }));

  // 5. ช่วงเวลาที่มีการใช้งานหนาแน่น (Peak Hours Distribution)
  // Check hours from 08:00 to 18:00
  const hoursCount: Record<string, number> = {
    "08:00": 0,
    "09:00": 0,
    "10:00": 0,
    "11:00": 0,
    "12:00": 0,
    "13:00": 0,
    "14:00": 0,
    "15:00": 0,
    "16:00": 0,
    "17:00": 0,
  };

  allConfirmedBookings.forEach((b) => {
    const hour = format(new Date(b.startTime), "HH:00");
    if (hoursCount[hour] !== undefined) {
      hoursCount[hour] += 1;
    }
  });

  const peakHours = Object.entries(hoursCount).map(([hour, count]) => ({
    hour,
    bookings: count,
  }));

  return {
    totalRooms,
    availableRoomsNow,
    busyRoomsNow,
    todayBookingsCount,
    totalParticipantsToday,
    roomUtilization,
    popularRooms,
    peakHours,
  };
}

export async function getFilteredReportBookings(filters: {
  startDate?: string;
  endDate?: string;
  roomId?: string;
  department?: string;
}) {
  const where: any = {};

  if (filters.startDate || filters.endDate) {
    where.AND = [];
    if (filters.startDate) {
      where.AND.push({ startTime: { gte: new Date(filters.startDate) } });
    }
    if (filters.endDate) {
      where.AND.push({ endTime: { lte: endOfDay(new Date(filters.endDate)) } });
    }
  }

  if (filters.roomId && filters.roomId !== "all") {
    where.roomId = filters.roomId;
  }

  if (filters.department && filters.department !== "all") {
    where.user = {
      department: {
        contains: filters.department,
        mode: "insensitive",
      },
    };
  }

  return await prisma.booking.findMany({
    where,
    include: {
      room: true,
      user: true,
    },
    orderBy: {
      startTime: "desc",
    },
  });
}
