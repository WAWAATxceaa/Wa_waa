import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllRooms, createRoom } from "@/server/services/roomService";
import { roomSchema } from "@/lib/validations/room";
import { Role } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const withAvailability = searchParams.get("availability") !== "false";

    const rooms = await getAllRooms(withAvailability);
    return NextResponse.json(rooms);
  } catch (error: any) {
    console.error("GET /api/rooms error:", error);
    return NextResponse.json({ error: "ไม่สามารถดึงข้อมูลห้องประชุมได้" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "สิทธิ์ไม่เพียงพอ ต้องเป็นผู้ดูแลระบบเท่านั้น" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = roomSchema.parse(body);

    const room = await createRoom(validatedData);
    return NextResponse.json(room, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0]?.message || "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
    }
    console.error("POST /api/rooms error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสร้างห้องประชุม" }, { status: 500 });
  }
}
