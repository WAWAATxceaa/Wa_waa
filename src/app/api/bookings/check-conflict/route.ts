import { NextRequest, NextResponse } from "next/server";
import { checkBookingConflict } from "@/lib/conflict-detector";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomId, startTime, endTime, excludeBookingId } = body;

    if (!roomId || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, message: "ข้อมูลไม่ครบถ้วนสำหรับการตรวจสอบ" },
        { status: 400 }
      );
    }

    const result = await checkBookingConflict({
      roomId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      excludeBookingId,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
