"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
} from "recharts";

interface AnalyticsChartsProps {
  roomUtilization: {
    name: string;
    rate: number;
    color: string;
  }[];
  popularRooms: {
    name: string;
    bookingCount: number;
    hours: number;
  }[];
  peakHours: {
    hour: string;
    bookings: number;
  }[];
}

export function AnalyticsCharts({
  roomUtilization,
  popularRooms,
  peakHours,
}: AnalyticsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. อัตราการใช้ห้องประชุม (Utilization Rate %) */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-foreground">อัตราการใช้งานห้องประชุม (Room Utilization Rate)</h3>
          <p className="text-xs text-muted-foreground">
            เปรียบเทียบสัดส่วนชั่วโมงการจองต่อสัปดาห์ (%)
          </p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={roomUtilization}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false} />
              <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value: any) => [`${value}%`, "อัตราการใช้งาน"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "0.75rem",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="rate" radius={[0, 6, 6, 0]}>
                {roomUtilization.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || "#3b82f6"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. ห้องประชุมยอดนิยม (Most Popular Rooms) */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-foreground">ห้องประชุมยอดนิยม (Most Popular Rooms)</h3>
          <p className="text-xs text-muted-foreground">
            อันดับห้องที่มีจำนวนครั้งการจองสูงสุด
          </p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={popularRooms}
              margin={{ top: 10, right: 20, left: -10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value: any, name: string) => [
                  name === "bookingCount" ? `${value} ครั้ง` : `${value} ชม.`,
                  name === "bookingCount" ? "จำนวนการจอง" : "ชั่วโมงรวม",
                ]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "0.75rem",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="bookingCount" fill="#3b82f6" radius={[6, 6, 0, 0]} name="จำนวนการจอง" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. ช่วงเวลาที่มีการใช้งานหนาแน่น (Peak Booking Hours) */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-sm lg:col-span-2">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-foreground">ช่วงเวลาที่มีการใช้งานหนาแน่น (Peak Hours Distribution)</h3>
          <p className="text-xs text-muted-foreground">
            สถิติจำนวนการประชุมที่เริ่มต้นในแต่ละช่วงชั่วโมงตลอดทั้งวัน
          </p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={peakHours}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPeak" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value: any) => [`${value} ครั้ง`, "จำนวนประชุม"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "0.75rem",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="bookings"
                stroke="#8b5cf6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorPeak)"
                name="จำนวนการประชุม"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
