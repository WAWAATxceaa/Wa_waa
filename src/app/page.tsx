"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Sparkles, RefreshCw, Layers } from "lucide-react";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { DayView } from "@/components/calendar/DayView";
import { WeekView } from "@/components/calendar/WeekView";
import { MonthView } from "@/components/calendar/MonthView";
import { QuickBookModal } from "@/components/calendar/QuickBookModal";
import { BookingDetailModal } from "@/components/calendar/BookingDetailModal";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"day" | "week" | "month">("day");
  const [selectedRoomId, setSelectedRoomId] = useState("all");
  const [rooms, setRooms] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [quickBookOpen, setQuickBookOpen] = useState(false);
  const [quickBookParams, setQuickBookParams] = useState<{
    roomId?: string;
    date?: string;
    time?: string;
  }>({});
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  // Fetch Rooms
  const fetchRooms = async () => {
    try {
      const res = await fetch("/api/rooms?activeOnly=true");
      const data = await res.json();
      if (data.success) {
        setRooms(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch Bookings
  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch("/api/bookings?status=CONFIRMED");
      const data = await res.json();
      if (data.success) {
        setBookings(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
    fetchBookings();

    // Auto seed check on first run if database is empty
    fetch("/api/seed").then(() => {
      fetchRooms();
      fetchBookings();
    });

    // Listen to Real-time SSE updates
    const handleRealtimeUpdate = () => {
      fetchBookings();
    };

    window.addEventListener("booking-realtime-update", handleRealtimeUpdate);
    return () => {
      window.removeEventListener("booking-realtime-update", handleRealtimeUpdate);
    };
  }, [fetchBookings]);

  // Date Navigation handlers
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (view === "day") newDate.setDate(newDate.getDate() - 1);
    else if (view === "week") newDate.setDate(newDate.getDate() - 7);
    else if (view === "month") newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === "day") newDate.setDate(newDate.getDate() + 1);
    else if (view === "week") newDate.setDate(newDate.getDate() + 7);
    else if (view === "month") newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Slot Click -> Open Quick Book Modal
  const handleSlotClick = (roomId: string, timeSlot: string, dateStr?: string) => {
    setQuickBookParams({
      roomId,
      date: dateStr || currentDate.toISOString().split("T")[0],
      time: timeSlot,
    });
    setQuickBookOpen(true);
  };

  // Day Click in Month View -> Switch to Day view on that date
  const handleMonthDayClick = (dateStr: string) => {
    setCurrentDate(new Date(dateStr));
    setView("day");
  };

  // Booking Card Click -> View Details
  const handleBookingClick = (booking: any) => {
    setSelectedBooking(booking);
    setDetailModalOpen(true);
  };

  // Filtered rooms
  const displayRooms =
    selectedRoomId === "all"
      ? rooms
      : rooms.filter((r) => r.id === selectedRoomId);

  return (
    <div className="space-y-4">
      {/* Calendar Header with Controls */}
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onViewChange={setView}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        rooms={rooms}
        selectedRoomId={selectedRoomId}
        onRoomSelect={setSelectedRoomId}
      />

      {/* Room Legend & Quick Tip */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 px-1">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-700">แถบสีห้อง:</span>
          {rooms.map((r) => (
            <div key={r.id} className="flex items-center space-x-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: r.color }}
              />
              <span className="text-slate-600">{r.name}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center space-x-2 text-indigo-600 font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>คลิกที่ช่องเวลาว่างบนปฏิทินเพื่อจองได้ทันที</span>
        </div>
      </div>

      {/* Main Calendar View Area */}
      {loading ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span className="text-xs text-slate-400">กำลังโหลดข้อมูลปฏิทิน...</span>
        </div>
      ) : rooms.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
          <Layers className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">
            ยังไม่มีห้องประชุมในระบบ
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            กดปุ่มด้านล่างเพื่อสร้างข้อมูลห้องประชุมจำลองเริ่มต้น (สุพรรณิการ์, กาสะลอง, ราชพฤกษ์, อินทนิล)
          </p>
          <button
            type="button"
            onClick={async () => {
              setLoading(true);
              await fetch("/api/seed", { method: "POST" });
              fetchRooms();
              fetchBookings();
            }}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
          >
            สร้างห้องประชุมจำลองเริ่มต้น (Seed Data)
          </button>
        </div>
      ) : view === "day" ? (
        <DayView
          currentDate={currentDate}
          rooms={displayRooms}
          bookings={bookings}
          onSlotClick={handleSlotClick}
          onBookingClick={handleBookingClick}
        />
      ) : view === "week" ? (
        <WeekView
          currentDate={currentDate}
          rooms={rooms}
          bookings={bookings}
          selectedRoomId={selectedRoomId}
          onSlotClick={handleSlotClick}
          onBookingClick={handleBookingClick}
        />
      ) : (
        <MonthView
          currentDate={currentDate}
          rooms={rooms}
          bookings={bookings}
          selectedRoomId={selectedRoomId}
          onDayClick={handleMonthDayClick}
          onBookingClick={handleBookingClick}
        />
      )}

      {/* Quick Booking Modal on Empty Slot Click */}
      <QuickBookModal
        isOpen={quickBookOpen}
        onClose={() => setQuickBookOpen(false)}
        onSuccess={fetchBookings}
        defaultRoomId={quickBookParams.roomId}
        defaultDate={quickBookParams.date}
        defaultStartTime={quickBookParams.time}
        rooms={rooms}
      />

      {/* Booking Detail Modal on Meeting Click */}
      <BookingDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        booking={selectedBooking}
      />
    </div>
  );
}
