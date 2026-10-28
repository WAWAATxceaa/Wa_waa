import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/rooms/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const room = await prisma.room.findUnique({
      where: { id: params.id },
      include: {
        equipments: {
          include: { equipment: true },
        },
      },
    });

    if (!room) {
      return NextResponse.json(
        { success: false, message: "ไม่พบห้องประชุมที่ต้องการ" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: room });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/rooms/[id] - แก้ไขข้อมูลหรือเปิด/ปิดการใช้งานห้อง
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { name, capacity, location, color, description, isActive, equipmentIds } =
      body;

    // อัปเดตข้อมูลพื้นฐาน
    const updatedRoom = await prisma.room.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(capacity !== undefined && { capacity: Number(capacity) }),
        ...(location !== undefined && { location }),
        ...(color !== undefined && { color }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    // อัปเดตอุปกรณ์ถ้ามีการส่งมา
    if (equipmentIds && Array.isArray(equipmentIds)) {
      await prisma.roomEquipment.deleteMany({
        where: { roomId: params.id },
      });

      if (equipmentIds.length > 0) {
        await prisma.roomEquipment.createMany({
          data: equipmentIds.map((eqId: string) => ({
            roomId: params.id,
            equipmentId: eqId,
            quantity: 1,
          })),
        });
      }
    }

    const finalRoom = await prisma.room.findUnique({
      where: { id: params.id },
      include: {
        equipments: {
          include: { equipment: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: finalRoom });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/rooms/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.room.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true, message: "ลบห้องประชุมสำเร็จ" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
