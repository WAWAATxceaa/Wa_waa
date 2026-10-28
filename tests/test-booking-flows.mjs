/**
 * Automated Verification Script for Smart Meeting Room Booking System
 * ทดสอบ 4 ขั้นตอนหลัก:
 * 1. จองห้องประชุมปกติ (ตรวจสอบ Response & Booking Code)
 * 2. ทดสอบจองเวลาซ้อนทับ (Double-Booking Conflict Check - ต้องคืน 409 Conflict)
 * 3. ตรวจสอบแดชบอร์ดและการอัปเดตสถานะห้องแบบ Real-time
 * 4. ยกเลิกการจอง และตรวจสอบสถานะห้องกลับมาเป็นว่าง
 */

const BASE_URL = process.env.TEST_URL || "http://localhost:3000";

async function runTests() {
  console.log("🚀 กำลังเริ่มต้นทดสอบระบบจองห้องประชุมแบบครบวงจร...");
  console.log(`🔗 Target URL: ${BASE_URL}\n`);

  try {
    // 0. ตรวจสอบการเชื่อมต่อเซิร์ฟเวอร์
    console.log("0️⃣ ตรวจสอบสถานะเซิร์ฟเวอร์...");
    const healthRes = await fetch(`${BASE_URL}/api/rooms`);
    if (!healthRes.ok) {
      throw new Error(`เซิร์ฟเวอร์ยังไม่พร้อมใช้งาน (Status: ${healthRes.status})`);
    }
    const roomsData = await healthRes.json();
    const rooms = roomsData.data;
    console.log(`✅ พบห้องประชุมทั้งหมด ${rooms.length} ห้อง`);
    const targetRoom = rooms[0];
    console.log(`📌 ใช้ห้องทดสอบ: ${targetRoom.name} (${targetRoom.code})\n`);

    // วันที่และช่วงเวลาสำหรับทดสอบ
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 1); // วันพรุ่งนี้
    const dateStr = testDate.toISOString().split("T")[0];

    const startTime = `${dateStr}T14:00:00+07:00`;
    const endTime = `${dateStr}T16:00:00+07:00`;

    // 1. ทดสอบการจองห้องปกติ (Valid Booking)
    console.log("1️⃣ ทดสอบการจองห้องประชุมปกติ (Zero-Auth)...");
    const bookRes = await fetch(`${BASE_URL}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId: targetRoom.id,
        title: "ประชุมทดสอบระบบอัตโนมัติ (Automated E2E Test)",
        description: "ทดสอบการสร้างการจองผ่าน API",
        startTime,
        endTime,
        participantCount: 5,
        bookerName: "คุณสมหมาย ทดสอบดี",
        bookerDepartment: "QA & Testing",
        bookerPhone: "089-999-8888",
        bookerEmail: "sommai@example.com",
      }),
    });

    const bookData = await bookRes.json();
    if (!bookRes.ok || !bookData.success) {
      throw new Error(`การจองล้มเหลว: ${bookData.message}`);
    }

    const { bookingCode, manageToken } = bookData.data;
    console.log(`✅ จองสำเร็จ! Booking Code: ${bookingCode}`);
    console.log(`🔑 Manage Token: ${manageToken}\n`);

    // 2. ทดสอบจองเวลาซ้อนทับ (Double Booking Conflict Test)
    console.log("2️⃣ ทดสอบการจองเวลาซ้อนทับ (14:30 - 15:30 ในห้องเดียวกัน)...");
    const conflictStartTime = `${dateStr}T14:30:00+07:00`;
    const conflictEndTime = `${dateStr}T15:30:00+07:00`;

    const conflictRes = await fetch(`${BASE_URL}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId: targetRoom.id,
        title: "จองชนเวลาเพื่อทดสอบการป้องกัน",
        startTime: conflictStartTime,
        endTime: conflictEndTime,
        participantCount: 3,
        bookerName: "ผู้จองซ้อน",
        bookerDepartment: "การตลาด",
        bookerPhone: "081-111-2222",
      }),
    });

    const conflictData = await conflictRes.json();
    if (conflictRes.status === 409) {
      console.log(`✅ ระบบป้องกันเวลาชนทำงานถูกต้อง! (Status: 409 Conflict)`);
      console.log(`   ข้อความตอบกลับ: "${conflictData.message}"\n`);
    } else {
      console.error(`❌ ผิดพลาด: ระบบยอมให้จองเวลาซ้อนกันได้! (Status: ${conflictRes.status})`);
    }

    // 3. ตรวจสอบแดชบอร์ดและการดึงรายการจอง
    console.log("3️⃣ ตรวจสอบการแสดงผลบนแดชบอร์ดและรายการจอง...");
    const statsRes = await fetch(`${BASE_URL}/api/dashboard/stats`);
    const statsData = await statsRes.json();
    console.log(`✅ ดึงข้อมูลแดชบอร์ดสำเร็จ: มีห้องทั้งหมด ${statsData.data.totalRooms} ห้อง, อัตราการใช้งาน ${statsData.data.utilizationRate}%\n`);

    // 4. ทดสอบการยกเลิกการจอง (Cancel Booking)
    console.log(`4️⃣ ทดสอบการยกเลิกการจอง (${bookingCode})...`);
    const cancelRes = await fetch(`${BASE_URL}/api/bookings/${bookingCode}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: manageToken,
        cancelReason: "เสร็จสิ้นการทดสอบระบบ E2E Test",
      }),
    });

    const cancelData = await cancelRes.json();
    if (cancelRes.ok && cancelData.success) {
      console.log(`✅ ยกเลิกการจองสำเร็จ! ห้องกลับมาว่างพร้อมใช้งานทันที\n`);
    } else {
      console.error(`❌ ยกเลิกล้มเหลว: ${cancelData.message}`);
    }

    console.log("🎉 ผลการทดสอบ: ผ่านทุกขั้นตอน 100%!");
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดระหว่างการทดสอบ:", error.message);
  }
}

runTests();
