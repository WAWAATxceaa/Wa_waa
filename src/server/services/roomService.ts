import { prisma } from "@/lib/prisma";
import { RoomInput } from "@/lib/validations/room";
import { RoomStatus, BookingStatus } from "@prisma/client";

export async function getAllRooms(includeStatusNow = true) {
  const rooms = await prisma.room.findMany({
    orderBy: [{ floor: "asc" }, { name: "asc" }],
  });

  if (!includeStatusNow) {
    return rooms;
  }

  const now = new Date();

  // Find all current active bookings
  const activeBookings = await prisma.booking.findMany({
    where: {
      status: BookingStatus.CONFIRMED,
      startTime: { lte: now },
      endTime: { gte: now },
    },
    include: {
      user: { select: { name: true } },
    },
  });

  const activeBookingByRoom = new Map<string, (typeof activeBookings)[0]>();
  activeBookings.forEach((b) => {
    activeBookingByRoom.set(b.roomId, b);
  });

  return rooms.map((room) => {
    const current = activeBookingByRoom.get(room.id);
    const isAvailable = room.status === RoomStatus.ACTIVE && !current;

    return {
      ...room,
      isAvailableNow: isAvailable,
      currentBooking: current
        ? {
            id: current.id,
            title: current.title,
            userName: current.user.name,
            startTime: current.startTime.toISOString(),
            endTime: current.endTime.toISOString(),
          }
        : null,
    };
  });
}

export async function getRoomById(id: string) {
  return await prisma.room.findUnique({
    where: { id },
  });
}

export async function createRoom(input: RoomInput) {
  return await prisma.room.create({
    data: {
      name: input.name.trim(),
      capacity: input.capacity,
      floor: input.floor,
      description: input.description,
      amenities: input.amenities,
      status: input.status as RoomStatus,
      imageUrl: input.imageUrl || null,
      color: input.color,
    },
  });
}

export async function updateRoom(id: string, input: Partial<RoomInput>) {
  return await prisma.room.update({
    where: { id },
    data: {
      ...(input.name ? { name: input.name.trim() } : {}),
      ...(input.capacity ? { capacity: input.capacity } : {}),
      ...(input.floor ? { floor: input.floor } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.amenities ? { amenities: input.amenities } : {}),
      ...(input.status ? { status: input.status as RoomStatus } : {}),
      ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
      ...(input.color ? { color: input.color } : {}),
    },
  });
}

export async function deleteRoom(id: string) {
  return await prisma.room.delete({
    where: { id },
  });
}
