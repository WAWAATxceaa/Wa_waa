import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFilteredReportBookings } from "@/server/services/reportService";
import { Role } from "@prisma/client";

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

    const reportBookings = await getFilteredReportBookings({
      startDate,
      endDate,
      roomId,
      department,
    });

    return NextResponse.json(reportBookings);
  } catch (error: any) {
    console.error("GET /api/reports error:", error);
    return NextResponse.json({ error: "ไม่สามารถดึงข้อมูลรายงานได้" }, { status: 500 });
  }
}
