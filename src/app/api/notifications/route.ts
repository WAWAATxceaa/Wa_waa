import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  checkAndSend15MinReminders,
} from "@/server/services/notificationService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Trigger 15-min reminder checker asynchronously
    checkAndSend15MinReminders().catch((err) =>
      console.error("15-min reminder checker error:", err)
    );

    const notifications = await getUserNotifications(session.user.id);
    return NextResponse.json(notifications);
  } catch (error: any) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json({ error: "ไม่สามารถดึงข้อมูลการแจ้งเตือนได้" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { notificationId, markAll } = body;

    if (markAll) {
      await markAllNotificationsAsRead(session.user.id);
    } else if (notificationId) {
      await markNotificationAsRead(notificationId, session.user.id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "ไม่สามารถอัปเดตการแจ้งเตือนได้" }, { status: 500 });
  }
}
