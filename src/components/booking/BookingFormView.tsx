import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  Sparkles,
  Building2,
  Phone,
  User,
  Tv,
  Video,
  Projector,
  PenTool,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { useBookingContext } from '../../context/BookingContext';
import { DEPARTMENTS, AMENITIES_LIST } from '../../config/constants';
import { formatThaiDate, getTodayString } from '../../utils/dateUtils';
import { generateBookingCode } from '../../utils/codeGenerator';
import { checkBookingConflict, createBooking } from '../../services/firestoreService';
import { BookingSuccessModal } from './BookingSuccessModal';
import { Booking } from '../../types';

export const BookingFormView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { rooms, bookings, addToast } = useBookingContext();

  const preselectedRoomId = searchParams.get('roomId') || (rooms[0]?.id ?? '');
  const preselectedDate = searchParams.get('date') || getTodayString();
  const preselectedStart = searchParams.get('startTime') || '09:00';
  const preselectedEnd = searchParams.get('endTime') || '10:00';

  // Form State
  const [roomId, setRoomId] = useState(preselectedRoomId);
  const [date, setDate] = useState(preselectedDate);
  const [startTime, setStartTime] = useState(preselectedStart);
  const [endTime, setEndTime] = useState(preselectedEnd);
  const [participantCount, setParticipantCount] = useState(4);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [bookerName, setBookerName] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [bookerContact, setBookerContact] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  // Update roomId if rooms load after initial render
  useEffect(() => {
    if (!roomId && rooms.length > 0) {
      setRoomId(rooms[0].id);
    }
  }, [rooms, roomId]);

  const selectedRoom = useMemo(() => {
    return rooms.find((r) => r.id === roomId) || rooms[0];
  }, [rooms, roomId]);

  // Real-time conflict validation
  const conflictResult = useMemo(() => {
    if (!roomId || !date || !startTime || !endTime) {
      return { hasConflict: false };
    }
    if (startTime >= endTime) {
      return {
        hasConflict: true,
        message: 'เวลาเริ่มต้องมาก่อนเวลาสิ้นสุดอย่างน้อย 15 นาที',
      };
    }
    return checkBookingConflict(bookings, roomId, date, startTime, endTime);
  }, [bookings, roomId, date, startTime, endTime]);

  const handleAmenityToggle = (amenityId: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId) ? prev.filter((a) => a !== amenityId) : [...prev, amenityId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRoom) {
      addToast('error', 'ข้อมูลไม่ครบถ้วน', 'กรุณาเลือกห้องประชุม');
      return;
    }

    if (!bookerName.trim()) {
      addToast('error', 'กรุณาระบุชื่อผู้จอง', 'ชื่อผู้จองจำเป็นสำหรับการยืนยัน');
      return;
    }

    if (!bookerContact.trim()) {
      addToast('error', 'กรุณาระบุข้อมูลติดต่อ', 'เบอร์โทรหรืออีเมลเพื่อรับรหัสการจอง');
      return;
    }

    if (!title.trim()) {
      addToast('error', 'กรุณาระบุหัวข้อการประชุม', 'หัวข้อจำเป็นสำหรับการแสดงผลในปฏิทิน');
      return;
    }

    if (conflictResult.hasConflict) {
      addToast('error', 'ช่วงเวลาซ้อนกัน', conflictResult.message || 'โปรดเลือกช่วงเวลาหรือห้องอื่น');
      return;
    }

    setSubmitting(true);
    const bookingCode = generateBookingCode();
    const startDateTime = new Date(`${date}T${startTime}:00`).toISOString();
    const endDateTime = new Date(`${date}T${endTime}:00`).toISOString();

    const result = await createBooking({
      bookingCode,
      roomId: selectedRoom.id,
      roomName: selectedRoom.name,
      roomColor: selectedRoom.color,
      date,
      startTime,
      endTime,
      startDateTime,
      endDateTime,
      participantCount: Number(participantCount),
      amenities: selectedAmenities,
      bookerName: bookerName.trim(),
      department,
      bookerContact: bookerContact.trim(),
      title: title.trim(),
      description: description.trim(),
    });

    setSubmitting(false);

    if (result.success && result.booking) {
      setCreatedBooking(result.booking);
      addToast('success', 'จองห้องสำเร็จ! 🎉', `รหัสการจองของคุณคือ ${result.booking.bookingCode}`);
    } else {
      addToast('error', 'ไม่สามารถจองห้องได้', result.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Banner */}
      <div className="mb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          ไม่ต้องล็อกอิน • จองได้ทันทีใน 1 นาที
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold font-display bg-gradient-to-r from-violet-600 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
          เลือกห้องที่ใช่ แล้วจองได้เลย ✨
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          ระบบจะสร้างรหัสการจอง (Booking Code) 6 หลัก และส่งข้อมูลซิงค์ให้แบบเรียลไทม์
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Room Selection Card */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-5 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h2 className="text-base sm:text-lg font-bold font-display text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-violet-600" />
            1. เลือกห้องประชุม
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {rooms.map((r) => {
              const isSelected = r.id === roomId;
              const isAvailable = r.status === 'active';
              return (
                <div
                  key={r.id}
                  onClick={() => isAvailable && setRoomId(r.id)}
                  style={{ borderColor: isSelected ? r.color : undefined }}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-violet-50/60 dark:bg-violet-950/30 shadow-md scale-[1.01]'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850'
                  } ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: r.color }}
                    />
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      ชั้น {r.floor} • จุได้ {r.capacity} คน
                    </span>
                  </div>
                  <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-slate-100">
                    {r.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {r.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Date & Time + Conflict Checker */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-5 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h2 className="text-base sm:text-lg font-bold font-display text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-pink-500" />
            2. วันที่และช่วงเวลา
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Date input with Thai Buddhist Preview */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                วันที่ประชุม (พ.ศ.)
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  min={getTodayString()}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                  required
                />
              </div>
              <div className="text-[11px] text-violet-600 dark:text-violet-400 mt-1 font-medium">
                {formatThaiDate(date, { includeDay: true })}
              </div>
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                เวลาเริ่ม
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                required
              />
            </div>

            {/* End Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                เวลาสิ้นสุด
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                required
              />
            </div>
          </div>

          {/* Real-Time Conflict Indicator Badge */}
          <div className="mt-4">
            {conflictResult.hasConflict ? (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                <div>
                  <span className="font-bold">เวลาชนกัน: </span>
                  {conflictResult.message}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  ห้อง <strong>{selectedRoom?.name}</strong> ว่างในช่วงเวลานี้ สามารถจองได้เลย ✨
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Attendees & Amenities */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-5 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h2 className="text-base sm:text-lg font-bold font-display text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-cyan-500" />
            3. ผู้เข้าร่วมและอุปกรณ์
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                จำนวนผู้เข้าร่วม (คน)
              </label>
              <input
                type="number"
                min={1}
                max={selectedRoom ? selectedRoom.capacity : 50}
                value={participantCount}
                onChange={(e) => setParticipantCount(Math.max(1, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                required
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                ห้องนี้รองรับได้สูงสุด {selectedRoom?.capacity || 20} ท่าน
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                อุปกรณ์ที่ต้องการใช้
              </label>
              <div className="grid grid-cols-2 gap-2">
                {AMENITIES_LIST.map((amenity) => {
                  const isChecked = selectedAmenities.includes(amenity.id);
                  return (
                    <label
                      key={amenity.id}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        isChecked
                          ? 'border-violet-500 bg-violet-50/60 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 font-medium'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleAmenityToggle(amenity.id)}
                        className="rounded text-violet-600 focus:ring-0"
                      />
                      <span>{amenity.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Booker & Topic Information (Zero-Auth) */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-5 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h2 className="text-base sm:text-lg font-bold font-display text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-emerald-500" />
            4. ข้อมูลผู้จองและหัวข้อการประชุม
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {/* Booker Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                ชื่อผู้จอง <span className="text-pink-500">*</span>
              </label>
              <input
                type="text"
                value={bookerName}
                placeholder="เช่น กฤตยชญ์ หรือ ตูน Dev"
                onChange={(e) => setBookerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                required
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                แผนก / ฝ่าย
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Contact */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                อีเมลหรือเบอร์โทร <span className="text-pink-500">*</span>
              </label>
              <input
                type="text"
                value={bookerContact}
                placeholder="เช่น 081-234-5678 หรือ name@company.com"
                onChange={(e) => setBookerContact(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                required
              />
            </div>
          </div>

          {/* Meeting Topic */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              หัวข้อการประชุม <span className="text-pink-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              placeholder="เช่น Sprint Planning 2026 / วางแผนการตลาด Q4"
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              รายละเอียดเพิ่มเติม / หมายเหตุ (ถ้ามี)
            </label>
            <textarea
              rows={2}
              value={description}
              placeholder="เช่น ต้องการสายต่อ HDMI เพิ่ม หรือเตรียมขนมเบรค"
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-violet-500 outline-none resize-none"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting || conflictResult.hasConflict}
            className={`w-full py-4 px-6 rounded-3xl font-display text-base font-bold text-white shadow-xl flex items-center justify-center gap-2.5 transition-all ${
              conflictResult.hasConflict
                ? 'bg-slate-400 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-violet-600 via-pink-500 to-cyan-400 hover:opacity-95 hover:scale-[1.01] shadow-pink-500/25 active:scale-95'
            }`}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                กำลังบันทึกและตรวจสอบ Transaction...
              </span>
            ) : conflictResult.hasConflict ? (
              'ไม่สามารถจองได้ (เวลาซ้อนกัน)'
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                ยืนยันการจองห้องทันที 🎉
              </>
            )}
          </button>
        </div>
      </form>

      {/* Success Modal */}
      <BookingSuccessModal
        booking={createdBooking}
        onClose={() => setCreatedBooking(null)}
      />
    </div>
  );
};
