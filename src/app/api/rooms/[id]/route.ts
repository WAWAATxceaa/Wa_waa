import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRoomById, updateRoom, deleteRoom } from "@/server/services/roomService";
import { roomSchema } from "@/lib/validations/room";
import { Role } from "@prisma/client";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const room = await getRoomById(params.id);
    if (!room) {
      return NextResponse.json({ error: "ไม่พบห้องประชุมนี้" }, { status: 404 });
    }
    return NextResponse.json(room);
  } catch (error: any) {
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "สิทธิ์ไม่เพียงพอ ต้องเป็น Admin เท่านั้น" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = roomSchema.partial().parse(body);

    const updated = await updateRoom(params.id, validatedData);
    return NextResponse.json(updated);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "ไม่สามารถแก้ไขห้องประชุมได้" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "สิทธิ์ไม่เพียงพอ ต้องเป็น Admin เท่านั้น" }, { status: 403 });
    }

    await deleteRoom(params.id);
    return NextResponse.json({ message: "ลบห้องประชุมสำเร็จ" });
  } catch (error: any) {
    return NextResponse.json({ error: "ไม่สามารถลบห้องประชุมได้" }, { status: 500 });
  }
}
