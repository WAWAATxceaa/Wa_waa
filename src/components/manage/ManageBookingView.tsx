import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Search,
  KeyRound,
  Calendar,
  Clock,
  User,
  Building2,
  Trash2,
  Save,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { useBookingContext } from '../../context/BookingContext';
import { formatThaiDate } from '../../utils/dateUtils';
import { updateBooking, cancelBooking } from '../../services/firestoreService';
import { Booking } from '../../types';

export const ManageBookingView: React.FC = () => {
  const { code: urlCode } = useParams<{ code?: string }>();
  const navigate = useNavigate();
  const { bookings, addToast } = useBookingContext();

  const [searchCode, setSearchCode] = useState(urlCode || '');
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editParticipantCount, setEditParticipantCount] = useState(1);
  const [saving, setSaving] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Sync booking when URL or list changes
  useEffect(() => {
    if (urlCode) {
      setSearchCode(urlCode);
      const found = bookings.find(
        (b) => b.bookingCode.toUpperCase() === urlCode.toUpperCase()
      );
      if (found) {
        populateForm(found);
      }
    }
  }, [urlCode, bookings]);

  const populateForm = (b: Booking) => {
    setActiveBooking(b);
    setEditTitle(b.title);
    setEditDescription(b.description || '');
    setEditStartTime(b.startTime);
    setEditEndTime(b.endTime);
    setEditParticipantCount(b.participantCount);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = searchCode.trim().toUpperCase();
    if (!cleanCode) {
      addToast('warning', 'กรุณากรอกรหัส', 'โปรดระบุ Booking Code 6 หลัก');
      return;
    }

    const found = bookings.find((b) => b.bookingCode.toUpperCase() === cleanCode);
    if (found) {
      populateForm(found);
    } else {
      setActiveBooking(null);
      addToast('error', 'ไม่พบการจอง', `ไม่พบข้อมูลสำหรับรหัส "${cleanCode}"`);
    }
  };

  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBooking) return;

    if (!editTitle.trim()) {
      addToast('error', 'ข้อมูลไม่ครบ', 'กรุณาระบุหัวข้อการประชุม');
      return;
    }

    setSaving(true);
    const result = await updateBooking(activeBooking.bookingCode, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      startTime: editStartTime,
      endTime: editEndTime,
      participantCount: Number(editParticipantCount),
    });
    setSaving(false);

    if (result.success && result.booking) {
      setActiveBooking(result.booking);
      addToast('success', 'บันทึกสำเร็จ ✨', 'ข้อมูลการจองได้รับการอัปเดตแล้ว');
    } else {
      addToast('error', 'อัปเดตไม่สำเร็จ', result.error || 'เกิดข้อผิดพลาด');
    }
  };

  const handleConfirmCancel = async () => {
    if (!activeBooking) return;
    setCancelling(true);
    const result = await cancelBooking(activeBooking.bookingCode, cancelReason);
    setCancelling(false);
    setCancelModalOpen(false);

    if (result.success) {
      addToast('success', 'ยกเลิกการจองแล้ว', `รหัส ${activeBooking.bookingCode} ถูกยกเลิกเรียบร้อย`);
      setActiveBooking((prev) => (prev ? { ...prev, status: 'cancelled' } : null));
    } else {
      addToast('error', 'ยกเลิกไม่สำเร็จ', result.error || 'เกิดข้อผิดพลาด');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display bg-gradient-to-r from-violet-600 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
          จัดการและยกเลิกการจอง 🔍
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          กรอกรหัส Booking Code 6 หลักเพื่อตรวจสอบ แก้ไข หรือยกเลิกการจอง
        </p>
      </div>

      {/* Search Input Bar */}
      <form
        onSubmit={handleSearch}
        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-3"
      >
        <div className="relative flex-1 w-full">
          <KeyRound className="w-5 h-5 text-violet-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchCode}
            placeholder="กรอกรหัสการจอง 6 หลัก เช่น B7X9Q2"
            maxLength={10}
            onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase tracking-wider text-sm focus:ring-2 focus:ring-violet-500 outline-none"
          />
        </div>
        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 text-white font-display font-bold text-sm shadow-md hover:opacity-95 flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" />
          ค้นหาการจอง
        </button>
      </form>

      {/* Booking Details & Edit Card */}
      {activeBooking && (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-4xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in duration-300">
          {/* Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black font-mono text-violet-600 dark:text-violet-400">
                  #{activeBooking.bookingCode}
                </span>
                {activeBooking.status === 'confirmed' ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    🟢 ยืนยันแล้ว
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                    🔴 ยกเลิกแล้ว
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                จองเมื่อ: {formatThaiDate(activeBooking.createdAt)}
              </div>
            </div>

            {activeBooking.status === 'confirmed' && (
              <button
                type="button"
                onClick={() => setCancelModalOpen(true)}
                className="px-4 py-2 rounded-2xl border border-rose-200 dark:border-rose-800/60 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold font-display flex items-center gap-2 transition-colors self-start sm:self-auto"
              >
                <Trash2 className="w-4 h-4" />
                ยกเลิกการจองนี้
              </button>
            )}
          </div>

          {/* Read-Only Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-3xl text-xs sm:text-sm">
            <div>
              <span className="text-slate-400 block text-xs">ห้องประชุม:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{activeBooking.roomName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-xs">วันที่ประชุม:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{formatThaiDate(activeBooking.date)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-xs">ผู้จอง:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{activeBooking.bookerName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-xs">แผนก & ติดต่อ:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{activeBooking.department} ({activeBooking.bookerContact})</span>
            </div>
          </div>

          {/* Editable Fields Form */}
          {activeBooking.status === 'confirmed' ? (
            <form onSubmit={handleSaveUpdate} className="space-y-4 pt-2">
              <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200">
                แก้ไขรายละเอียดการประชุม
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  หัวข้อการประชุม
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    เวลาเริ่ม
                  </label>
                  <input
                    type="time"
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    เวลาสิ้นสุด
                  </label>
                  <input
                    type="time"
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    จำนวนผู้เข้าร่วม (คน)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editParticipantCount}
                    onChange={(e) => setEditParticipantCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  รายละเอียด / หมายเหตุ
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-pink-500 to-cyan-400 text-white font-display font-bold text-sm shadow-md hover:opacity-95 flex items-center justify-center gap-2"
              >
                {saving ? (
                  'กำลังบันทึก...'
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    บันทึกการแก้ไข
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs">
              <strong>หมายเหตุ:</strong> การจองนี้ถูกยกเลิกแล้วเมื่อ {formatThaiDate(activeBooking.cancelledAt || activeBooking.updatedAt)}
              {activeBooking.cancelledReason && ` (เหตุผล: ${activeBooking.cancelledReason})`}
            </div>
          )}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-4xl p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
              ยืนยันการยกเลิกการจอง?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              การยกเลิกจะทำให้ห้องว่างสำหรับผู้อื่นทันที และไม่สามารถกู้คืนได้
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                เหตุผลในการยกเลิก (ทางเลือก)
              </label>
              <input
                type="text"
                placeholder="เช่น เลื่อนประชุม, ติดธุระด่วน"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="flex-1 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold"
              >
                ย้อนกลับ
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleConfirmCancel}
                className="flex-1 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5"
              >
                {cancelling ? 'กำลังยกเลิก...' : 'ยืนยันยกเลิก'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
