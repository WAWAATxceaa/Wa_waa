# Wa_waa
# ระบบจองห้องประชุมออนไลน์ (Smart Meeting Room Booking System)

ระบบจองห้องประชุมอัจฉริยะแบบ Zero-Auth พัฒนาด้วย **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, และ **Prisma (SQLite)** พร้อมระบบแจ้งเตือนแบบเรียลไทม์ **Server-Sent Events (SSE)**

---

## 🌟 จุดเด่นและฟีเจอร์สำคัญ

1. **จองห้องประชุมแบบไม่ต้องล็อกอิน (Zero-Auth Model)**:
   - ใครเปิดเว็บก็สามารถจองห้องประชุมได้ทันที ไม่ต้องสมัครสมาชิกหรือจำรหัสผ่าน
   - กรอกชื่อ, แผนก, เบอร์โทรศัพท์, อีเมล, หัวข้อประชุม, ความจุ และเลือกอุปกรณ์ที่ต้องการ
2. **ระบบป้องกันเวลาชนกัน (Collision & Overlap Prevention)**:
   - ตรวจจับการจองซ้อนทับแบบเรียลไทม์ขณะเลือกเวลา (Debounced Conflict Detection)
   - ป้องกัน Race Condition ระดับ Database Transaction ป้องกันการแย่งจองเวลาเดียวกัน
3. **ปฏิทินอัจฉริยะ 3 มุมมอง (Interactive Calendar)**:
   - รองรับมุมมอง **วัน (Day)**, **สัปดาห์ (Week)**, และ **เดือน (Month)**
   - แยกแถบสีตามห้องประชุมชัดเจน
   - **Click-to-Book**: คลิกที่ช่องเวลาว่างใดๆ บนปฏิทินเพื่อเปิดฟอร์มจองด่วนได้ทันที
4. **รองรับภาษาไทยและปี พ.ศ. (Thai Localization)**:
   - แสดงผลภาษาไทยเต็มรูปแบบ
   - แสดงปีพุทธศักราช (พ.ศ. = ค.ศ. + 543) ใน Datepicker และหัวตาราง
   - ปรับ Timezone เป็น `Asia/Bangkok` (UTC+7)
5. **การจัดการการจองโดยไม่มีล็อกอิน (Booking Code & Direct Link)**:
   - เมื่อจองสำเร็จ ระบบจะออก **Booking Code** (เช่น `BK-2610-A101`)
   - ระบบจะสร้าง **Direct Manage URL** พร้อม Secret Token เพื่อให้ผู้จองใช้แก้ไขเวลาหรือขอยกเลิกได้เองอย่างปลอดภัย หรือใช้ค้นหาด้วยเบอร์โทรศัพท์ที่หน้า `/manage`
6. **แดชบอร์ดผู้บริหาร (Live Executive Dashboard)**:
   - แสดงสถานะห้องประชุมแบบเรียลไทม์ (ว่างพร้อมใช้ / กำลังใช้งาน) พร้อมหัวข้อประชุมปัจจุบันและคิวถัดไป
   - อัตราการใช้ห้อง (Utilization Rate)
   - สถิติช่วงเวลาที่มีการใช้งานมากที่สุด (Peak Hours 08:00 - 18:00)
   - อันดับห้องประชุมยอดนิยม (Popular Rooms)
7. **รายงานและการส่งออกข้อมูล (Reports & Export)**:
   - กรองตามช่วงวันที่, ห้องประชุม, แผนก, และสถานะการจอง
   - ส่งออกเป็นไฟล์ **Excel (.xlsx)** จัดรูปแบบคอลัมน์ภาษาไทยสวยงาม
   - ส่งออกเป็นเอกสาร **PDF** (รองรับฟอนต์ไทยและสระวรรณยุกต์สมบูรณ์แบบ)
8. **การแจ้งเตือนเรียลไทม์ (Server-Sent Events - SSE)**:
   - เมื่อมีการจองใหม่ แก้ไข หรือยกเลิก ปฏิทินและแดชบอร์ดจะอัปเดตทันทีโดยไม่ต้องกดรีเฟรช
   - In-App Toast แจ้งเตือนลอยขึ้นที่มุมจอ
   - ระบบแจ้งเตือนอัตโนมัติก่อนเริ่มประชุม **15 นาที** (15-min advance reminder)

---

## 🚀 วิธีการติดตั้งและเริ่มใช้งาน

### 1. เข้าสู่โฟลเดอร์ของโปรเจกต์
```bash
cd C:\Users\tanwa\.gemini\antigravity\scratch\smart-meeting-room
```

### 2. ติดตั้ง Dependencies
```bash
npm install
```

### 3. สร้างฐานข้อมูล SQLite และ Seed ข้อมูลจำลองเริ่มต้น
```bash
npx prisma db push
npx prisma db seed
```
*(หมายเหตุ: ระบบมีตัวช่วย Auto-Seed ในตัว หากเปิดเว็บครั้งแรก ระบบจะสร้างห้องและข้อมูลจำลองให้อัตโนมัติ)*

### 4. รัน Dev Server
```bash
npm run dev
```

เปิดเบราว์เซอร์ไปที่: **http://localhost:3000**

---

## 📁 โครงสร้างโปรเจกต์หลัก

- `src/app/`
  - `page.tsx` — หน้าปฏิทินจองห้องประชุมหลัก (Day / Week / Month)
  - `book/page.tsx` — ฟอร์มจองห้องประชุมแบบเต็มรูปแบบ
  - `manage/page.tsx` — หน้าค้นหาและจัดการการจองด้วย Booking Code + Phone
  - `manage/[code]/page.tsx` — หน้ารายละเอียด แก้ไข และยกเลิกการจอง
  - `dashboard/page.tsx` — แดชบอร์ดภาพรวมและสถิติ
  - `reports/page.tsx` — หน้ารายงานและการส่งออก Excel / PDF
  - `rooms/page.tsx` — หน้าจัดการข้อมูลห้องประชุมและเปิด-ปิดสถานะ
  - `api/` — REST & SSE Endpoints (`rooms`, `bookings`, `dashboard`, `sse`, `seed`)
- `src/components/` — UI Components แยกตามฟังก์ชัน (Calendar, Booking, Dashboard, Reports, Rooms)
- `src/lib/` — Date Thai utilities, Conflict detector, SSE broker, Export helpers, Prisma client
- `prisma/` — Prisma Schema (`schema.prisma`) และ Seed script (`seed.ts`)
