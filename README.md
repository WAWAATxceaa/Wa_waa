# ระบบจองห้องประชุมออนไลน์ (Smart Meeting Room Booking System) ✨

เว็บแอพพลิเคชันระบบจองห้องประชุมออนไลน์สไตล์ **Gen Z** สดใส โมเดิร์น รวดเร็ว ไม่ต้องลงทะเบียนหรือล็อกอินให้ยุ่งยาก ออกแบบมาเพื่อทีมยุคใหม่ รองรับภาษาไทย ปี พ.ศ. เขตเวลา Asia/Bangkok พร้อมระบบป้องกันการจองเวลาซ้อนกัน (Double-Booking Prevention) และซิงค์ข้อมูลแบบเรียลไทม์กับ Firebase Firestore และ Google Sheets 🚀

---

## 🌟 จุดเด่นและฟีเจอร์สำคัญ

1. **จองได้ทันที (Zero-Auth Experience)**:
   - ไม่ต้องสมัครสมาชิกหรือลงชื่อเข้าใช้ กรอกชื่อ แผนก ข้อมูลติดต่อ และหัวข้อประชุมเพื่อจองได้ทันที
   - ได้รับ **Booking Code 6 หลัก** สุ่มเฉพาะรายการ พร้อมลิงก์ตรงสำหรับนำไปแก้ไขหรือยกเลิกการจอง
2. **ป้องกันการจองเวลาซ้อนกัน (Conflict Prevention)**:
   - ตรวจสอบความพร้อมของห้องแบบ Real-time ทันทีที่เลือกวันและเวลาบนหน้าเว็บ
   - เสริมความปลอดภัยด้วย **Firestore Transaction** ป้องกันการกดจองเวลาเดียวกันพร้อมกัน
3. **ดีไซน์สไตล์ Gen Z & Bento Grid**:
   - การ์ดมนโค้ง `rounded-3xl` / `rounded-4xl`, Glassmorphism, สี Gradient ม่วง-ชมพู-ฟ้าสะท้อนแสง
   - แดชบอร์ดแบบ Bento Grid พร้อมไฟสถานะสด (Live Indicator: 🟢 ว่าง / 🔴 ใช้งานอยู่)
   - เอฟเฟกต์ฉลอง Confetti เมื่อทำการจองสำเร็จ และรองรับ Dark / Light Mode
4. **ปฏิทินอัจฉริยะ (Calendar View)**:
   - แสดงมุมมอง เดือน / สัปดาห์ / วัน แยกสีตามห้องประชุมอย่างชัดเจน
   - คลิกที่ช่องว่างของวันใดก็ได้ เพื่อเปิดฟอร์มจองห้องของวันนั้นทันที
5. **วิเคราะห์ข้อมูลและรายงาน (Analytics & Reports)**:
   - กราฟสถิติห้องยอดนิยม, ช่วงเวลาที่มีการใช้งานสูงสุด, สัดส่วนการจองตามแผนก (Recharts)
   - ตารางค้นหาและกรองข้อมูลอย่างละเอียด พร้อมปุ่มส่งออก **Excel (.xlsx)** และ **PDF**
6. **แจ้งเตือนแบบเรียลไทม์ (Real-time Notifications)**:
   - แจ้งเตือน Toast ทันทีที่มีการจองใหม่ แก้ไข หรือยกเลิก
   - ระบบตรวจจับและแจ้งเตือนก่อนเริ่มประชุม 15 นาที
7. **เชื่อมต่อ Google Sheets อัตโนมัติ (Apps Script Webhook)**:
   - ทุกครั้งที่จอง แก้ไข หรือยกเลิก จะส่งข้อมูลไปยัง Google Apps Script Web App แบบ non-blocking
   - ระบบค้นหา Booking Code เพื่ออัปเดตแถวเดิม ไม่สร้างแถวซ้ำ พร้อม Retry อัตโนมัติ 3 ครั้ง
8. **โหมดผู้ดูแลระบบ (Admin PIN Protected)**:
   - จัดการและเปิด/ปิดสถานะห้องประชุม ป้องกันด้วยรหัส PIN (ค่าเริ่มต้น: `8888`)

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS + Custom Neon Glassmorphism
- **Animations**: Framer Motion + Canvas-Confetti
- **Icons**: Lucide Icons
- **Charts**: Recharts
- **Database & Realtime**: Firebase Firestore (`onSnapshot` + `runTransaction`) พร้อมโหมด Reactive Fallback ในตัว
- **Spreadsheet & PDF Export**: SheetJS (`xlsx`) + jsPDF
- **Routing**: `HashRouter` (รองรับการ Refresh หน้าบน GitHub Pages ได้ 100%)

---

## 🚀 วิธีการติดตั้งและรันในเครื่อง (Local Development)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. ตั้งค่าไฟล์ Environment (.env)
คัดลอกไฟล์ตัวอย่าง:
```bash
cp .env.example .env
```
*(หากยังไม่ได้ใส่ค่า Firebase ระบบจะสลับเข้าสู่โหมด Local Reactive Storage ให้ทำงานได้ทันทีโดยอัตโนมัติ)*

### 3. รันเซิร์ฟเวอร์สำหรับพัฒนา
```bash
npm run dev
```
เปิดบราวเซอร์ที่: `http://localhost:3000`

### 4. Build สำหรับ Production
```bash
npm run build
```

---

## 📑 การตั้งค่า Google Sheets Webhook (เชื่อมต่อชีต)

1. เปิด [Google Sheets](https://sheets.new) แล้วไปที่เมนู **ส่วนขยาย (Extensions)** > **Apps Script**
2. นำโค้ดในโฟลเดอร์ `google-apps-script/Code.gs` ไปวางแทนที่โค้ดเดิมทั้งหมด
3. คลิก **Deploy** > **New deployment** > เลือก **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
4. นำ Web App URL ที่ได้มาใส่ในไฟล์ `.env`:
   ```env
   VITE_SHEETS_WEBHOOK_URL="https://script.google.com/macros/s/AKfycb.../exec"
   VITE_SHEETS_SECRET_TOKEN="SMART_MEETING_2026_SECURE_KEY"
   ```
*(อ่านคู่มืออย่างละเอียดได้ที่ `google-apps-script/README.md`)*

---

## 🌐 การ Deploy ขึ้น GitHub Pages อัตโนมัติ (GitHub Actions)

โปรเจกต์นี้มีไฟล์ Workflow `.github/workflows/deploy.yml` พร้อมใช้งาน:

1. **สร้าง Git Repository และ Push โค้ด**:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit for smart meeting room system"
   git branch -M main
   git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
   git push -u origin main
   ```

2. **เปิดการใช้งาน GitHub Pages ใน GitHub Repository**:
   - ไปที่แท็บ **Settings** ของ Repository บน GitHub
   - เมนูด้านซ้ายเลือก **Pages**
   - ใต้หัวข้อ **Build and deployment** > ให้เปลี่ยน **Source** เป็น:
     **`GitHub Actions`**

3. **ใส่ตัวแปรความลับ (Repository Secrets)**:
   - ไปที่ **Settings** > **Secrets and variables** > **Actions**
   - เพิ่ม Secrets ดังนี้:
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_STORAGE_BUCKET`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - `VITE_FIREBASE_APP_ID`
     - `VITE_SHEETS_WEBHOOK_URL`
     - `VITE_SHEETS_SECRET_TOKEN`

4. เมื่อ push โค้ดเข้า branch `main` ระบบจะทำการ build และ deploy ขึ้นหน้าเว็บ GitHub Pages ให้โดยอัตโนมัติทันที! 🎉
