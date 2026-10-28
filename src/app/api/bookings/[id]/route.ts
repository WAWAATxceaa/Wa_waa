import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  cancelBooking,
  BookingForbiddenError,
  BookingValidationError,
} from "@/server/services/bookingService";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อน" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const reason = body?.reason;

    const cancelledBooking = await cancelBooking(
      params.id,
      session.user.id,
      session.user.role,
      reason
    );

    return NextResponse.json(cancelledBooking);
  } catch (error: any) {
    if (error instanceof BookingForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof BookingValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("PATCH /api/bookings/[id] error:", error);
    return NextResponse.json({ error: "ไม่สามารถยกเลิกการจองได้" }, { status: 500 });
  }
}
