"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Users,
  Building2,
  Phone,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  Tv,
  Video,
  Mic,
  Monitor,
  HelpCircle,
} from "lucide-react";
import { formatThaiDate, toBuddhistYear } from "@/lib/date-thai";
import { BookingSuccessModal } from "./BookingSuccessModal";

interface BookingFormProps {
  initialRoomId?: string;
  initialDate?: string;
  initialStartTime?: string;
}

export function BookingForm({
  initialRoomId,
  initialDate,
  initialStartTime,
}: BookingFormProps) {
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState(initialRoomId || "");
  const [date, setDate] = useState(
    initialDate || new Date().toISOString().split("T")[0]
  );
  const [startTime, setStartTime] = useState(initialStartTime || "09:00");
  const [endTime, setEndTime] = useState("11:00");
  const [participantCount, setParticipantCount] = useState(4);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([]);

  // Booker Details (Zero Auth)
  const [bookerName, setBookerName] = useState("");
  const [bookerDepartment, setBookerDepartment] = useState("");
  const [bookerEmail, setBookerEmail] = useState("");
  const [bookerPhone, setBookerPhone] = useState("");

  // States
  const [loading, setLoading] = useState(false);
  const [conflictChecking, setConflictChecking] = useState(false);
  const [conflictStatus, setConflictStatus] = useState<{
    hasConflict: boolean;
    message?: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successData, setSuccessData] = useState<any | null>(null);

  // Fetch rooms on mount
  useEffect(() => {
    fetch("/api/rooms?activeOnly=true")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data.length > 0) {
          setRooms(res.data);
          if (!selectedRoomId) {
            setSelectedRoomId(res.data[0].id);
          }
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Debounced Conflict Check whenever Room, Date, or Time changes
  useEffect(() => {
    if (!selectedRoomId || !date || !startTime || !endTime) return;

    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);

    if (startDateTime >= endDateTime) {
      setConflictStatus({
        hasConflict: true,
        message: "เวลาเริ่มต้นต้องน้อยกว่าเวลาสิ้นสุด",
      });
      return;
    }

    setConflictChecking(true);
    const timer = setTimeout(() => {
      fetch("/api/bookings/check-conflict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: selectedRoomId,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
        }),
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.hasConflict) {
            setConflictStatus({
              hasConflict: true,
              message: res.message || "ช่วงเวลานี้มีการจองห้องแล้ว",
            });
          } else {
            setConflictStatus({ hasConflict: false });
          }
        })
        .catch(() => {})
        .finally(() => setConflictChecking(false));
    }, 400);

    return () => clearTimeout(timer);
  }, [selectedRoomId, date, startTime, endTime]);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  const toggleEquipment = (eqId: string) => {
    setSelectedEquipmentIds((prev) =>
      prev.includes(eqId) ? prev.filter((id) => id !== eqId) : [...prev, eqId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (conflictStatus?.hasConflict) {
      setErrorMsg(conflictStatus.message || "กรุณาเลือกช่วงเวลาใหม่ที่ห้องยังว่าง");
      return;
    }

    setLoading(true);

    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: selectedRoomId,
          title,
          description,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          participantCount,
          equipmentIds: selectedEquipmentIds,
          bookerName,
          bookerDepartment,
          bookerEmail,
          bookerPhone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "เกิดข้อผิดพลาดในการจอง");
      }

      setSuccessData(data.data);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. เลือกห้องประชุม */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-800 flex items-center">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center mr-2">
                1
              </span>
              เลือกห้องประชุม
            </h3>
            {selectedRoom && (
              <span className="text-xs text-slate-500">
                ความจุสูงสุด {selectedRoom.capacity} ท่าน
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {rooms.map((room) => {
              const isSelected = room.id === selectedRoomId;

              return (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/40 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: room.color }}
                    />
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {room.code}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 line-clamp-1">
                    {room.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {room.location}
                  </p>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center">
                      <Users className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {room.capacity} คน
                    </span>
                    {isSelected && (
                      <span className="text-indigo-600 font-bold text-[11px]">
                        ✓ เลือกแล้ว
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. วันที่และเวลา (พร้อมระบบตรวจจับการชนแบบเรียลไทม์) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-800 flex items-center">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center mr-2">
                2
              </span>
              กำหนดวันและเวลา (รองรับ พ.ศ.)
            </h3>
            <span className="text-xs text-indigo-600 font-medium">
              พ.ศ. {toBuddhistYear(date)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                วันที่ประชุม
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                {formatThaiDate(date, "medium")}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                เวลาเริ่มต้น
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                เวลาสิ้นสุด
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Conflict Indicator Banner */}
          {conflictChecking ? (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-center">
              <span className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-2" />
              กำลังตรวจสอบความว่างของห้องประชุม...
            </div>
          ) : conflictStatus?.hasConflict ? (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{conflictStatus.message}</span>
            </div>
          ) : conflictStatus && !conflictStatus.hasConflict ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>ห้องว่างในช่วงเวลานี้ สามารถดำเนินการจองได้ทันที</span>
            </div>
          ) : null}
        </div>

        {/* 3. จำนวนคนและอุปกรณ์เสริม */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-800 flex items-center">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center mr-2">
              3
            </span>
            จำนวนผู้ร่วมประชุมและอุปกรณ์ที่ต้องการ
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                จำนวนผู้เข้าร่วม (คน) *
              </label>
              <input
                type="number"
                min="1"
                max={selectedRoom?.capacity || 100}
                value={participantCount}
                onChange={(e) => setParticipantCount(Number(e.target.value))}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
              {selectedRoom && participantCount > selectedRoom.capacity && (
                <span className="text-[11px] text-rose-500 mt-1 block">
                  จำนวนคนเกินความจุของห้อง ({selectedRoom.capacity} คน)
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                อุปกรณ์ในห้องที่ต้องการใช้
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedRoom?.equipments && selectedRoom.equipments.length > 0 ? (
                  selectedRoom.equipments.map((item: any) => {
                    const isChecked = selectedEquipmentIds.includes(
                      item.equipment.id
                    );
                    return (
                      <button
                        key={item.equipment.id}
                        type="button"
                        onClick={() => toggleEquipment(item.equipment.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors flex items-center space-x-1.5 ${
                          isChecked
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span>{item.equipment.name}</span>
                        {isChecked && <span>✓</span>}
                      </button>
                    );
                  })
                ) : (
                  <span className="text-xs text-slate-400">
                    ห้องนี้ไม่มีอุปกรณ์พิเศษเพิ่มเติม
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 4. หัวข้อและข้อมูลผู้จอง (Zero Auth) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-800 flex items-center">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center mr-2">
              4
            </span>
            ข้อมูลการประชุมและผู้จอง (ไม่ต้องสมัครสมาชิก)
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              หัวข้อการประชุม *
            </label>
            <input
              type="text"
              placeholder="เช่น ประชุมวางแผนไตรมาสที่ 1, Brainstorming สินค้าใหม่"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              วาระหรือรายละเอียดเพิ่มเติม (ถ้ามี)
            </label>
            <textarea
              rows={2}
              placeholder="สรุปประเด็นการพูดคุย หรือสิ่งที่ต้องเตรียมล่วงหน้า"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ชื่อ-นามสกุล ผู้จอง *
              </label>
              <input
                type="text"
                placeholder="คุณสมชาย ใจดี"
                value={bookerName}
                onChange={(e) => setBookerName(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                แผนก / ฝ่าย *
              </label>
              <input
                type="text"
                placeholder="เช่น การตลาด, ไอที"
                value={bookerDepartment}
                onChange={(e) => setBookerDepartment(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                เบอร์โทรศัพท์ติดต่อ *
              </label>
              <input
                type="tel"
                placeholder="081-234-5678"
                value={bookerPhone}
                onChange={(e) => setBookerPhone(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                อีเมล (สำหรับรับแจ้งเตือน)
              </label>
              <input
                type="email"
                placeholder="name@company.com"
                value={bookerEmail}
                onChange={(e) => setBookerEmail(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="submit"
            disabled={loading || conflictStatus?.hasConflict}
            className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>กำลังส่งข้อมูลการจอง...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>ยืนยันการจองห้องประชุม</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Success Dialog */}
      <BookingSuccessModal
        isOpen={!!successData}
        onClose={() => setSuccessData(null)}
        bookingData={successData}
      />
    </>
  );
}
