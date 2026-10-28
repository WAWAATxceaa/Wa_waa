"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { BookingItem, RoomItem } from "@/types";
import { BookingModal } from "@/components/calendar/BookingModal";
import { BookingDetailModal } from "@/components/calendar/BookingDetailModal";
import { Plus, Filter, RefreshCw } from "lucide-react";

export function BookingCalendar() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createStartTime, setCreateStartTime] = useState<Date | null>(null);
  const [createEndTime, setCreateEndTime] = useState<Date | null>(null);
  const [createRoomId, setCreateRoomId] = useState<string | undefined>(undefined);

  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const calendarRef = useRef<FullCalendar>(null);

  // 1. Fetch Bookings and Rooms
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const url =
        selectedRoomFilter !== "all"
          ? `/api/bookings?roomId=${selectedRoomFilter}`
          : "/api/bookings";
      const res = await fetch(url);
      if (res.ok) {
        const data: BookingItem[] = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedRoomFilter]);

  const fetchRooms = async () => {
    try {
      const res = await fetch("/api/rooms?availability=false");
      if (res.ok) {
        const data: RoomItem[] = await res.json();
        setRooms(data);
      }
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // 2. Real-time SSE listener to update calendar automatically
  useEffect(() => {
    const eventSource = new EventSource("/api/events/sse");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (
          data.type === "booking:created" ||
          data.type === "booking:updated" ||
          data.type === "booking:cancelled"
        ) {
          fetchBookings();
        }
      } catch (err) {
        // Ignore ping/heartbeat
      }
    };

    return () => {
      eventSource.close();
    };
  }, [fetchBookings]);

  // 3. Handle Calendar slot click (drag or click empty time)
  const handleSelectSlot = (selectInfo: any) => {
    setCreateStartTime(selectInfo.start);
    setCreateEndTime(selectInfo.end);
    setCreateRoomId(selectedRoomFilter !== "all" ? selectedRoomFilter : undefined);
    setIsCreateModalOpen(true);
  };

  // 4. Handle Calendar Event Click
  const handleEventClick = (clickInfo: any) => {
    const bookingId = clickInfo.event.id;
    const found = bookings.find((b) => b.id === bookingId);
    if (found) {
      setSelectedBooking(found);
      setIsDetailModalOpen(true);
    }
  };

  // Transform bookings into FullCalendar events
  const calendarEvents = bookings
    .filter((b) => b.status === "CONFIRMED")
    .map((b) => ({
      id: b.id,
      title: `${b.room.name}: ${b.title}`,
      start: b.startTime,
      end: b.endTime,
      backgroundColor: b.room.color || "#3b82f6",
      borderColor: b.room.color || "#3b82f6",
      textColor: "#ffffff",
      extendedProps: {
        room: b.room,
        user: b.user,
        participantCount: b.participantCount,
      },
    }));

  return (
    <div className="space-y-4">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground">กรองตามห้อง:</span>
          </div>
          <select
            value={selectedRoomFilter}
            onChange={(e) => setSelectedRoomFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">ทุกห้องประชุม (ทั้งหมด)</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name} (ชั้น {room.floor})
              </option>
            ))}
          </select>

          <button
            onClick={() => fetchBookings()}
            disabled={loading}
            className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Room Legend Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {rooms.slice(0, 4).map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border border-border bg-background"
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: r.color }}
              />
              <span className="text-muted-foreground truncate max-w-[100px]">{r.name}</span>
            </div>
          ))}

          <button
            onClick={() => {
              setCreateStartTime(null);
              setCreateEndTime(null);
              setCreateRoomId(selectedRoomFilter !== "all" ? selectedRoomFilter : undefined);
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1.5 ml-auto sm:ml-2"
          >
            <Plus className="w-4 h-4" />
            <span>จองห้องประชุม</span>
          </button>
        </div>
      </div>

      {/* FullCalendar Container */}
      <div className="p-4 sm:p-6 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          buttonText={{
            today: "วันนี้",
            month: "เดือน",
            week: "สัปดาห์",
            day: "วัน",
          }}
          locale="th"
          firstDay={1} // Monday start
          slotMinTime="07:00:00"
          slotMaxTime="21:00:00"
          allDaySlot={false}
          selectable={true}
          selectMirror={true}
          nowIndicator={true}
          events={calendarEvents}
          select={handleSelectSlot}
          eventClick={handleEventClick}
          height="auto"
          slotDuration="00:30:00"
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }}
          slotLabelFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }}
        />
      </div>

      {/* Booking Form Modal */}
      <BookingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchBookings}
        initialRoomId={createRoomId}
        initialStartTime={createStartTime}
        initialEndTime={createEndTime}
      />

      {/* Booking Detail Modal */}
      <BookingDetailModal
        booking={selectedBooking}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onCancelled={fetchBookings}
      />
    </div>
  );
}
