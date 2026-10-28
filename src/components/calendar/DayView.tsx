"use client";

import { useMemo } from "react";
import { Plus, Clock, Users } from "lucide-react";
import { generateTimeSlots, formatThaiTime } from "@/lib/date-thai";

interface DayViewProps {
  currentDate: Date;
  rooms: Array<{ id: string; name: string; code: string; color: string; capacity: number }>;
  bookings: any[];
  onSlotClick: (roomId: string, timeSlot: string) => void;
  onBookingClick: (booking: any) => void;
}

export function DayView({
  currentDate,
  rooms,
  bookings,
  onSlotClick,
  onBookingClick,
}: DayViewProps) {
  const timeSlots = useMemo(() => generateTimeSlots(8, 18, 30), []);

  const dateStr = currentDate.toISOString().split("T")[0];

  // คัดกรองการจองเฉพาะของวันนี้
  const todayBookings = useMemo(() => {
    return bookings.filter((b) => {
      const bDate = new Date(b.startTime).toISOString().split("T")[0];
      return bDate === dateStr && b.status === "CONFIRMED";
    });
  }, [bookings, dateStr]);

  // ฟังก์ชันหาว่า slot เวลาและห้องนี้ มีการจองอยู่หรือไม่
  const getBookingForSlot = (roomId: string, slotTime: string) => {
    const [h, m] = slotTime.split(":").map(Number);
    const slotDate = new Date(currentDate);
    slotDate.setHours(h, m, 0, 0);

    return todayBookings.find((b) => {
      if (b.roomId !== roomId) return false;
      const start = new Date(b.startTime);
      const end = new Date(b.endTime);
      return slotDate >= start && slotDate < end;
    });
  };

  // ตรวจสอบว่าเป็น slot แรกของการจองนี้หรือไม่ (สำหรับแสดงหัวเรื่อง)
  const isStartOfBooking = (booking: any, slotTime: string) => {
    const start = new Date(booking.startTime);
    const startH = start.getHours().toString().padStart(2, "0");
    const startM = start.getMinutes().toString().padStart(2, "0");
    return `${startH}:${startM}` === slotTime;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-4">
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Table Header: Room Columns */}
          <div className="grid grid-cols-[80px_repeat(auto-fit,minmax(160px,1fr))] border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
            <div className="p-3 text-xs font-semibold text-slate-500 border-r border-slate-200 flex items-center justify-center">
              เวลา
            </div>
            {rooms.map((room) => (
              <div
                key={room.id}
                className="p-3 text-center border-r border-slate-200 last:border-r-0"
              >
                <div className="flex items-center justify-center space-x-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: room.color }}
                  />
                  <h4 className="font-semibold text-xs text-slate-800 truncate">
                    {room.name}
                  </h4>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {room.code} • {room.capacity} ที่นั่ง
                </span>
              </div>
            ))}
          </div>

          {/* Table Body: 30-min Time Rows */}
          <div className="divide-y divide-slate-100">
            {timeSlots.map((slot) => (
              <div
                key={slot}
                className="grid grid-cols-[80px_repeat(auto-fit,minmax(160px,1fr))] min-h-[44px]"
              >
                {/* Time Column */}
                <div className="p-2 text-center text-xs font-medium text-slate-400 border-r border-slate-200 bg-slate-50/50 flex items-center justify-center">
                  {slot}
                </div>

                {/* Room Slots */}
                {rooms.map((room) => {
                  const booking = getBookingForSlot(room.id, slot);
                  const isStart = booking && isStartOfBooking(booking, slot);

                  if (booking) {
                    return (
                      <div
                        key={room.id}
                        onClick={() => onBookingClick(booking)}
                        className="p-1 border-r border-slate-100 last:border-r-0 cursor-pointer transition-opacity hover:opacity-90"
                      >
                        <div
                          className="w-full h-full rounded-lg p-2 text-white shadow-sm flex flex-col justify-between overflow-hidden"
                          style={{
                            backgroundColor: room.color || "#4F46E5",
                            opacity: isStart ? 1 : 0.85,
                          }}
                        >
                          {isStart ? (
                            <div>
                              <p className="font-bold text-xs leading-snug truncate">
                                {booking.title}
                              </p>
                              <div className="flex items-center text-[10px] text-white/90 mt-0.5 space-x-2">
                                <span className="truncate">
                                  {booking.bookerName} ({booking.bookerDepartment})
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-[10px] text-white/70 italic block truncate">
                              ↳ {booking.title}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // Empty Slot: Click to book
                  return (
                    <div
                      key={room.id}
                      onClick={() => onSlotClick(room.id, slot)}
                      className="p-1 border-r border-slate-100 last:border-r-0 group hover:bg-indigo-50/50 cursor-pointer transition-colors relative"
                    >
                      <div className="w-full h-full min-h-[36px] rounded-lg border border-transparent group-hover:border-indigo-200 flex items-center justify-center text-indigo-500 opacity-0 group-hover:opacity-100 transition-all text-xs font-medium">
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        จองเวลานี้
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
