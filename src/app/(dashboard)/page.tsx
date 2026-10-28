"use client";

import React, { useState, useEffect, useCallback } from "react";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { RoomStatusGrid } from "@/components/dashboard/RoomStatusGrid";
import { AnalyticsCharts } from "@/components/dashboard/AnalyticsCharts";
import { TodaySchedule } from "@/components/dashboard/TodaySchedule";
import { DashboardStats, RoomItem, BookingItem } from "@/types";
import { formatThaiDate } from "@/lib/timezone";
import { RefreshCw } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [todayBookings, setTodayBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [statsRes, roomsRes, bookingsRes] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/rooms?availability=true"),
        fetch(`/api/bookings?status=CONFIRMED&startDate=${new Date().toISOString().slice(0, 10)}`),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (roomsRes.ok) setRooms(await roomsRes.json());
      if (bookingsRes.ok) setTodayBookings(await bookingsRes.json());
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Real-time SSE listener
    const eventSource = new EventSource("/api/events/sse");
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (
          data.type === "booking:created" ||
          data.type === "booking:cancelled" ||
          data.type === "booking:updated"
        ) {
          loadData();
        }
      } catch (err) {
        // ignore
      }
    };

    return () => {
      eventSource.close();
    };
  }, [loadData]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-blue-500/10">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
            ระบบจองห้องประชุมอัจฉริยะ (SmartRoom)
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            แดชบอร์ดภาพรวมการใช้งาน
          </h1>
          <p className="text-xs sm:text-sm text-white/90 mt-1">
            ประจำ{formatThaiDate(new Date(), "EEEEที่ d MMMM yyyy")} • เวลามาตรฐานประเทศไทย (UTC+7)
          </p>
        </div>

        <button
          onClick={() => {
            setLoading(true);
            loadData();
          }}
          disabled={loading}
          className="self-start sm:self-center px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/20"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>รีเฟรชข้อมูล</span>
        </button>
      </div>

      {/* KPI Cards */}
      {stats && (
        <MetricCards
          totalRooms={stats.totalRooms}
          availableRoomsNow={stats.availableRoomsNow}
          busyRoomsNow={stats.busyRoomsNow}
          todayBookingsCount={stats.todayBookingsCount}
          totalParticipantsToday={stats.totalParticipantsToday}
        />
      )}

      {/* Real-time Room Grid */}
      <RoomStatusGrid rooms={rooms} onRefresh={loadData} />

      {/* Today's Schedule */}
      <TodaySchedule bookings={todayBookings} />

      {/* Analytics Charts */}
      {stats && (
        <AnalyticsCharts
          roomUtilization={stats.roomUtilization}
          popularRooms={stats.popularRooms}
          peakHours={stats.peakHours}
        />
      )}
    </div>
  );
}
