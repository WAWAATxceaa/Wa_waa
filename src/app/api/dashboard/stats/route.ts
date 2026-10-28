import { NextResponse } from "next/server";
import { getDashboardStats } from "@/server/services/reportService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = await getDashboardStats();
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error("GET /api/dashboard/stats error:", error);
    return NextResponse.json({ error: "ไม่สามารถคำนวณข้อมูลแดชบอร์ดได้" }, { status: 500 });
  }
}
