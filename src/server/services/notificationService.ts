import { prisma } from "@/lib/prisma";
import { NotificationType, BookingStatus } from "@prisma/client";
import { broadcastEvent } from "@/lib/sse";
import { addMinutes } from "date-fns";

export async function getUserNotifications(userId: string) {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function markNotificationAsRead(id: string, userId: string) {
  return await prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });
}

export async function markAllNotificationsAsRead(userId: string) {
  return await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

/**
 * ตรวจสอบการประชุมที่จะเริ่มในอีก 15 นาที และสร้างการแจ้งเตือน
 */
export async function checkAndSend15MinReminders() {
  const now = new Date();
  const fifteenMinutesLater = addMinutes(now, 16); // Buffer 16 mins
  const tenMinutesLater = addMinutes(now, 10);

  // ค้นหาการประชุมที่เริ่มต้นในช่วง 10 - 16 นาทีข้างหน้า
  const upcomingBookings = await prisma.booking.findMany({
    where: {
      status: BookingStatus.CONFIRMED,
      startTime: {
        gte: tenMinutesLater,
        lte: fifteenMinutesLater,
      },
    },
    include: {
      room: true,
      user: true,
    },
  });

  for (const booking of upcomingBookings) {
    // เช็คว่าเคยส่งแจ้งเตือนนี้ไปแล้วหรือไม่
    const existingReminder = await prisma.notification.findFirst({
      where: {
        userId: booking.userId,
        type: NotificationType.REMINDER_15MIN,
        message: {
          contains: booking.title,
        },
      },
    });

    if (!existingReminder) {
      const notification = await prisma.notification.create({
        data: {
          userId: booking.userId,
          title: "แจ้งเตือนการประชุมใกล้เริ่ม (15 นาที)",
          message: `การประชุม "${booking.title}" ณ ห้อง "${booking.room.name}" จะเริ่มในอีกประมาณ 15 นาที`,
          type: NotificationType.REMINDER_15MIN,
          linkUrl: "/calendar",
        },
      });

      broadcastEvent({
        type: "notification:new",
        payload: notification,
        targetUserId: booking.userId,
      });
    }
  }
}
