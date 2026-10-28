"use client";

import { useState } from "react";
import { X, Calendar, Clock, User, Building2, Phone, Sparkles } from "lucide-react";
import { formatThaiDate } from "@/lib/date-thai";

interface QuickBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultRoomId?: string;
  defaultDate?: string; // YYYY-MM-DD
  defaultStartTime?: string; // HH:mm
  rooms: Array<{ id: string; name: string; capacity: number; color: string }>;
}

export function QuickBookModal({
  isOpen,
  onClose,
  onSuccess,
  defaultRoomId,
  defaultDate,
  defaultStartTime = "09:00",
  rooms,
}: QuickBookModalProps) {
  const [roomId, setRoomId] = useState(defaultRoomId || (rooms[0]?.id ?? ""));
  const [date, setDate] = useState(
    defaultDate || new Date().toISOString().split("T")[0]
  );
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState("10:00");
  const [title, setTitle] = useState("");
  const [bookerName, setBookerName] = useState("");
  const [bookerDepartment, setBookerDepartment] = useState("");
  const [bookerPhone, setBookerPhone] = useState("");
  const [participantCount, setParticipantCount] = useState("2");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);

    if (startDateTime >= endDateTime) {
      setErrorMsg("เวลาเริ่มต้นต้องก่อนเวลาสิ้นสุด");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          title,
          bookerName,
          bookerDepartment,
          bookerPhone,
          participantCount: Number(participantCount),
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "ไม่สามารถจองห้องประชุมได้");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-200" />
            <h3 className="font-semibold text-lg">จองด่วนช่องเวลานี้</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 text-sm bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
              {errorMsg}
            </div>
          )}

          {/* เลือกห้อง */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ห้องประชุม
            </label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} (ความจุ {r.capacity} คน)
                </option>
              ))}
            </select>
          </div>

          {/* วันที่และเวลา */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                วันที่
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เวลาเริ่ม
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เวลาสิ้นสุด
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* หัวข้อการประชุม */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              หัวข้อการประชุม *
            </label>
            <input
              type="text"
              placeholder="เช่น ประชุมวางแผนประจำเดือน"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          {/* ข้อมูลผู้จอง (ไม่ต้องล็อกอิน) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อผู้จอง *
              </label>
              <input
                type="text"
                placeholder="ชื่อ-นามสกุล"
                value={bookerName}
                onChange={(e) => setBookerName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                แผนก / ฝ่าย *
              </label>
              <input
                type="text"
                placeholder="เช่น การตลาด, ไอที"
                value={bookerDepartment}
                onChange={(e) => setBookerDepartment(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เบอร์โทรศัพท์ *
              </label>
              <input
                type="tel"
                placeholder="08X-XXX-XXXX"
                value={bookerPhone}
                onChange={(e) => setBookerPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                จำนวนผู้เข้าร่วม (คน)
              </label>
              <input
                type="number"
                min="1"
                value={participantCount}
                onChange={(e) => setParticipantCount(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-200 transition-colors disabled:opacity-50"
            >
              {loading ? "กำลังบันทึก..." : "ยืนยันการจอง"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
