import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const roomCount = await prisma.room.count();
    if (roomCount > 0) {
      return NextResponse.json({
        success: true,
        message: `ฐานข้อมูลมีข้อมูลอยู่แล้ว (${roomCount} ห้อง)`,
      });
    }

    // ทำการ Seed ข้อมูลอัตโนมัติ
    await seedData();

    return NextResponse.json({
      success: true,
      message: "Seed ข้อมูลห้องประชุมและตัวอย่างสำเร็จเรียบร้อย",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    await seedData();
    return NextResponse.json({
      success: true,
      message: "Reset & Seed ข้อมูลห้องประชุมสำเร็จ",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

async function seedData() {
  await prisma.bookingEquipment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.roomEquipment.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.room.deleteMany();

  const eqProjector = await prisma.equipment.create({
    data: {
      name: "โปรเจกเตอร์ 4K",
      icon: "projector",
      description: "ความละเอียดสูง รองรับ HDMI และไร้สาย",
    },
  });

  const eqTv = await prisma.equipment.create({
    data: {
      name: "Smart TV 65 นิ้ว",
      icon: "tv",
      description: "จอสัมผัส รองรับการเขียนโน้ตและต่อคอมพิวเตอร์",
    },
  });

  const eqVideo = await prisma.equipment.create({
    data: {
      name: "ระบบ Video Conference (Logitech Rally)",
      icon: "video",
      description: "กล้อง AI ซูมตามคนพูด พร้อมลำโพงและไมค์รอบทิศทาง",
    },
  });

  const eqMic = await prisma.equipment.create({
    data: {
      name: "ไมโครโฟนไร้สาย (คู่)",
      icon: "mic",
      description: "ไมค์ลอยเสียงคมชัดสำหรับวิทยากร",
    },
  });

  const eqWhiteboard = await prisma.equipment.create({
    data: {
      name: "ไวท์บอร์ดกระจก & ปากกา",
      icon: "board",
      description: "ไวท์บอร์ดแม่เหล็กพร้อมปากกาครบชุด",
    },
  });

  const room1 = await prisma.room.create({
    data: {
      name: "ห้องประชุมสุพรรณิการ์ (Boardroom A)",
      code: "RM-101",
      capacity: 20,
      location: "ชั้น 3 อาคารอำนวยการ",
      color: "#4F46E5",
      description: "ห้องประชุมผู้บริหาร โต๊ะประชุมตัวยู พร้อมระบบสัมมนาครบวงจร",
      isActive: true,
      equipments: {
        create: [
          { equipmentId: eqVideo.id, quantity: 1 },
          { equipmentId: eqProjector.id, quantity: 1 },
          { equipmentId: eqMic.id, quantity: 2 },
          { equipmentId: eqWhiteboard.id, quantity: 1 },
        ],
      },
    },
  });

  const room2 = await prisma.room.create({
    data: {
      name: "ห้องประชุมกาสะลอง (Meeting Room B)",
      code: "RM-102",
      capacity: 10,
      location: "ชั้น 3 อาคารอำนวยการ",
      color: "#0EA5E9",
      description: "ห้องประชุมขนาดกลาง เหมาะสำหรับประชุมทีม ประสานงานโครงการ",
      isActive: true,
      equipments: {
        create: [
          { equipmentId: eqTv.id, quantity: 1 },
          { equipmentId: eqWhiteboard.id, quantity: 1 },
        ],
      },
    },
  });

  const room3 = await prisma.room.create({
    data: {
      name: "ห้องประชุมราชพฤกษ์ (Auditorium C)",
      code: "RM-201",
      capacity: 50,
      location: "ชั้น 4 อาคารนวัตกรรม",
      color: "#F59E0B",
      description: "ห้องประชุมใหญ่แบบเธียเตอร์ สำหรับจัดอบรม สัมมนา และแถลงข่าว",
      isActive: true,
      equipments: {
        create: [
          { equipmentId: eqProjector.id, quantity: 2 },
          { equipmentId: eqMic.id, quantity: 4 },
          { equipmentId: eqVideo.id, quantity: 1 },
        ],
      },
    },
  });

  const room4 = await prisma.room.create({
    data: {
      name: "ห้องอินทนิล (Brainstorming Room D)",
      code: "RM-103",
      capacity: 6,
      location: "ชั้น 2 อาคารนวัตกรรม",
      color: "#10B981",
      description: "ห้องประชุมขนาดกะทัดรัด สำหรับระดมสมองแบบกลุ่มย่อยและ Standup",
      isActive: true,
      equipments: {
        create: [
          { equipmentId: eqTv.id, quantity: 1 },
          { equipmentId: eqWhiteboard.id, quantity: 1 },
        ],
      },
    },
  });

  const room5 = await prisma.room.create({
    data: {
      name: "ห้องประชุมบัวหลวง (Executive Boardroom E)",
      code: "RM-202",
      capacity: 16,
      location: "ชั้น 4 อาคารอำนวยการ",
      color: "#EC4899",
      description: "ห้องประชุมระดับ VIP ตกแต่งหรูหรา พร้อมระบบจอสัมผัสและเสียงรอบทิศทาง",
      isActive: true,
      equipments: {
        create: [
          { equipmentId: eqVideo.id, quantity: 1 },
          { equipmentId: eqTv.id, quantity: 1 },
          { equipmentId: eqMic.id, quantity: 2 },
        ],
      },
    },
  });

  // สร้างตัวอย่างการจองวันนี้
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  await prisma.booking.create({
    data: {
      bookingCode: "BK-2610-A101",
      manageToken: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      roomId: room1.id,
      bookerName: "คุณสมชาย มุ่งมั่น",
      bookerDepartment: "ฝ่ายบริหารกลยุทธ์",
      bookerEmail: "somchai.m@example.com",
      bookerPhone: "081-234-5678",
      title: "ประชุมผู้บริหารทบทวนแผนกลยุทธ์ประจำไตรมาส",
      description: "สรุป KPI รายไตรมาส และการจัดสรรงบประมาณ",
      startTime: new Date(`${todayStr}T09:30:00+07:00`),
      endTime: new Date(`${todayStr}T11:30:00+07:00`),
      participantCount: 15,
      status: "CONFIRMED",
      equipments: {
        create: [{ equipmentId: eqVideo.id, quantity: 1 }],
      },
    },
  });

  await prisma.booking.create({
    data: {
      bookingCode: "BK-2610-B202",
      manageToken: "a89d71b3-43ef-4f11-92b7-8178d46a81bb",
      roomId: room2.id,
      bookerName: "คุณพิมพา สดใส",
      bookerDepartment: "ฝ่ายการตลาดและสื่อสารองค์กร",
      bookerEmail: "pimpa.s@example.com",
      bookerPhone: "089-876-5432",
      title: "Workshop วางแผนเปิดตัวแคมเปญใหม่",
      description: "ระดมสมองและสรุป Concept โฆษณาสำหรับ Social Media",
      startTime: new Date(`${todayStr}T13:00:00+07:00`),
      endTime: new Date(`${todayStr}T15:00:00+07:00`),
      participantCount: 8,
      status: "CONFIRMED",
      equipments: {
        create: [{ equipmentId: eqTv.id, quantity: 1 }],
      },
    },
  });

  await prisma.booking.create({
    data: {
      bookingCode: "BK-2610-C303",
      manageToken: "c18d991b-1234-4bc5-a111-998877665544",
      roomId: room4.id,
      bookerName: "คุณธนพล พัฒนากิจ",
      bookerDepartment: "ฝ่ายเทคโนโลยีสารสนเทศ",
      bookerEmail: "thanapol.p@example.com",
      bookerPhone: "085-555-4321",
      title: "Sprint Planning & Architecture Review",
      description: "วางแผนงาน Sprint รอบถัดไปของทีม Full-stack",
      startTime: new Date(`${todayStr}T10:00:00+07:00`),
      endTime: new Date(`${todayStr}T12:00:00+07:00`),
      participantCount: 5,
      status: "CONFIRMED",
    },
  });
}
