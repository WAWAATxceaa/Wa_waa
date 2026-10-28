"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle2, AlertTriangle, X, Calendar } from "lucide-react";

export interface ToastNotification {
  id: string;
  type: "booking_created" | "booking_updated" | "booking_cancelled" | "meeting_reminder";
  title: string;
  message: string;
  timestamp: string;
}

export function NotificationToast() {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  useEffect(() => {
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource("/api/sse");

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "connected") return;

          let title = "การแจ้งเตือนระบบ";
          let message = "";
          const id = Math.random().toString(36).substring(2, 9);

          if (payload.type === "booking_created") {
            title = "✨ มีการจองห้องใหม่";
            message = `"${payload.data.booking.title}" ที่ห้อง ${payload.data.booking.roomName} โดย ${payload.data.booking.bookerName}`;
          } else if (payload.type === "booking_updated") {
            title = "✏️ มีการแก้ไขเวลาการจอง";
            message = `"${payload.data.booking.title}" ที่ห้อง ${payload.data.booking.roomName}`;
          } else if (payload.type === "booking_cancelled") {
            title = "❌ มีการยกเลิกการจอง";
            message = `"${payload.data.booking.title}" ที่ห้อง ${payload.data.booking.roomName} ถูกยกเลิกแล้ว`;
          } else if (payload.type === "meeting_reminder") {
            title = "⏰ แจ้งเตือน: การประชุมจะเริ่มในอีก 15 นาที";
            message = `"${payload.data.title}" ที่ห้อง ${payload.data.roomName} (ผู้จอง: ${payload.data.bookerName})`;
          }

          // Trigger Custom Window Event for real-time data refetch in Calendar & Dashboard
          window.dispatchEvent(
            new CustomEvent("booking-realtime-update", { detail: payload })
          );

          // Add to toast list
          const newToast: ToastNotification = {
            id,
            type: payload.type,
            title,
            message,
            timestamp: new Date().toLocaleTimeString("th-TH"),
          };

          setToasts((prev) => [newToast, ...prev].slice(0, 4));

          // Auto remove after 6 seconds
          setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
          }, 6000);
        } catch (e) {
          console.error("Failed to parse SSE data", e);
        }
      };

      eventSource.onerror = () => {
        // SSE will attempt to reconnect automatically
      };
    } catch (e) {
      console.error("EventSource initialization error", e);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isReminder = toast.type === "meeting_reminder";
        const isCancelled = toast.type === "booking_cancelled";

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-xl border backdrop-blur-sm transition-all duration-300 animate-in slide-in-from-bottom-5 ${
              isReminder
                ? "bg-amber-50/95 border-amber-200 text-amber-900"
                : isCancelled
                ? "bg-rose-50/95 border-rose-200 text-rose-900"
                : "bg-white/95 border-indigo-100 text-slate-800"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div
                  className={`p-2 rounded-lg mt-0.5 ${
                    isReminder
                      ? "bg-amber-500 text-white"
                      : isCancelled
                      ? "bg-rose-500 text-white"
                      : "bg-indigo-600 text-white"
                  }`}
                >
                  {isReminder ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : isCancelled ? (
                    <X className="w-4 h-4" />
                  ) : (
                    <Calendar className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-semibold">{toast.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {toast.message}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {toast.timestamp}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
