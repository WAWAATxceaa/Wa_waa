import { BookingForm } from "@/components/booking/BookingForm";

export const metadata = {
  title: "จองห้องประชุมใหม่ | Smart Meeting Room",
};

export default function BookPage({
  searchParams,
}: {
  searchParams: { roomId?: string; date?: string; time?: string };
}) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">
          จองห้องประชุมใหม่
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          กรอกข้อมูลเพื่อจองห้องประชุมได้ทันที ไม่ต้องล็อกอินหรือสมัครสมาชิก
        </p>
      </div>

      <BookingForm
        initialRoomId={searchParams.roomId}
        initialDate={searchParams.date}
        initialStartTime={searchParams.time}
      />
    </div>
  );
}
