import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  createBooking,
  getBookings,
  BookingConflictError,
  BookingValidationError,
} from "@/server/services/bookingService";
import { bookingSchema } from "@/lib/validations/booking";
import { BookingStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("roomId") || undefined;
    const userId = searchParams.get("userId") || undefined;
    const statusParam = searchParams.get("status");
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    const status = statusParam === "CONFIRMED" || statusParam === "CANCELLED"
      ? (statusParam as BookingStatus)
      : undefined;

    const startDate = startDateParam ? new Date(startDateParam) : undefined;
    const endDate = endDateParam ? new Date(endDateParam) : undefined;

    const bookings = await getBookings({
      roomId,
      userId,
      status,
      startDate,
      endDate,
    });

    return NextResponse.json(bookings);
  } catch (error: any) {
    console.error("GET /api/bookings error:", error);
    return NextResponse.json({ error: "ไม่สามารถดึงข้อมูลรายการจองได้" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนทำการจองห้องประชุม" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = bookingSchema.parse(body);

    const booking = await createBooking(session.user.id, validatedData);
    return NextResponse.json(booking, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0]?.message || "ข้อมูลการจองไม่ถูกต้อง" }, { status: 400 });
    }
    if (error instanceof BookingConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if (error instanceof BookingValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("POST /api/bookings error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการจองห้องประชุม" }, { status: 500 });
  }
}
