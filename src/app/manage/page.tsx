"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, KeyRound, Phone, HelpCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ManageSearchPage() {
  const router = useRouter();
  const [bookingCode, setBookingCode] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanCode = bookingCode.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg("กรุณากรอกรหัสอ้างอิงการจอง (Booking Code)");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${cleanCode}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "ไม่พบข้อมูลการจองตามรหัสนี้");
      }

      // นำทางไปยังหน้ารายละเอียดการจอง พร้อมส่งเบอร์โทรสำหรับ Verify
      const query = phone ? `?phone=${encodeURIComponent(phone.trim())}` : "";
      router.push(`/manage/${cleanCode}${query}`);
    } catch (err: any) {
      setErrorMsg(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <Search className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black text-slate-800">
          ค้นหาและจัดการการจอง
        </h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          เนื่องจากระบบไม่มีการล็อกอิน ท่านสามารถตรวจสอบ แก้ไขเวลา
          หรือขอยกเลิกได้โดยใช้รหัสการจองและเบอร์โทรศัพท์
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        {errorMsg && (
          <div className="p-3 text-xs bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center">
              <KeyRound className="w-3.5 h-3.5 mr-1 text-slate-400" />
              รหัสอ้างอิงการจอง (Booking Code) *
            </label>
            <input
              type="text"
              placeholder="เช่น BK-2610-A101"
              value={bookingCode}
              onChange={(e) => setBookingCode(e.target.value)}
              className="w-full px-4 py-2.5 text-sm uppercase font-mono tracking-wider border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center">
              <Phone className="w-3.5 h-3.5 mr-1 text-slate-400" />
              เบอร์โทรศัพท์ที่ใช้ตอนจอง (สำหรับยืนยันสิทธิ์แก้ไข/ยกเลิก)
            </label>
            <input
              type="tel"
              placeholder="เช่น 081-234-5678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 transition-colors disabled:opacity-50 flex items-center justify-center space-x-1.5"
          >
            {loading ? (
              <span>กำลังค้นหา...</span>
            ) : (
              <>
                <span>ค้นหาข้อมูลการจอง</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 flex items-start space-x-2 text-xs text-slate-400">
          <HelpCircle className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
          <p>
            รหัสการจองจะแสดงขึ้นทันทีเมื่อท่านจองห้องเสร็จสิ้น
            หรือเปิดผ่าน Direct Link เฉพาะที่ท่านบันทึกไว้
          </p>
        </div>
      </div>
    </div>
  );
}
