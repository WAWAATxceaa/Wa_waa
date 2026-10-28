"use client";

import Link from "next/link";
import { X, Calendar, Clock, User, Building2, Phone, Users, ExternalLink, ShieldCheck } from "lucide-react";
import { formatThaiDate, formatThaiTime } from "@/lib/date-thai";

interface BookingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any | null;
}

export function BookingDetailModal({
  isOpen,
  onClose,
  booking,
}: BookingDetailModalProps) {
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Header with Room Color Bar */}
        <div
          className="px-6 py-4 text-white flex items-center justify-between"
          style={{ backgroundColor: booking.room?.color || "#4F46E5" }}
        >
          <div>
            <span className="text-xs font-medium uppercase tracking-wider opacity-90 block">
              {booking.room?.name || "ห้องประชุม"}
            </span>
            <h3 className="font-bold text-lg mt-0.5 leading-snug">
              {booking.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-black/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Booking Code Tag */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div>
              <span className="text-[11px] text-slate-500 block">รหัสอ้างอิงการจอง</span>
              <span className="font-mono font-bold text-indigo-700 text-sm">
                {booking.bookingCode}
              </span>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                booking.status === "CONFIRMED"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {booking.status === "CONFIRMED" ? "ยืนยันแล้ว" : "ยกเลิกแล้ว"}
            </span>
          </div>

          {/* Details list */}
          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex items-start space-x-3">
              <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <span className="font-medium text-slate-800">
                  {formatThaiDate(booking.startTime, "medium")}
                </span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Clock className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <span className="font-medium text-slate-800">
                  {formatThaiTime(booking.startTime)} - {formatThaiTime(booking.endTime)}
                </span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <User className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <span>ผู้จอง: </span>
                <span className="font-medium text-slate-800">
                  {booking.bookerName}
                </span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Building2 className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <span>แผนก: </span>
                <span className="font-medium text-slate-800">
                  {booking.bookerDepartment}
                </span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Users className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <span>จำนวนผู้เข้าร่วม: </span>
                <span className="font-medium text-slate-800">
                  {booking.participantCount} คน
                </span>
              </div>
            </div>

            {booking.description && (
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
                <span className="font-semibold block text-slate-700 mb-0.5">
                  รายละเอียดเพิ่มเติม:
                </span>
                {booking.description}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              ปิดหน้าต่าง
            </button>

            <Link
              href={`/manage/${booking.bookingCode}`}
              className="inline-flex items-center text-xs font-semibold px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl transition-colors"
            >
              แก้ไขหรือยกเลิกการจอง
              <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
