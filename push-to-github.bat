@echo off
chcp 65001 > nul
echo ====================================================
echo   กำลังอัปโหลดโค้ด Smart Meeting Room ไปยัง GitHub
echo   Repository: https://github.com/WAWAATxceaa/Wa_waa.git
echo ====================================================

cd /d "C:\Users\tanwa\.gemini\antigravity\scratch\smart-meeting-room"

where git >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [!] ยังไม่พบโปรแกรม Git ในเครื่องของคุณ
    echo กรุณาติดตั้ง Git ก่อน โดยเปิด PowerShell หรือ Terminal แล้วพิมพ์คำสั่ง:
    echo winget install --id Git.Git -e --source winget
    echo.
    pause
    exit /b 1
)

echo.
echo [1/5] เริ่มต้น Git Repository...
if not exist ".git" (
    git init
)

echo [2/5] ตั้งค่า Remote URL...
git remote remove origin 2>nul
git remote add origin https://github.com/WAWAATxceaa/Wa_waa.git

echo [3/5] เพิ่มไฟล์โปรเจกต์ทั้งหมด (git add .)...
git add .

echo [4/5] ทำการ Commit...
git commit -m "feat: ระบบจองห้องประชุมออนไลน์ (Smart Meeting Room Booking System)"

echo [5/5] ทำการ Push ขึ้น GitHub (Branch: main)...
git branch -M main
git push -u origin main

echo.
echo ====================================================
echo   ✅ อัปโหลดขึ้น GitHub เรียบร้อยแล้ว!
echo   ลิงก์ Repository: https://github.com/WAWAATxceaa/Wa_waa
echo ====================================================
pause
