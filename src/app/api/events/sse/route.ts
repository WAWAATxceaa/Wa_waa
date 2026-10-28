import { sseEmitter, SSEMessage } from "@/lib/sse";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // 1. ส่ง event ทักทายเริ่มต้น
  writer.write(
    encoder.encode(`data: ${JSON.stringify({ type: "connected", timestamp: new Date().toISOString() })}\n\n`)
  );

  // 2. ฟังก์ชัน handler สำหรับรับข้อความจาก sseEmitter
  const listener = async (event: SSEMessage) => {
    // หากระบุ targetUserId ให้ส่งเฉพาะเมื่อตรงกับผู้ใช้ปัจจุบัน
    if (event.targetUserId && event.targetUserId !== currentUserId) {
      return;
    }

    try {
      await writer.write(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
    } catch {
      // Writer closed or aborted
      sseEmitter.off("broadcast", listener);
    }
  };

  sseEmitter.on("broadcast", listener);

  // 3. Keep-alive heartbeat ทุกๆ 25 วินาที เพื่อไม่ให้ Connection หลุด
  const heartbeatInterval = setInterval(() => {
    try {
      writer.write(encoder.encode(": keepalive\n\n"));
    } catch {
      clearInterval(heartbeatInterval);
      sseEmitter.off("broadcast", listener);
    }
  }, 25000);

  // 4. เมื่อ client ตัดการเชื่อมต่อ (ปิดแท็บหรือเปลี่ยนหน้า)
  request.signal.addEventListener("abort", () => {
    clearInterval(heartbeatInterval);
    sseEmitter.off("broadcast", listener);
    writer.close().catch(() => {});
  });

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
