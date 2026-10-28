"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck, Clock, Calendar, AlertCircle } from "lucide-react";
import { NotificationItem } from "@/types";
import { formatThaiDate } from "@/lib/timezone";
import Link from "next/link";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Fetch existing notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data: NotificationItem[] = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.isRead).length);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // 2. Real-time Server-Sent Events (SSE) Listener
    const eventSource = new EventSource("/api/events/sse");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "notification:new") {
          const newNotif: NotificationItem = data.payload;
          setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)]);
          setUnreadCount((prev) => prev + 1);
        }
      } catch (e) {
        // Heartbeat or malformed JSON
      }
    };

    eventSource.onerror = () => {
      // Reconnection handled automatically by browser EventSource
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  // Mark single as read
  const handleMarkSingleRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "REMINDER_15MIN":
        return <Clock className="w-4 h-4 text-amber-500" />;
      case "BOOKING_CANCELLED":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Calendar className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 rounded-lg border border-border bg-card hover:bg-accent flex items-center justify-center text-foreground transition-colors"
        title="การแจ้งเตือน"
        aria-label="การแจ้งเตือน"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border bg-card text-card-foreground shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between border-b border-border p-3.5 bg-muted/40">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">การแจ้งเตือน</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {unreadCount} ใหม่
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>อ่านทั้งหมด</span>
              </button>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto divide-y divide-border">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                <Bell className="mx-auto h-8 w-8 opacity-20 mb-2" />
                ยังไม่มีการแจ้งเตือนในขณะนี้
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => !item.isRead && handleMarkSingleRead(item.id)}
                  className={`p-3.5 hover:bg-muted/50 transition-colors flex gap-3 items-start cursor-pointer ${
                    !item.isRead ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="mt-0.5 rounded-full p-1.5 bg-muted">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs font-medium ${!item.isRead ? "font-bold text-foreground" : "text-muted-foreground"}`}>
                        {item.title}
                      </p>
                      {!item.isRead && (
                        <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {item.message}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-muted-foreground">
                        {formatThaiDate(item.createdAt, "d MMM HH:mm น.")}
                      </span>
                      {item.linkUrl && (
                        <Link
                          href={item.linkUrl}
                          onClick={() => setIsOpen(false)}
                          className="text-[10px] text-primary hover:underline"
                        >
                          ดูรายละเอียด →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
