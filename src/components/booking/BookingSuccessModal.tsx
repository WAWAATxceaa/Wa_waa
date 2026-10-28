"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Copy, Check, ArrowRight, Calendar, Clock, MapPin, Share2 } from "lucide-react";
import { formatThaiDate, formatThaiTime } from "@/lib/date-thai";

interface BookingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: {
    bookingCode: string;
    manageToken: string;
    manageUrl: string;
    title: string;
    room: any;
    startTime: string;
    endTime: string;
  } | null;
}

export function BookingSuccessModal({
  isOpen,
  onClose,
  bookingData,
}: BookingSuccessModalProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !bookingData) return null;

  const fullManageUrl = typeof window !== "undefined"
    ? `${window.location.origin}${bookingData.manageUrl}`
    : bookingData.manageUrl;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(bookingData.bookingCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullManageUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Success Header */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-center text-white relative">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-bold">จองห้องประชุมสำเร็จเรียบร้อย!</h2>
          <p className="text-emerald-100 text-xs mt-1">
            ระบบได้บันทึกการจองของคุณและแจ้งเตือนผู้เกี่ยวข้องแล้ว
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Booking Code Card */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 text-center">
            <span className="text-xs font-semibold text-indigo-700 block mb-1">
              รหัสอ้างอิงการจอง (Booking Code)
            </span>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-2xl font-black font-mono tracking-wider text-indigo-900">
                {bookingData.bookingCode}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="p-1.5 bg-white text-indigo-600 hover:text-indigo-800 rounded-lg shadow-xs border border-indigo-200 transition-colors"
                title="คัดลอกรหัส"
              >
                {copiedCode ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-indigo-600/80 mt-1">
              ใช้รหัสนี้ร่วมกับเบอร์โทรศัพท์ เพื่อค้นหาหรือจัดการการจองในภายหลัง
            </p>
          </div>

          {/* Meeting Summary */}
          <div className="space-y-2 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="font-semibold text-slate-800 text-sm pb-1 border-b border-slate-200">
              {bookingData.title}
            </div>

            <div className="flex items-center text-slate-600 pt-1">
              <MapPin className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <span>
                {bookingData.room.name} ({bookingData.room.location})
              </span>
            </div>

            <div className="flex items-center text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <span>{formatThaiDate(bookingData.startTime, "medium")}</span>
            </div>

            <div className="flex items-center text-slate-600">
              <Clock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <span>
                {formatThaiTime(bookingData.startTime)} -{" "}
                {formatThaiTime(bookingData.endTime)}
              </span>
            </div>
          </div>

          {/* Direct Manage Link (Since No Login) */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-amber-900 block">
                  🔗 ลิงก์เฉพาะสำหรับแก้ไขหรือยกเลิกการจอง
                </span>
                <p className="text-[11px] text-amber-800/80 mt-0.5">
                  เนื่องจากระบบไม่มีการล็อกอิน ท่านสามารถบันทึกลิงก์นี้ไว้สำหรับจัดการการจองได้ทันที
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={fullManageUrl}
                className="w-full text-xs font-mono bg-white border border-amber-200 rounded-xl px-3 py-2 text-slate-600 focus:outline-none select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-xl shadow-xs transition-colors shrink-0 flex items-center"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1" />
                    คัดลอกแล้ว
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    คัดลอกลิงก์
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between pt-2">
            <Link
              href="/"
              onClick={onClose}
              className="text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              กลับสู่หน้าปฏิทิน
            </Link>

            <Link
              href={bookingData.manageUrl}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-200 transition-colors"
            >
              ไปยังหน้าจัดการการจอง
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
