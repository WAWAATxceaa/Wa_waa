import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/rooms - ดึงรายชื่อห้องทั้งหมด
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("activeOnly") === "true";

    const rooms = await prisma.room.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      include: {
        equipments: {
          include: {
            equipment: true,
          },
        },
        _count: {
          select: {
            bookings: {
              where: { status: "CONFIRMED" },
            },
          },
        },
      },
      orderBy: { code: "asc" },
    });

    return NextResponse.json({ success: true, data: rooms });
  } catch (error: any) {
    console.error("GET /api/rooms Error:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูลห้องประชุม" },
      { status: 500 }
    );
  }
}

// POST /api/rooms - สร้างห้องประชุมใหม่
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      code,
      capacity,
      location,
      color,
      description,
      equipmentIds,
    } = body;

    if (!name || !code || !capacity || !location) {
      return NextResponse.json(
        { success: false, message: "กรุณากรอกข้อมูลห้องให้ครบถ้วน" },
        { status: 400 }
      );
    }

    // ตรวจสอบรหัสห้องซ้ำ
    const existingCode = await prisma.room.findUnique({
      where: { code },
    });

    if (existingCode) {
      return NextResponse.json(
        { success: false, message: `รหัสห้อง ${code} นี้มีอยู่ในระบบแล้ว` },
        { status: 400 }
      );
    }

    const newRoom = await prisma.room.create({
      data: {
        name,
        code,
        capacity: Number(capacity),
        location,
        color: color || "#4F46E5",
        description: description || null,
        isActive: true,
        equipments:
          equipmentIds && Array.isArray(equipmentIds)
            ? {
                create: equipmentIds.map((eqId: string) => ({
                  equipmentId: eqId,
                  quantity: 1,
                })),
              }
            : undefined,
      },
      include: {
        equipments: {
          include: {
            equipment: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: newRoom }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/rooms Error:", error);
    return NextResponse.json(
      { success: false, message: "ไม่สามารถสร้างห้องประชุมได้: " + error.message },
      { status: 500 }
    );
  }
}
