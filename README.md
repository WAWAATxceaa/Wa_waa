# 🏢 Smart Meeting Room Booking System (ระบบจองห้องประชุมออนไลน์)

เว็บแอปพลิเคชันระบบจองห้องประชุมออนไลน์อัจฉริยะ พัฒนาด้วย Next.js (App Router), TypeScript, Tailwind CSS, PostgreSQL, Prisma, NextAuth, Server-Sent Events (SSE), FullCalendar และ Recharts

---

## ✨ ฟีเจอร์หลัก (Key Features)

1. **ระบบจัดการห้องประชุม (Room Management)**
   - ดูรายการห้องประชุม, ความจุ, ชั้น, อุปกรณ์ประจำห้อง (โปรเจกเตอร์ 4K, VC System, ไวท์บอร์ด, Smart TV)
   - สถานะห้อง: เปิดใช้งาน (Active), ปิดปรับปรุง (Maintenance), ปิดใช้งาน (Inactive)
   - Admin สามารถเพิ่ม, แก้ไข, ลบ และกำหนดสีประจำห้องสำหรับแสดงบนปฏิทิน
2. **ปฏิทินจองห้องแบบ Interactive (FullCalendar)**
   - แสดงผลแยกสีตามห้องประชุมอย่างชัดเจน
   - รองรับมุมมองรายเดือน (Month), รายสัปดาห์ (Week), รายวัน (Day)
   - คลิกหรือลากช่วงเวลาว่างบนปฏิทินเพื่อเปิดฟอร์มจองห้องทันที
   - คลิกการจองเพื่อดูรายละเอียดและผู้เข้าร่วม
3. **การตรวจสอบกฎธุรกิจที่ Server (Strict Business Rules)**
   - **ห้ามจองเวลาทับซ้อนในห้องเดียวกัน** (ตรวจด้วย Prisma Interactive Transaction `$transaction` ป้องกัน Race Condition)
   - **จองล่วงหน้าได้ไม่เกิน 60 วัน**
   - **จองได้ครั้งละไม่เกิน 4 ชั่วโมง**
   - **ยกเลิกได้เฉพาะเจ้าของการจอง หรือ Admin เท่านั้น**
4. **การแจ้งเตือนและการอัปเดตแบบ Real-time (Server-Sent Events - SSE)**
   - เมื่อมีการจอง, แก้ไข หรือยกเลิก ปฏิทินและสถานะห้องจะอัปเดตทันทีโดยไม่ต้อง Refresh หน้าจอ
   - กระดิ่งแจ้งเตือน In-app Notification พร้อมป้ายตัวเลขสีแดงนับจำนวนข้อความที่ยังไม่ได้อ่าน
   - ระบบแจ้งเตือนอัตโนมัติก่อนเริ่มประชุม 15 นาที
5. **แดชบอร์ดสถิติและการวิเคราะห์ (Dashboard & Recharts)**
   - สรุปตัวเลขห้องว่าง/ไม่ว่างขณะนี้, การประชุมทั้งหมดวันนี้, ผู้เข้าร่วมวันนี้
   - การ์ดสถานะห้องแบบสด (Live Status Grid) พร้อมปุ่มจองด่วน
   - ไทม์ไลน์การประชุมตลอดทั้งวัน (Today's Schedule)
   - ชาร์ตอัตราการใช้ห้อง (Room Utilization Rate %)
   - ชาร์ตห้องยอดนิยม (Most Popular Rooms)
   - ชาร์ตกราฟช่วงเวลาที่มีการใช้งานหนาแน่นตลอดวัน (Peak Hours Distribution)
6. **ระบบรายงานและ Export ข้อมูล (Reporting)**
   - กรองข้อมูลตามช่วงวันที่ (Date Range), ห้องประชุม และแผนก
   - ส่งออกไฟล์ **CSV** พร้อม UTF-8 BOM สำหรับเปิดใน Microsoft Excel ภาษาไทยได้ทันที
   - ส่งออกไฟล์ **PDF Report** พร้อมจัดตารางและสรุปสถิติทางการ
7. **UI ภาษาไทย, Responsive และ Dark Mode**
   - รองรับการใช้งานทั้งบนคอมพิวเตอร์ แท็บเล็ต และสมาร์ทโฟน
   - สลับโหมดสว่าง/มืด (Light / Dark mode) ได้ตลอดเวลา

---

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + CSS Variables (Dark/Light mode) + Lucide Icons
- **Database & ORM**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js (Email / Password Credentials Provider) + bcryptjs
- **Calendar**: FullCalendar (DayGrid, TimeGrid, Interaction)
- **Charts**: Recharts (ResponsiveContainer, BarChart, AreaChart)
- **Real-time**: Server-Sent Events (SSE) ผ่าน Web Streams API
- **Export**: jsPDF + jspdf-autotable (PDF) และ UTF-8 BOM CSV Stream
- **Timezone**: `Asia/Bangkok` (UTC+7) ด้วย `date-fns` และ `date-fns-tz`

---

## 🚀 วิธีการติดตั้งและรันระบบ (Setup & Getting Started)

### 1. เข้าสู่โฟลเดอร์โปรเจกต์
```bash
cd C:\Users\tanwa\.gemini\antigravity\scratch\smart-meeting-room
```

### 2. ติดตั้ง Dependencies
```bash
npm install
```

### 3. ตั้งค่าฐานข้อมูล (Database Setup)
เปิดไฟล์ `.env` และตรวจสอบค่าการเชื่อมต่อ PostgreSQL:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/smart_meeting_room?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="smart-meeting-room-super-secret-key-change-in-prod-2026"
NEXT_PUBLIC_TIMEZONE="Asia/Bangkok"
```

รันคำสั่ง Push Schema และ Seeding ข้อมูลเริ่มต้น:
```bash
npx prisma db push
npm run db:seed
```

*(หมายเหตุ: หากต้องการทดสอบแบบไม่ต้องติดตั้ง PostgreSQL สามารถใช้ schema SQLite สำหรับทดสอบได้ด้วยคำสั่ง `npx prisma db push --schema=prisma/schema.sqlite.prisma`)*

### 4. รัน Development Server
```bash
npm run dev
```
เปิดเบราว์เซอร์และเข้าไปที่: **`http://localhost:3000`**

---

## 🔑 บัญชีผู้ใช้สำหรับทดสอบ (Demo Accounts)

ระบบมีปุ่มคลิกเดียวเพื่อกรอกข้อมูลผู้ใช้ทดสอบในหน้า Login:

| บทบาท (Role) | อีเมล (Email) | รหัสผ่าน (Password) | แผนก / สิทธิ์ |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@company.com` | `admin1234` | ผู้ดูแลระบบ (จัดการห้องประชุม, ดูการจองทั้งหมด, ดูรายงาน, Export) |
| **Employee** | `somchai@company.com` | `emp1234` | แผนกวิศวกรรมซอฟต์แวร์ (IT) |
| **Employee** | `suda@company.com` | `emp1234` | แผนกทรัพยากรบุคคล (HR) |
| **Employee** | `ananda@company.com` | `emp1234` | แผนกการตลาด (Marketing) |

---

## 📂 โครงสร้างโฟลเดอร์ของระบบ (Project Structure)

```text
smart-meeting-room/
├── prisma/
│   ├── schema.prisma              # PostgreSQL Prisma Schema
│   ├── schema.sqlite.prisma       # ทางเลือก SQLite Schema สำหรับรันด่วน
│   └── seed.ts                    # สคริปต์จำลองข้อมูล Users, Rooms, Bookings, Notifications
├── src/
│   ├── app/
│   │   ├── (auth)/login/          # หน้าเข้าสู่ระบบ พร้อมปุ่ม Demo Login
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx         # Responsive Sidebar + Navbar + Theme toggle + Bell
│   │   │   ├── page.tsx           # หน้าแดชบอร์ดหลัก (KPIs, Live Status, Recharts, Schedule)
│   │   │   ├── calendar/          # ปฏิทินจองห้อง FullCalendar (ลาก/คลิกเพื่อจอง)
│   │   │   ├── rooms/             # ค้นหาและดูรายละเอียดห้องประชุมทั้งหมด
│   │   │   ├── bookings/          # การจองของฉัน และปุ่มยกเลิก
│   │   │   └── admin/
│   │   │       ├── rooms/         # Admin: CRUD ห้องประชุม, ปรับสถานะ, เลือกสี
│   │   │       ├── bookings/      # Admin: ดูรายการจองทั้งหมดของทุกคนในองค์กร
│   │   │       └── reports/       # Admin: ตัวกรองรายงานสถิติ และปุ่ม Export CSV/PDF
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/# NextAuth route handler
│   │   │   ├── rooms/             # GET, POST ห้องประชุม
│   │   │   ├── bookings/          # GET, POST, PATCH (ยกเลิก) พร้อม Strict Concurrency Check
│   │   │   ├── dashboard/stats/   # คำนวณ Utilization, Peak hours, Popular rooms
│   │   │   ├── notifications/     # In-app notifications และ 15-min reminder runner
│   │   │   ├── events/sse/        # Server-Sent Events real-time broadcast stream
│   │   │   └── reports/export-csv/# ส่งออก CSV พร้อม UTF-8 BOM สำหรับ Excel
│   │   ├── globals.css            # Tailwind & Dark/Light mode theme tokens
│   │   └── layout.tsx             # Root layout
│   ├── components/
│   │   ├── calendar/              # FullCalendar wrapper, Modal จองห้อง, Modal ดูรายละเอียด
│   │   ├── dashboard/             # Metric cards, Grid สถานะห้อง, Recharts analytics, Timeline
│   │   ├── rooms/                 # การ์ดห้องประชุม, Modal ฟอร์มสร้าง/แก้ไขห้อง
│   │   ├── bookings/              # ตารางรายการจอง แท็บสถานะ และ Modal ยืนยันยกเลิก
│   │   ├── notifications/         # กระดิ่งแจ้งเตือน Real-time SSE
│   │   ├── reports/               # ตัวกรองรายงาน, สรุปผล, ส่งออก PDF / CSV
│   │   └── shared/                # Navbar, Sidebar, ThemeToggle, Providers
│   ├── lib/
│   │   ├── prisma.ts              # Prisma client singleton
│   │   ├── auth.ts                # NextAuth options & JWT callbacks
│   │   ├── sse.ts                 # Real-time EventEmitter instance
│   │   ├── timezone.ts            # Asia/Bangkok date/time formatting helpers
│   │   └── validations/           # Zod schemas สำหรับกฎการจองและห้องประชุม
│   ├── server/services/           # Business logic layer (Overlap check, 60-day limit, 4-hr limit)
│   └── types/                     # TypeScript definitions
└── README.md
```

---

## 🛡 การทดสอบกฎธุรกิจ (Business Rules Verification)

1. **ทดสอบการจองเวลาทับซ้อน (Double Booking)**:
   - ทดลองจองห้องเดิมในช่วงเวลาที่มีการประชุมอยู่แล้ว ระบบจะปฏิเสธคำขอทันทีและแสดงข้อความแจ้งเตือนสีแดงพร้อมระบุชื่อผู้จองก่อนหน้า
2. **ทดสอบกฎจองล่วงหน้าไม่เกิน 60 วัน**:
   - หากเลือกวันที่เกิน 60 วันนับจากปัจจุบัน ระบบจะแจ้งเตือนว่า "สามารถจองล่วงหน้าได้ไม่เกิน 60 วัน"
3. **ทดสอบกฎระยะเวลาไม่เกิน 4 ชั่วโมง**:
   - หากเลือกเวลาสิ้นสุดห่างจากเวลาเริ่มต้นเกิน 240 นาที ระบบจะปฏิเสธว่า "ระยะเวลาในการจองต้องไม่เกิน 4 ชั่วโมงต่อครั้ง"
4. **ทดสอบสิทธิ์การยกเลิก**:
   - พนักงานทั่วไปจะเห็นปุ่มยกเลิกเฉพาะการจองที่เป็นของตนเองเท่านั้น ส่วน Admin จะสามารถยกเลิกได้ทุกรายการพร้อมระบุเหตุผล
