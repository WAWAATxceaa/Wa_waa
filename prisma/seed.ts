import { PrismaClient, Role, RoomStatus, BookingStatus, NotificationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clear existing data
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();

  // 2. Hash passwords
  const adminPassword = await bcrypt.hash('admin1234', 10);
  const employeePassword = await bcrypt.hash('emp1234', 10);

  // 3. Create Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@company.com',
      passwordHash: adminPassword,
      name: 'สมเกียรติ ยิ่งเจริญ (Admin)',
      department: 'ฝ่ายบริหาร / IT',
      role: Role.ADMIN,
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    },
  });

  const emp1 = await prisma.user.create({
    data: {
      email: 'somchai@company.com',
      passwordHash: employeePassword,
      name: 'สมชาย พัฒนาการ',
      department: 'แผนกวิศวกรรมซอฟต์แวร์ (IT)',
      role: Role.EMPLOYEE,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    },
  });

  const emp2 = await prisma.user.create({
    data: {
      email: 'suda@company.com',
      passwordHash: employeePassword,
      name: 'สุดา ดวงใจ',
      department: 'ฝ่ายทรัพยากรบุคคล (HR)',
      role: Role.EMPLOYEE,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
  });

  const emp3 = await prisma.user.create({
    data: {
      email: 'ananda@company.com',
      passwordHash: employeePassword,
      name: 'อนันดา ศิริโชค',
      department: 'ฝ่ายการตลาด (Marketing)',
      role: Role.EMPLOYEE,
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    },
  });

  console.log('✅ Users created.');

  // 4. Create Rooms
  const room1 = await prisma.room.create({
    data: {
      name: 'ห้องประชุมสัตตบรรณ (Boardroom)',
      capacity: 20,
      floor: 10,
      description: 'ห้องประชุมผู้บริหารขนาดใหญ่ พร้อมอุปกรณ์ประชุมทางไกลระดับพรีเมียมและระบบเสียงรอบทิศทาง',
      amenities: ['โปรเจกเตอร์ 4K', 'ระบบ Video Conference', 'ไวท์บอร์ดอัจฉริยะ', 'ไมโครโฟนไร้สาย', 'Smart TV 75"'],
      status: RoomStatus.ACTIVE,
      color: '#2563eb', // Blue
      imageUrl: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800',
    },
  });

  const room2 = await prisma.room.create({
    data: {
      name: 'ห้องประชุมอินทนิล (Meeting 1)',
      capacity: 8,
      floor: 3,
      description: 'ห้องประชุมขนาดกลาง เหมาะสำหรับการระดมสมองและพูดคุยวางแผนงานภายในทีม',
      amenities: ['โปรเจกเตอร์', 'ไวท์บอร์ดกระจก', 'ปลั๊กไฟตั้งโต๊ะรอบทิศ'],
      status: RoomStatus.ACTIVE,
      color: '#10b981', // Green
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    },
  });

  const room3 = await prisma.room.create({
    data: {
      name: 'ห้องประชุมราชพฤกษ์ (Hall B)',
      capacity: 35,
      floor: 5,
      description: 'ห้องประชุมสัมมนาและอบรมขนาดใหญ่ มีจอภาพคู่และเวทีนำเสนอ',
      amenities: ['โปรเจกเตอร์คู่ (Dual)', 'ระบบ Video Conference', 'ลำโพงสเตอริโอ', 'ไวท์บอร์ดใหญ่'],
      status: RoomStatus.ACTIVE,
      color: '#8b5cf6', // Purple
      imageUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
    },
  });

  const room4 = await prisma.room.create({
    data: {
      name: 'ห้องประชุมจามจุรี (Huddle 2)',
      capacity: 4,
      floor: 2,
      description: 'ห้องประชุมด่วนขนาดกะทัดรัด เหมาะสำหรับ 1-on-1 หรือพูดคุยกลุ่มย่อย 2-4 ท่าน',
      amenities: ['Smart TV 55"', 'ไวท์บอร์ด', 'เว็บแคมความคมชัดสูง'],
      status: RoomStatus.ACTIVE,
      color: '#f59e0b', // Amber
      imageUrl: 'https://images.unsplash.com/photo-1505409859467-3a796fd5798e?w=800',
    },
  });

  const room5 = await prisma.room.create({
    data: {
      name: 'ห้องประชุมพวงคราม (Creative Lab)',
      capacity: 12,
      floor: 4,
      description: 'ห้องประชุมสไตล์โมเดิร์นสำหรับการออกแบบและงานสร้างสรรค์',
      amenities: ['Smart TV 65"', 'ระบบ Video Conference', 'ไวท์บอร์ดรอบทิศทาง', 'ชุดโซฟาพักผ่อน'],
      status: RoomStatus.MAINTENANCE, // ทดสอบสถานะปิดปรับปรุง
      color: '#ec4899', // Pink
      imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
    },
  });

  console.log('✅ Rooms created.');

  // 5. Create Sample Bookings (Today & Upcoming)
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Meeting 1: Today 09:00 - 10:30 (Room 1)
  const m1Start = new Date(today);
  m1Start.setHours(9, 0, 0, 0);
  const m1End = new Date(today);
  m1End.setHours(10, 30, 0, 0);

  // Meeting 2: Today 11:00 - 12:30 (Room 2)
  const m2Start = new Date(today);
  m2Start.setHours(11, 0, 0, 0);
  const m2End = new Date(today);
  m2End.setHours(12, 30, 0, 0);

  // Meeting 3: Today 13:30 - 15:30 (Room 1)
  const m3Start = new Date(today);
  m3Start.setHours(13, 30, 0, 0);
  const m3End = new Date(today);
  m3End.setHours(15, 30, 0, 0);

  // Meeting 4: Tomorrow 10:00 - 12:00 (Room 3)
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const m4Start = new Date(tomorrow);
  m4Start.setHours(10, 0, 0, 0);
  const m4End = new Date(tomorrow);
  m4End.setHours(12, 0, 0, 0);

  const booking1 = await prisma.booking.create({
    data: {
      roomId: room1.id,
      userId: emp1.id,
      title: 'ประชุมวางแผนสปรินต์ประจำเดือน (Sprint Planning)',
      description: 'ทบทวน Backlog และวางแผนงานสำหรับไตรมาสใหม่',
      startTime: m1Start,
      endTime: m1End,
      participantCount: 10,
      participantsNote: 'ทีม Dev ทั้งหมด และ Product Owner',
      status: BookingStatus.CONFIRMED,
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      roomId: room2.id,
      userId: emp2.id,
      title: 'สัมภาษณ์งานตำแหน่ง Senior Frontend Engineer',
      description: 'สัมภาษณ์รอบสุดท้ายแบบ On-site',
      startTime: m2Start,
      endTime: m2End,
      participantCount: 4,
      participantsNote: 'HR และ Tech Lead',
      status: BookingStatus.CONFIRMED,
    },
  });

  const booking3 = await prisma.booking.create({
    data: {
      roomId: room1.id,
      userId: admin.id,
      title: 'ประชุมคณะกรรมการบริหาร (Executive Committee Meeting)',
      description: 'รายงานผลประกอบการและทิศทางกลยุทธ์บริษัท',
      startTime: m3Start,
      endTime: m3End,
      participantCount: 15,
      participantsNote: 'C-Level & Directors',
      status: BookingStatus.CONFIRMED,
    },
  });

  const booking4 = await prisma.booking.create({
    data: {
      roomId: room3.id,
      userId: emp3.id,
      title: 'อบรมสัมมนาเทคนิคการตลาดดิจิทัล 2026',
      description: 'การฝึกอบรมบุคลากรฝ่ายการตลาดและการขาย',
      startTime: m4Start,
      endTime: m4End,
      participantCount: 25,
      participantsNote: 'ทีมการตลาดและทีมขาย',
      status: BookingStatus.CONFIRMED,
    },
  });

  console.log('✅ Bookings created.');

  // 6. Create Initial Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: emp1.id,
        title: 'การจองห้องประชุมสำเร็จ',
        message: 'คุณได้จอง "ห้องประชุมสัตตบรรณ (Boardroom)" เรียบร้อยแล้ว',
        type: NotificationType.BOOKING_CONFIRMED,
        isRead: false,
        linkUrl: '/calendar',
      },
      {
        userId: emp1.id,
        title: 'แจ้งเตือนก่อนเริ่มประชุม 15 นาที',
        message: 'การประชุม "Sprint Planning" จะเริ่มในอีก 15 นาที ณ ห้องสัตตบรรณ',
        type: NotificationType.REMINDER_15MIN,
        isRead: false,
        linkUrl: '/calendar',
      },
      {
        userId: admin.id,
        title: 'มีการจองห้องประชุมใหม่',
        message: 'สมชาย พัฒนาการ จองห้องสัตตบรรณ วันนี้เวลา 09:00 - 10:30',
        type: NotificationType.BOOKING_CONFIRMED,
        isRead: false,
        linkUrl: '/admin/bookings',
      },
    ],
  });

  console.log('✅ Notifications created.');
  console.log('🎉 Seeding completed successfully!');
  console.log('----------------------------------------------------');
  console.log('🔑 รหัสเข้าสู่ระบบทดสอบ:');
  console.log('  Admin    : admin@company.com    / รหัสผ่าน: admin1234');
  console.log('  Employee : somchai@company.com  / รหัสผ่าน: emp1234');
  console.log('  Employee : suda@company.com     / รหัสผ่าน: emp1234');
  console.log('  Employee : ananda@company.com   / รหัสผ่าน: emp1234');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
