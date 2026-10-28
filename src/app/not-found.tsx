import Link from "next/link";
import { AlertCircle, Calendar, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4 space-y-4">
      <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center shadow-inner">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-black text-slate-800">
        ไม่พบหน้าที่ท่านต้องการ หรือรหัสการจองไม่ถูกต้อง
      </h2>
      <p className="text-xs text-slate-500 max-w-sm">
        กรุณาตรวจสอบรหัสอ้างอิงการจอง (Booking Code) อีกครั้ง หรือกลับไปดูปฏิทินการจอง
      </p>
      <div className="pt-2">
        <Link
          href="/"
          className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          กลับสู่หน้าปฏิทิน
        </Link>
      </div>
    </div>
  );
}
