import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Copy, Check, Calendar, ArrowRight, ExternalLink } from 'lucide-react';
import { Booking } from '../../types';
import { formatThaiDate } from '../../utils/dateUtils';
import { useNavigate } from 'react-router-dom';

interface BookingSuccessModalProps {
  booking: Booking | null;
  onClose: () => void;
}

export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({ booking, onClose }) => {
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (booking) {
      // Fire confetti from two sides!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8B5CF6', '#EC4899', '#22D3EE', '#84CC16'],
        });
      } catch (e) {}
    }
  }, [booking]);

  if (!booking) return null;

  const manageUrl = `${window.location.origin}${window.location.pathname}#/manage/${booking.bookingCode}`;

  const copyCode = () => {
    navigator.clipboard.writeText(booking.bookingCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(manageUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-4xl p-6 sm:p-8 shadow-2xl border border-violet-100 dark:border-slate-800 text-center relative overflow-hidden"
        >
          {/* Background Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Success Icon */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-gradient-to-tr from-violet-600 via-pink-500 to-cyan-400 flex items-center justify-center text-white shadow-xl shadow-pink-500/20 mb-5">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold font-display bg-gradient-to-r from-violet-600 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
            จองห้องประชุมสำเร็จ! 🎉
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
            บันทึกการจองของคุณเรียบร้อยแล้ว โปรดเก็บรหัสนี้ไว้เพื่อแก้ไขหรือยกเลิกการจอง
          </p>

          {/* 6-Digit Booking Code Display */}
          <div className="mt-6 p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border-2 border-dashed border-violet-300 dark:border-violet-700/60 relative group">
            <div className="text-xs text-slate-400 dark:text-slate-400 font-medium">
              รหัสการจองของคุณ (Booking Code)
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-widest text-violet-600 dark:text-violet-400 font-mono mt-1">
              {booking.bookingCode}
            </div>
            <button
              onClick={copyCode}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 hover:bg-violet-200 transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedCode ? 'คัดลอกรหัสแล้ว!' : 'คัดลอกรหัส'}
            </button>
          </div>

          {/* Summary Box */}
          <div className="mt-5 text-left bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 text-xs sm:text-sm space-y-2 border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">ห้องประชุม:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{booking.roomName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">วันที่:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{formatThaiDate(booking.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">เวลา:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{booking.startTime} - {booking.endTime} น.</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">หัวข้อ:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{booking.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">ผู้จอง:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{booking.bookerName} ({booking.department})</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={copyLink}
              className="flex-1 py-3 px-4 rounded-2xl font-display text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 transition-all"
            >
              <ExternalLink className="w-4 h-4 text-pink-500" />
              {copiedLink ? 'คัดลอกลิงก์สำเร็จ ✨' : 'คัดลอกลิงก์จัดการการจอง'}
            </button>
            <button
              onClick={() => {
                onClose();
                navigate('/calendar');
              }}
              className="flex-1 py-3 px-4 rounded-2xl font-display text-xs sm:text-sm font-semibold bg-gradient-to-r from-violet-600 via-pink-500 to-cyan-400 text-white shadow-lg shadow-violet-500/20 hover:opacity-95 flex items-center justify-center gap-2 transition-all"
            >
              <Calendar className="w-4 h-4" />
              ดูในปฏิทิน
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
