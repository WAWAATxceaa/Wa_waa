import { EventEmitter } from "events";

type SSEEventType =
  | "booking_created"
  | "booking_updated"
  | "booking_cancelled"
  | "meeting_reminder";

export interface SSEMessage {
  type: SSEEventType;
  data: any;
  timestamp: string;
}

// Global Singleton EventEmitter for Server-Sent Events across API requests
const globalForSSE = globalThis as unknown as {
  sseEmitter: EventEmitter | undefined;
};

export const sseEmitter = globalForSSE.sseEmitter ?? new EventEmitter();
sseEmitter.setMaxListeners(100);

if (process.env.NODE_ENV !== "production") {
  globalForSSE.sseEmitter = sseEmitter;
}

/**
 * ส่ง Event กระจายให้ทุก Client ที่เชื่อมต่ออยู่แบบ Real-time
 */
export function broadcastSSE(type: SSEEventType, data: any) {
  const message: SSEMessage = {
    type,
    data,
    timestamp: new Date().toISOString(),
  };
  sseEmitter.emit("broadcast", message);
}
