import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFilteredReportBookings } from "@/server/services/reportService";
import { Role } from "@prisma/client";
import { formatThaiDate, formatThaiTime } from "@/lib/timezone";
import { differenceInMinutes } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "สิทธิ์ไม่เพียงพอ ต้องเป็น Admin เท่านั้น" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const roomId = searchParams.get("roomId") || undefined;
    const department = searchParams.get("department") || undefined;

    const bookings = await getFilteredReportBookings({
      startDate,
      endDate,
      roomId,
      department,
    });

    // สร้าง Header CSV
    const headers = [
      "รหัสการจอง",
      "หัวข้อการประชุม",
      "ห้องประชุม",
      "ชั้น",
      "วันที่เริ่ม",
      "เวลาเริ่ม",
      "เวลาสิ้นสุด",
      "ระยะเวลา (นาที)",
      "ผู้จอง",
      "อีเมล",
      "แผนก",
      "จำนวนผู้เข้าร่วม",
      "สถานะ",
      "เหตุผลการยกเลิก",
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = bookings.map((b) => {
      const duration = differenceInMinutes(new Date(b.endTime), new Date(b.startTime));
      const statusText = b.status === "CONFIRMED" ? "ยืนยันแล้ว" : "ยกเลิกแล้ว";

      return [
        escapeCsv(b.id),
        escapeCsv(b.title),
        escapeCsv(b.room.name),
        escapeCsv(b.room.floor),
        escapeCsv(formatThaiDate(b.startTime, "yyyy-MM-dd")),
        escapeCsv(formatThaiTime(b.startTime)),
        escapeCsv(formatThaiTime(b.endTime)),
        escapeCsv(duration),
        escapeCsv(b.user.name),
        escapeCsv(b.user.email),
        escapeCsv(b.user.department || "-"),
        escapeCsv(b.participantCount),
        escapeCsv(statusText),
        escapeCsv(b.cancelledReason || "-"),
      ].join(",");
    });

    // \uFEFF คือ UTF-8 BOM ช่วยให้ Excel แสดงภาษาไทยได้ถูกต้อง 100%
    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="meeting-room-report-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error: any) {
    console.error("CSV Export error:", error);
    return NextResponse.json({ error: "ไม่สามารถส่งออกไฟล์ CSV ได้" }, { status: 500 });
  }
}
