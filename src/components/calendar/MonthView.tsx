"use client";

import { useMemo } from "react";
import { formatThaiTime, isTodayThai } from "@/lib/date-thai";

interface MonthViewProps {
  currentDate: Date;
  rooms: Array<{ id: string; name: string; color: string }>;
  bookings: any[];
  selectedRoomId: string;
  onDayClick: (dateStr: string) => void;
  onBookingClick: (booking: any) => void;
}

export function MonthView({
  currentDate,
  rooms,
  bookings,
  selectedRoomId,
  onDayClick,
  onBookingClick,
}: MonthViewProps) {
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startingDayOfWeek = firstDay.getDay(); // 0 is Sunday
    const totalDays = lastDay.getDate();

    const days = [];

    // วันของเดือนก่อนหน้า (Padding)
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      });
    }

    // วันของเดือนปัจจุบัน
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // วันของเดือนถัดไป (Padding to 35 or 42 cells)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentDate]);

  const daysOfWeek = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-4">
      {/* Day of Week Header */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center">
        {daysOfWeek.map((day, idx) => (
          <div
            key={day}
            className={`py-3 text-xs font-semibold ${
              idx === 0 ? "text-rose-600" : idx === 6 ? "text-indigo-600" : "text-slate-600"
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
        {monthDays.map(({ date, isCurrentMonth }) => {
          const dateStr = date.toISOString().split("T")[0];
          const isToday = isTodayThai(date);

          // หาการจองในวันนี้
          const dayBookings = bookings.filter((b) => {
            if (b.status !== "CONFIRMED") return false;
            if (selectedRoomId !== "all" && b.roomId !== selectedRoomId)
              return false;
            const bDate = new Date(b.startTime).toISOString().split("T")[0];
            return bDate === dateStr;
          });

          return (
            <div
              key={dateStr}
              onClick={() => onDayClick(dateStr)}
              className={`min-h-[110px] p-2 flex flex-col justify-between group hover:bg-slate-50 cursor-pointer transition-colors ${
                !isCurrentMonth ? "bg-slate-50/50 text-slate-400" : "bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                    isToday
                      ? "bg-indigo-600 text-white"
                      : isCurrentMonth
                      ? "text-slate-800"
                      : "text-slate-400"
                  }`}
                >
                  {date.getDate()}
                </span>
                {dayBookings.length > 0 && (
                  <span className="text-[10px] font-medium text-slate-400">
                    {dayBookings.length} รายการ
                  </span>
                )}
              </div>

              {/* Bookings Badges */}
              <div className="space-y-1 flex-1 overflow-y-auto max-h-[80px]">
                {dayBookings.slice(0, 3).map((b) => (
                  <div
                    key={b.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookingClick(b);
                    }}
                    className="px-1.5 py-0.5 rounded text-[10px] font-medium text-white truncate shadow-xs hover:opacity-90"
                    style={{ backgroundColor: b.room?.color || "#4F46E5" }}
                  >
                    {formatThaiTime(b.startTime)} {b.title}
                  </div>
                ))}
                {dayBookings.length > 3 && (
                  <span className="text-[10px] text-indigo-600 font-semibold block text-center">
                    +{dayBookings.length - 3} เพิ่มเติม
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
