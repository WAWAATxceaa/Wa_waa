"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, Users, Building, AlertCircle } from "lucide-react";
import { RoomItem } from "@/types";
import { format } from "date-fns";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialRoomId?: string;
  initialStartTime?: Date | null;
  initialEndTime?: Date | null;
}

export function BookingModal({
  isOpen,
  onClose,
  onSuccess,
  initialRoomId,
  initialStartTime,
  initialEndTime,
}: BookingModalProps) {
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [roomId, setRoomId] = useState(initialRoomId || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [participantCount, setParticipantCount] = useState(2);
  const [participantsNote, setParticipantsNote] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch available rooms
  useEffect(() => {
    async function fetchRooms() {
      try {
        const res = await fetch("/api/rooms");
        if (res.ok) {
          const data: RoomItem[] = await res.json();
          setRooms(data);
          if (!roomId && data.length > 0) {
            setRoomId(data[0].id);
          }
        }
      } catch (err) {
        console.error("Error fetching rooms:", err);
      }
    }
    if (isOpen) {
      fetchRooms();
    }
  }, [isOpen, roomId]);

  // Sync initial date/time props
  useEffect(() => {
    if (initialRoomId) setRoomId(initialRoomId);

    const now = new Date();
    // Default start: either initialStartTime or next rounded 30 min
    const start = initialStartTime || new Date(now.getTime() + 15 * 60000);
    const end =
      initialEndTime ||
      new Date(start.getTime() + 60 * 60000); // Default 1 hour duration

    // Format for HTML datetime-local input: "YYYY-MM-DDTHH:mm"
    setStartTime(format(start, "yyyy-MM-dd'T'HH:mm"));
    setEndTime(format(end, "yyyy-MM-dd'T'HH:mm"));
    setErrorMessage(null);
  }, [isOpen, initialStartTime, initialEndTime, initialRoomId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          title,
          description,
          startTime,
          endTime,
          participantCount,
          participantsNote,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "เกิดข้อผิดพลาดในการจองห้อง");
        setLoading(false);
        return;
      }

      // Reset & notify
      setTitle("");
      setDescription("");
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage("เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย");
    } finally {
      setLoading(false);
    }
  };

  const selectedRoom = rooms.find((r) => r.id === roomId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in-0">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl text-card-foreground max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">จองห้องประชุมใหม่</h2>
              <p className="text-xs text-muted-foreground">
                กรุณากรอกข้อมูลการจองห้องประชุมตามเงื่อนไข
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Room Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              เลือกห้องประชุม <span className="text-red-500">*</span>
            </label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id} disabled={r.status !== "ACTIVE"}>
                  {r.name} (ชั้น {r.floor}, ความจุ {r.capacity} คน) {r.status !== "ACTIVE" ? `[${r.status}]` : ""}
                </option>
              ))}
            </select>
            {selectedRoom && (
              <div className="mt-2 flex flex-wrap gap-1.5 items-center text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-md">
                  <Building className="w-3 h-3" /> ชั้น {selectedRoom.floor}
                </span>
                <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-md">
                  <Users className="w-3 h-3" /> จุได้ {selectedRoom.capacity} ท่าน
                </span>
                {selectedRoom.amenities.map((a, i) => (
                  <span key={i} className="bg-primary/5 text-primary px-2 py-0.5 rounded-md">
                    {a}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              หัวข้อการประชุม / จุดประสงค์ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น ประชุมวางแผนประจำสัปดาห์ ทีม Marketing"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Time range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                เวลาเริ่มต้น <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                เวลาสิ้นสุด <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3 text-primary" />
            <span>กฎ: จองล่วงหน้าได้ไม่เกิน 60 วัน และแต่ละครั้งจองได้ไม่เกิน 4 ชั่วโมง</span>
          </p>

          {/* Participant count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                จำนวนผู้เข้าร่วม (คน)
              </label>
              <input
                type="number"
                min="1"
                max={selectedRoom ? selectedRoom.capacity : 100}
                value={participantCount}
                onChange={(e) => setParticipantCount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                รายชื่อผู้เข้าร่วม / แผนก
              </label>
              <input
                type="text"
                placeholder="เช่น ทีม Frontend, PM"
                value={participantsNote}
                onChange={(e) => setParticipantsNote(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Agenda / Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              รายละเอียดเพิ่มเติม / วาระการประชุม
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ระบุรายละเอียดเพิ่มเติม หรือสิ่งที่ต้องการเตรียม..."
              className="w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  กำลังตรวจสอบ...
                </>
              ) : (
                "ยืนยันการจอง"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
