import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Booking } from '../types';
import { formatThaiDate } from '../utils/dateUtils';

/**
 * Export Bookings to Excel (.xlsx) using SheetJS
 */
export function exportToExcel(bookings: Booking[], fileName = 'meeting-room-bookings.xlsx') {
  const data = bookings.map((b) => ({
    'รหัสการจอง (Code)': b.bookingCode,
    'สถานะ': b.status === 'confirmed' ? 'ยืนยันแล้ว' : 'ยกเลิก',
    'ห้องประชุม': b.roomName,
    'วันที่': b.date,
    'เวลาเริ่ม': b.startTime,
    'เวลาสิ้นสุด': b.endTime,
    'จำนวนผู้เข้าร่วม (คน)': b.participantCount,
    'อุปกรณ์ที่ใช้': (b.amenities || []).join(', ') || '-',
    'ผู้จอง': b.bookerName,
    'แผนก': b.department,
    'ข้อมูลติดต่อ': b.bookerContact,
    'หัวข้อการประชุม': b.title,
    'รายละเอียด': b.description || '-',
    'วันที่ทำการจอง': formatThaiDate(b.createdAt),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'รายงานการจองห้อง');

  // Set column widths
  const colWidths = [
    { wch: 15 }, // Code
    { wch: 12 }, // Status
    { wch: 25 }, // Room
    { wch: 14 }, // Date
    { wch: 10 }, // Start
    { wch: 10 }, // End
    { wch: 18 }, // Attendees
    { wch: 25 }, // Amenities
    { wch: 20 }, // Booker
    { wch: 25 }, // Department
    { wch: 20 }, // Contact
    { wch: 30 }, // Topic
    { wch: 25 }, // Note
    { wch: 20 }, // Created
  ];
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, fileName);
}

/**
 * Export Bookings to PDF using jsPDF + autoTable
 */
export function exportToPDF(bookings: Booking[], title = 'รายงานการจองห้องประชุม (Smart Meeting Room)') {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Header Title
  doc.setFontSize(16);
  doc.text(title, 14, 15);
  doc.setFontSize(10);
  doc.text(`สร้างเมื่อ: ${new Date().toLocaleString('th-TH')} | ทั้งหมด: ${bookings.length} รายการ`, 14, 22);

  const tableRows = bookings.map((b, idx) => [
    idx + 1,
    b.bookingCode,
    b.roomName,
    `${b.date} (${b.startTime}-${b.endTime})`,
    b.bookerName,
    b.department,
    b.title,
    b.status === 'confirmed' ? 'Confirmed' : 'Cancelled',
  ]);

  autoTable(doc, {
    head: [['#', 'Code', 'Room', 'Date & Time', 'Booker', 'Department', 'Topic', 'Status']],
    body: tableRows,
    startY: 28,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [139, 92, 246], // Gen Z Purple
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 20 },
      2: { cellWidth: 40 },
      3: { cellWidth: 45 },
      4: { cellWidth: 35 },
      5: { cellWidth: 35 },
      6: { cellWidth: 55 },
      7: { cellWidth: 25 },
    },
  });

  doc.save(`meeting-room-report-${new Date().toISOString().split('T')[0]}.pdf`);
}
