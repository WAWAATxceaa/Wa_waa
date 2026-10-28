import * as XLSX from "xlsx";
import { formatThaiDate, formatThaiTime } from "./date-thai";

export interface BookingExportItem {
  bookingCode: string;
  roomName: string;
  roomCode: string;
  title: string;
  bookerName: string;
  bookerDepartment: string;
  bookerPhone: string;
  bookerEmail: string;
  startTime: string | Date;
  endTime: string | Date;
  participantCount: number;
  status: string;
}

/**
 * ส่งออกรายการจองเป็นไฟล์ Excel (.xlsx) พร้อมฟอร์แมตภาษาไทย
 */
export function exportBookingsToExcel(
  bookings: BookingExportItem[],
  filename = "รายงานการจองห้องประชุม"
) {
  const data = bookings.map((b, index) => {
    return {
      ลำดับ: index + 1,
      รหัสการจอง: b.bookingCode,
      ห้องประชุม: `${b.roomName} (${b.roomCode})`,
      หัวข้อการประชุม: b.title,
      ผู้จอง: b.bookerName,
      แผนก: b.bookerDepartment,
      เบอร์โทร: b.bookerPhone,
      อีเมล: b.bookerEmail || "-",
      วันที่: formatThaiDate(b.startTime, "short"),
      เวลาเริ่ม: formatThaiTime(b.startTime),
      เวลาสิ้นสุด: formatThaiTime(b.endTime),
      จำนวนผู้เข้า: b.participantCount,
      สถานะ: b.status === "CONFIRMED" ? "ยืนยันแล้ว" : "ยกเลิกแล้ว",
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  // ตั้งความกว้างคอลัมน์อัตโนมัติ
  worksheet["!cols"] = [
    { wch: 6 },  // ลำดับ
    { wch: 15 }, // รหัสการจอง
    { wch: 28 }, // ห้องประชุม
    { wch: 35 }, // หัวข้อ
    { wch: 20 }, // ผู้จอง
    { wch: 22 }, // แผนก
    { wch: 15 }, // เบอร์โทร
    { wch: 22 }, // อีเมล
    { wch: 16 }, // วันที่
    { wch: 12 }, // เวลาเริ่ม
    { wch: 12 }, // เวลาสิ้นสุด
    { wch: 14 }, // ผู้เข้าร่วม
    { wch: 14 }, // สถานะ
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "รายการจอง");

  const todayStr = new Date().toISOString().split("T")[0];
  XLSX.writeFile(workbook, `${filename}_${todayStr}.xlsx`);
}
