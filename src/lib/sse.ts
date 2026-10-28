import { EventEmitter } from 'events';

// In-memory EventEmitter for SSE broadcasting in Next.js
declare global {
  // eslint-disable-next-line no-var
  var sseEmitterInstance: EventEmitter | undefined;
}

export const sseEmitter = global.sseEmitterInstance ?? new EventEmitter();

// Increase max listeners for multiple connected clients
sseEmitter.setMaxListeners(100);

if (process.env.NODE_ENV !== 'production') {
  global.sseEmitterInstance = sseEmitter;
}

export interface SSEMessage {
  type: 'booking:created' | 'booking:updated' | 'booking:cancelled' | 'notification:new';
  payload: any;
  targetUserId?: string; // Optional: Send specifically to this user
}

export function broadcastEvent(event: SSEMessage) {
  sseEmitter.emit('broadcast', event);
}
