# คู่มือการติดตั้ง Google Apps Script Webhook สำหรับบันทึกข้อมูลการจองลง Google Sheet 📑

คู่มือนี้จะแนะนำวิธีเชื่อมต่อระบบจองห้องประชุมเข้ากับ Google Sheets ทีละขั้นตอนอย่างละเอียดครับ

---

### ขั้นตอนที่ 1: สร้าง Google Sheet ใหม่
1. ไปที่ [Google Sheets (sheets.new)](https://sheets.new)
2. ตั้งชื่อชีต เช่น **"ระบบจองห้องประชุม - Data Sheet"**

---

### ขั้นตอนที่ 2: เปิด Google Apps Script Editor
1. ที่แถบเมนูด้านบนของ Google Sheet ให้คลิก **ส่วนขยาย (Extensions)** > **Apps Script**
2. ระบบจะเปิดแท็บแก้ไขโค้ดใหม่ ให้ลบโค้ดเดิมทั้งหมดในไฟล์ `Code.gs` ออก
3. นำโค้ดจากไฟล์ `google-apps-script/Code.gs` มาวางแทนที่ทั้งหมด
4. (ตัวเลือก) หากต้องการเปลี่ยน Shared Secret Token ให้แก้ไขตัวแปร `SHARED_SECRET_TOKEN` ที่บรรทัดแรก ๆ ให้ตรงกับค่าใน `.env`

---

### ขั้นตอนที่ 3: Deploy เป็น Web App
1. คลิกปุ่ม **ทำให้ใช้งานได้ (Deploy)** ที่มุมขวาบน > เลือก **การจัดการทำให้ใช้งานได้ใหม่ (New deployment)**
2. คลิกไอคอนรูปเฟือง ⚙️ ด้านซ้าย > เลือกประเภท **เว็บแอป (Web app)**
3. กรอกรายละเอียดดังนี้:
   * **คำอธิบาย (Description)**: `Smart Meeting Room Webhook v1`
   * **ดำเนินการในฐานะ (Execute as)**: `ฉัน (Me / your-email@gmail.com)`
   * **ผู้ที่มีสิทธิ์เข้าถึง (Who has access)**: **`ทุกคน (Anyone)`** *(สำคัญมาก: ต้องเลือก Anyone เพื่อให้เว็บส่งข้อมูลเข้ามาได้โดยไม่ต้องผ่าน OAuth Login)*
4. คลิก **ทำให้ใช้งานได้ (Deploy)**
5. ระบบอาจขอสิทธิ์เข้าถึง Google Sheet ให้คลิก **ให้สิทธิ์เข้าถึง (Authorize access)** > เลือกบัญชี Google ของคุณ > คลิก **ขั้นสูง (Advanced)** > คลิก **ไปยังโปรเจกต์ (Go to Untitled project / unsafe)** > คลิก **อนุญาต (Allow)**
6. คัดลอก **URL ของเว็บแอป (Web App URL)** ที่ลงท้ายด้วย `/exec` เช่น:
   `https://script.google.com/macros/s/AKfycbx.../exec`

---

### ขั้นตอนที่ 4: นำ URL ไปใส่ในโปรเจกต์
1. เปิดไฟล์ `.env` ในเครื่องของคุณ (หรือ Settings > Secrets and variables ใน GitHub)
2. นำ URL มาใส่ในตัวแปร:
   ```env
   VITE_SHEETS_WEBHOOK_URL="https://script.google.com/macros/s/AKfycbx.../exec"
   VITE_SHEETS_SECRET_TOKEN="SMART_MEETING_2026_SECURE_KEY"
   ```
3. เมื่อมีการจองใหม่ แก้ไข หรือยกเลิก ข้อมูลจะไหลเข้า Google Sheet โดยอัตโนมัติทันที! 🎉
