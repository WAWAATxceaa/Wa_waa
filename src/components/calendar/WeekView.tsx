"use client";

import { useMemo } from "react";
import { Plus } from "lucide-react";
import {
  generateTimeSlots,
  formatThaiTime,
  getThaiDayName,
  formatThaiDate,
  isTodayThai,
} from "@/lib/date-thai";

interface WeekViewProps {
  currentDate: Date;
  rooms: Array<{ id: string; name: string; code: string; color: string; capacity: number }>;
  bookings: any[];
  selectedRoomId: string;
  onSlotClick: (roomId: string, timeSlot: string, dateStr: string) => void;
  onBookingClick: (booking: any) => void;
}

export function WeekView({
  currentDate,
  rooms,
  bookings,
  selectedRoomId,
  onSlotClick,
  onBookingClick,
}: WeekViewProps) {
  const timeSlots = useMemo(() => generateTimeSlots(8, 18, 60), []); // Hourly for week view

  // คำนวณวันจันทร์ถึงวันอาทิตย์ของสัปดาห์นี้
  const weekDays = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(d.setDate(diff));

    const days = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + i);
      days.push(nextDay);
    }
    return days;
  }, [currentDate]);

  const targetRoom =
    selectedRoomId !== "all"
      ? rooms.find((r) => r.id === selectedRoomId) || rooms[0]
      : rooms[0];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-4">
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header Days of Week */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
            <div className="p-3 text-xs font-semibold text-slate-500 border-r border-slate-200 flex items-center justify-center">
              เวลา
            </div>
            {weekDays.map((dayDate) => {
              const isToday = isTodayThai(dayDate);
              return (
                <div
                  key={dayDate.toISOString()}
                  className={`p-3 text-center border-r border-slate-200 last:border-r-0 ${
                    isToday ? "bg-indigo-50/70" : ""
                  }`}
                >
                  <span
                    className={`text-xs font-semibold block ${
                      isToday ? "text-indigo-600" : "text-slate-700"
                    }`}
                  >
                    {getThaiDayName(dayDate, false)}
                  </span>
                  <span
                    className={`text-xs mt-0.5 inline-block px-2 py-0.5 rounded-full ${
                      isToday
                        ? "bg-indigo-600 text-white font-bold"
                        : "text-slate-500 font-medium"
                    }`}
                  >
                    {dayDate.getDate()}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Time Rows */}
          <div className="divide-y divide-slate-100">
            {timeSlots.map((slot) => {
              const [slotH] = slot.split(":").map(Number);

              return (
                <div
                  key={slot}
                  className="grid grid-cols-[80px_repeat(7,1fr)] min-h-[64px]"
                >
                  <div className="p-2 text-center text-xs font-medium text-slate-400 border-r border-slate-200 bg-slate-50/50 flex items-center justify-center">
                    {slot}
                  </div>

                  {weekDays.map((dayDate) => {
                    const dateStr = dayDate.toISOString().split("T")[0];

                    // หาการจองในชั่วโมงนี้
                    const slotBookings = bookings.filter((b) => {
                      if (b.status !== "CONFIRMED") return false;
                      if (selectedRoomId !== "all" && b.roomId !== selectedRoomId)
                        return false;

                      const bStart = new Date(b.startTime);
                      const bDateStr = bStart.toISOString().split("T")[0];
                      if (bDateStr !== dateStr) return false;

                      const bStartH = bStart.getHours();
                      const bEndH = new Date(b.endTime).getHours();
                      return slotH >= bStartH && slotH < (bEndH || 24);
                    });

                    const hasBookings = slotBookings.length > 0;

                    return (
                      <div
                        key={dateStr}
                        className="p-1 border-r border-slate-100 last:border-r-0 relative group hover:bg-slate-50/80 transition-colors"
                      >
                        {hasBookings ? (
                          <div className="space-y-1">
                            {slotBookings.map((b) => (
                              <div
                                key={b.id}
                                onClick={() => onBookingClick(b)}
                                className="p-1.5 rounded-lg text-white shadow-xs cursor-pointer hover:scale-[1.02] transition-transform text-xs"
                                style={{
                                  backgroundColor: b.room?.color || "#4F46E5",
                                }}
                              >
                                <p className="font-semibold truncate leading-tight">
                                  {b.title}
                                </p>
                                <span className="text-[10px] text-white/90 truncate block">
                                  {formatThaiTime(b.startTime)} • {b.room?.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div
                            onClick={() =>
                              onSlotClick(
                                targetRoom?.id || rooms[0]?.id,
                                slot,
                                dateStr
                              )
                            }
                            className="w-full h-full min-h-[50px] rounded-lg border border-transparent group-hover:border-indigo-200 flex items-center justify-center text-indigo-500 opacity-0 group-hover:opacity-100 transition-all text-xs font-medium cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 mr-0.5" />
                            จอง
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
