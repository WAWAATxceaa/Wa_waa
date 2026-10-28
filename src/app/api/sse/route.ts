import { NextRequest } from "next/server";
import { sseEmitter, SSEMessage } from "@/lib/sse-broker";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. ส่งข้อความยืนยันการเชื่อมต่อครั้งแรก
      const initialPayload = JSON.stringify({
        type: "connected",
        message: "Real-time connection established",
        timestamp: new Date().toISOString(),
      });
      controller.enqueue(encoder.encode(`data: ${initialPayload}\n\n`));

      // 2. รับ Event จาก Emitter แล้วส่งให้ Client
      const onBroadcast = (msg: SSEMessage) => {
        try {
          const payload = JSON.stringify(msg);
          controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        } catch (err) {
          console.error("SSE Broadcast Error:", err);
        }
      };

      sseEmitter.on("broadcast", onBroadcast);

      // 3. Heartbeat & ตรวจจับการเตือนล่วงหน้า 15 นาที
      const interval = setInterval(async () => {
        try {
          // Heartbeat ping
          controller.enqueue(encoder.encode(`: ping\n\n`));

          // ตรวจสอบการประชุมที่จะเริ่มในอีก 14 - 16 นาทีข้างหน้า
          const now = new Date();
          const targetMin = new Date(now.getTime() + 14 * 60 * 1000);
          const targetMax = new Date(now.getTime() + 16 * 60 * 1000);

          const upcomingBookings = await prisma.booking.findMany({
            where: {
              status: "CONFIRMED",
              startTime: {
                gte: targetMin,
                lte: targetMax,
              },
            },
            include: { room: true },
          });

          for (const b of upcomingBookings) {
            const reminderMsg: SSEMessage = {
              type: "meeting_reminder",
              data: {
                id: b.id,
                bookingCode: b.bookingCode,
                title: b.title,
                roomName: b.room.name,
                startTime: b.startTime,
                bookerName: b.bookerName,
                bookerDepartment: b.bookerDepartment,
              },
              timestamp: new Date().toISOString(),
            };
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(reminderMsg)}\n\n`)
            );
          }
        } catch (err) {
          // Stream might be closed
        }
      }, 30000); // ทุก 30 วินาที

      // 4. ล้างทรัพยากรเมื่อ Client ตัดการเชื่อมต่อ
      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        sseEmitter.off("broadcast", onBroadcast);
        try {
          controller.close();
        } catch (e) {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
