"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Building2,
  Phone,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Save,
  Trash2,
  ArrowLeft,
  KeyRound,
} from "lucide-react";
import { formatThaiDate, formatThaiTime } from "@/lib/date-thai";
import Link from "next/link";

interface ManageBookingViewProps {
  booking: any;
  initialToken?: string;
}

export function ManageBookingView({
  booking: initialBooking,
  initialToken = "",
}: ManageBookingViewProps) {
  const router = useRouter();
  const [booking, setBooking] = useState(initialBooking);
  const [token, setToken] = useState(initialToken);
  const [phoneVerification, setPhoneVerification] = useState("");

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(booking.title);
  const [description, setDescription] = useState(booking.description || "");
  const [startTime, setStartTime] = useState(
    new Date(booking.startTime).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
  const [endTime, setEndTime] = useState(
    new Date(booking.endTime).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
  const [date, setDate] = useState(
    new Date(booking.startTime).toISOString().split("T")[0]
  );
  const [participantCount, setParticipantCount] = useState(
    booking.participantCount
  );

  // Cancel dialog
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Check if authorized
  const hasTokenAuth = !!token && token === booking.manageToken;
  const hasPhoneAuth =
    !!phoneVerification &&
    booking.bookerPhone.replace(/\D/g, "") ===
      phoneVerification.replace(/\D/g, "");
  const isAuthorized = hasTokenAuth || hasPhoneAuth;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);

    try {
      const res = await fetch(`/api/bookings/${booking.bookingCode}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token || undefined,
          phone: phoneVerification || undefined,
          title,
          description,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          participantCount,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "ไม่สามารถอัปเดตการจองได้");
      }

      setBooking(data.data);
      setIsEditing(false);
      setFeedback({ type: "success", message: "แก้ไขข้อมูลการจองสำเร็จแล้ว" });
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/bookings/${booking.bookingCode}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token || undefined,
          phone: phoneVerification || undefined,
          cancelReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "ไม่สามารถยกเลิกการจองได้");
      }

      setBooking(data.data);
      setShowCancelDialog(false);
      setFeedback({
        type: "success",
        message: "ยกเลิกการจองห้องประชุมเรียบร้อยแล้ว",
      });
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          กลับสู่หน้าปฏิทิน
        </Link>

        <span className="font-mono text-xs font-semibold text-slate-400">
          Booking Ref: {booking.bookingCode}
        </span>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center space-x-3 text-sm ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Security Verification Bar if not accessed with token */}
      {!isAuthorized && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 text-amber-900 space-y-3">
          <div className="flex items-center space-x-2">
            <KeyRound className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-sm">
              ยืนยันความเป็นเจ้าของเพื่อแก้ไขหรือยกเลิก
            </h3>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            เนื่องจากท่านไม่ได้เปิดผ่าน Direct Link เฉพาะ
            กรุณากรอกเบอร์โทรศัพท์ที่ใช้ตอนจอง เพื่อปลดล็อกสิทธิ์การจัดการ
          </p>
          <div className="flex items-center space-x-2 max-w-sm pt-1">
            <input
              type="tel"
              placeholder="กรอกเบอร์โทรศัพท์ เช่น 0812345678"
              value={phoneVerification}
              onChange={(e) => setPhoneVerification(e.target.value)}
              className="px-4 py-2 text-sm bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none w-full"
            />
            <button
              type="button"
              onClick={() => {
                if (!hasPhoneAuth) {
                  setFeedback({
                    type: "error",
                    message: "เบอร์โทรศัพท์ไม่ตรงกับข้อมูลผู้จอง",
                  });
                } else {
                  setFeedback(null);
                }
              }}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shrink-0"
            >
              ยืนยัน
            </button>
          </div>
        </div>
      )}

      {/* Main Booking Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header Bar */}
        <div
          className="p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          style={{ backgroundColor: booking.room?.color || "#4F46E5" }}
        >
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold opacity-90 block">
              {booking.room?.name} ({booking.room?.code})
            </span>
            <h1 className="text-xl font-bold mt-1">{booking.title}</h1>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              booking.status === "CONFIRMED"
                ? "bg-white text-emerald-700"
                : "bg-white text-rose-700"
            }`}
          >
            {booking.status === "CONFIRMED" ? "● ยืนยันแล้ว" : "✕ ยกเลิกแล้ว"}
          </span>
        </div>

        {/* Edit Form or Display View */}
        {isEditing ? (
          <form onSubmit={handleUpdate} className="p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">
              แก้ไขรายละเอียดการจอง
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                หัวข้อการประชุม
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  วันที่
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รายละเอียดเพิ่มเติม
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="pt-3 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                ยกเลิกการแก้ไข
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-colors flex items-center space-x-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{loading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-6">
            {/* Info grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600">
              <div className="flex items-start space-x-3">
                <Calendar className="w-4 h-4 text-slate-400 mt-1" />
                <div>
                  <span className="text-xs text-slate-400 block">วันที่จัดประชุม</span>
                  <span className="font-semibold text-slate-800">
                    {formatThaiDate(booking.startTime, "medium")}
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-4 h-4 text-slate-400 mt-1" />
                <div>
                  <span className="text-xs text-slate-400 block">ช่วงเวลา</span>
                  <span className="font-semibold text-slate-800">
                    {formatThaiTime(booking.startTime)} -{" "}
                    {formatThaiTime(booking.endTime)}
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <User className="w-4 h-4 text-slate-400 mt-1" />
                <div>
                  <span className="text-xs text-slate-400 block">ผู้จอง</span>
                  <span className="font-semibold text-slate-800">
                    {booking.bookerName}
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Building2 className="w-4 h-4 text-slate-400 mt-1" />
                <div>
                  <span className="text-xs text-slate-400 block">แผนก / ฝ่าย</span>
                  <span className="font-semibold text-slate-800">
                    {booking.bookerDepartment}
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="w-4 h-4 text-slate-400 mt-1" />
                <div>
                  <span className="text-xs text-slate-400 block">เบอร์โทรศัพท์</span>
                  <span className="font-semibold text-slate-800">
                    {booking.bookerPhone}
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-slate-400 mt-1" />
                <div>
                  <span className="text-xs text-slate-400 block">สถานที่</span>
                  <span className="font-semibold text-slate-800">
                    {booking.room?.location}
                  </span>
                </div>
              </div>
            </div>

            {booking.description && (
              <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-600">
                <span className="font-bold text-slate-700 block mb-1">
                  วาระการประชุม:
                </span>
                {booking.description}
              </div>
            )}

            {booking.status === "CANCELLED" && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800">
                <span className="font-bold block">เหตุผลที่ยกเลิก:</span>
                {booking.cancelReason || "ผู้จองขอยกเลิกผ่านระบบ"}
                <span className="block text-[11px] text-rose-500 mt-1">
                  ยกเลิกเมื่อ: {formatThaiDate(booking.cancelledAt, "medium")}
                </span>
              </div>
            )}

            {/* Action Buttons if Authorized and Confirmed */}
            {booking.status === "CONFIRMED" && (
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  disabled={!isAuthorized}
                  onClick={() => setShowCancelDialog(true)}
                  className="px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors disabled:opacity-40 flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ขอยกเลิกการจอง</span>
                </button>

                <button
                  type="button"
                  disabled={!isAuthorized}
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-200 transition-colors disabled:opacity-40"
                >
                  แก้ไขเวลา / หัวข้อการจอง
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-base text-slate-800">
                ยืนยันการยกเลิกการจองห้องประชุม?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                เมื่อยกเลิกแล้ว ห้องประชุมจะถูกปล่อยว่างเพื่อให้ผู้อื่นสามารถจองได้ทันที
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เหตุผลที่ขอยกเลิก (ระบุหรือไม่ก็ได้)
              </label>
              <textarea
                rows={2}
                placeholder="เช่น เลื่อนการประชุม, ผู้บริหารติดภารกิจ"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelDialog(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                ไม่ยกเลิก
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleCancelBooking}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition-colors"
              >
                {loading ? "กำลังดำเนินการ..." : "ยืนยันยกเลิกการจอง"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
