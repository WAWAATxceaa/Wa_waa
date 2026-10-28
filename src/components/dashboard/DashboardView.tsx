"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Clock,
  CalendarCheck,
  Percent,
  DoorOpen,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Sparkles,
  PieChart as PieIcon,
} from "lucide-react";
import { formatThaiTime } from "@/lib/date-thai";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";

export function DashboardView() {
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    const handleUpdate = () => {
      fetchStats();
    };

    window.addEventListener("booking-realtime-update", handleUpdate);
    const interval = setInterval(fetchStats, 60000);

    return () => {
      window.removeEventListener("booking-realtime-update", handleUpdate);
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] space-y-3">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-medium">
          กำลังโหลดข้อมูลแดชบอร์ด...
        </span>
      </div>
    );
  }

  if (!stats) return null;

  // Pie chart data
  const pieData = stats.popularRooms.map((r: any) => ({
    name: r.name.split("(")[0].trim(),
    value: r.bookingCount,
    color: r.color || "#4F46E5",
  }));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-800">
            ภาพรวมการใช้ห้องประชุม (Dashboard)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ติดตามสถานะห้องประชุมแบบเรียลไทม์ และสถิติวิเคราะห์การใช้งาน
          </p>
        </div>

        <button
          type="button"
          onClick={fetchStats}
          className="inline-flex items-center text-xs font-semibold px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-700 shadow-xs transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
          รีเฟรชข้อมูล
        </button>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: ห้องที่ใช้งานอยู่ตอนนี้ */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              ใช้งานอยู่ขณะนี้
            </span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-slate-800">
                {stats.inUseCount}
              </span>
              <span className="text-xs text-slate-400">
                / {stats.totalRooms} ห้อง
              </span>
            </div>
            <span className="text-[11px] text-emerald-600 font-medium mt-1 inline-block">
              ว่าง {stats.availableCount} ห้อง
            </span>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <DoorOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: การจองวันนี้ */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              การจองทั้งหมดวันนี้
            </span>
            <span className="text-2xl font-black text-slate-800">
              {stats.todayBookingsCount}
            </span>
            <span className="text-[11px] text-indigo-600 font-medium mt-1 block">
              รวม {stats.totalBookedHoursToday} ชั่วโมง
            </span>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: อัตราการใช้ห้อง */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              อัตราการใช้ห้องวันนี้
            </span>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black text-slate-800">
                {stats.utilizationRate}%
              </span>
            </div>
            <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.utilizationRate}%` }}
              />
            </div>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <Percent className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Quick Action */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-5 rounded-3xl text-white shadow-md shadow-indigo-200 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-indigo-200 block">
              ต้องการใช้ห้องประชุม?
            </span>
            <h3 className="font-bold text-base mt-1">จองห้องประชุมทันที</h3>
          </div>
          <Link
            href="/book"
            className="mt-3 inline-flex items-center text-xs font-bold px-3 py-2 bg-white text-indigo-700 rounded-xl hover:bg-indigo-50 transition-colors w-fit"
          >
            เปิดฟอร์มจอง
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>
      </div>

      {/* Live Status of all rooms */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base text-slate-800 flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2 animate-ping" />
            สถานะห้องประชุมเรียลไทม์ (Live Rooms Status)
          </h2>
          <span className="text-xs text-slate-400">
            อัปเดตอัตโนมัติผ่าน SSE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {stats.roomStatuses.map((room: any) => {
            const inUse = room.isCurrentlyInUse;

            return (
              <div
                key={room.id}
                className={`p-4 rounded-2xl border transition-all ${
                  inUse
                    ? "bg-amber-50/40 border-amber-200 shadow-sm"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: room.color }}
                    />
                    <span className="font-bold text-xs text-slate-800">
                      {room.code}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      inUse
                        ? "bg-rose-100 text-rose-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {inUse ? "กำลังใช้งาน" : "● ว่าง"}
                  </span>
                </div>

                <h3 className="font-bold text-xs text-slate-800 line-clamp-1">
                  {room.name}
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {room.location} • {room.capacity} ที่นั่ง
                </p>

                {/* Current Meeting or Next Meeting */}
                <div className="mt-3 pt-2 border-t border-slate-100 text-xs">
                  {inUse && room.currentMeeting ? (
                    <div className="space-y-0.5">
                      <span className="text-[9px] uppercase font-bold text-rose-600 block">
                        กำลังประชุม:
                      </span>
                      <p className="font-semibold text-slate-800 text-[11px] line-clamp-1">
                        {room.currentMeeting.title}
                      </p>
                      <span className="text-slate-500 text-[10px] block">
                        ถึง {formatThaiTime(room.currentMeeting.endTime)} (
                        {room.currentMeeting.bookerName})
                      </span>
                    </div>
                  ) : room.nextMeeting ? (
                    <div className="space-y-0.5 text-slate-600">
                      <span className="text-[9px] uppercase font-bold text-indigo-600 block">
                        คิวถัดไป:
                      </span>
                      <p className="font-medium text-slate-700 text-[11px] line-clamp-1">
                        {room.nextMeeting.title}
                      </p>
                      <span className="text-slate-400 text-[10px] block">
                        เริ่ม {formatThaiTime(room.nextMeeting.startTime)}
                      </span>
                    </div>
                  ) : (
                    <div className="text-slate-400 text-[11px] py-1">
                      ไม่มีคิวต่อไปวันนี้
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature 3: Recharts Charts (Peak Hours & Room Popularity) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recharts Bar Chart: Peak Hours (08:00 - 18:00) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-800 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-indigo-600" />
              ช่วงเวลาที่มีการใช้งานมากที่สุด (Peak Hours - Recharts)
            </h3>
            <span className="text-xs text-slate-400">รอบ 30 วัน</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.peakHoursData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                />
                <RechartsTooltip
                  formatter={(val: any) => [`${val} ครั้ง`, "จำนวนครั้งที่จอง"]}
                  labelFormatter={(label) => `ช่วงเวลา ${label}`}
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    color: "#fff",
                    borderRadius: "12px",
                    fontSize: "12px",
                    border: "none",
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#6366f1">
                  {stats.peakHoursData.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.count > 0 ? "#4f46e5" : "#e0e7ff"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recharts Pie Chart: Popular Rooms Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-800 flex items-center">
              <PieIcon className="w-4 h-4 mr-2 text-indigo-600" />
              สัดส่วนการใช้งานห้องประชุม (Room Popularity - Recharts)
            </h3>
            <span className="text-xs text-slate-400">ยอดรวมทั้งหมด</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {pieData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(val: any) => [`${val} ครั้ง`, "การจอง"]}
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    color: "#fff",
                    borderRadius: "12px",
                    fontSize: "12px",
                    border: "none",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
