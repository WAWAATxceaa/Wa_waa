import { formatThaiDate, formatThaiTime } from "./date-thai";
import { BookingExportItem } from "./export-excel";

/**
 * ส่งออกรายงานเป็น PDF โดยใช้หน้าต่างพิมพ์มาตรฐานของเบราว์เซอร์
 * ซึ่งรองรับฟอนต์ไทย วรรณยุกต์ และสระลอยได้สมบูรณ์แบบ 100%
 */
export function exportBookingsToPDF(
  bookings: BookingExportItem[],
  filtersSummary = "รายงานการจองห้องประชุมทั้งหมด"
) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("กรุณาอนุญาตป๊อปอัปเพื่อเปิดหน้าต่างพิมพ์รายงาน PDF");
    return;
  }

  const rowsHtml = bookings
    .map(
      (b, idx) => `
    <tr style="border-bottom: 1px solid #e2e8f0; font-size: 13px;">
      <td style="padding: 10px 8px; text-align: center;">${idx + 1}</td>
      <td style="padding: 10px 8px; font-weight: bold; color: #4338ca;">${b.bookingCode}</td>
      <td style="padding: 10px 8px;"><strong>${b.roomName}</strong></td>
      <td style="padding: 10px 8px;">${b.title}</td>
      <td style="padding: 10px 8px;">${b.bookerName}<br><span style="color:#64748b; font-size:11px;">${b.bookerDepartment}</span></td>
      <td style="padding: 10px 8px;">${formatThaiDate(b.startTime, "short")}<br><span style="color:#64748b; font-size:11px;">${formatThaiTime(b.startTime)} - ${formatThaiTime(b.endTime)}</span></td>
      <td style="padding: 10px 8px; text-align: center;">${b.participantCount}</td>
      <td style="padding: 10px 8px; text-align: center;">
        <span style="display:inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; ${
          b.status === "CONFIRMED"
            ? "background-color: #dcfce7; color: #166534;"
            : "background-color: #fee2e2; color: #991b1b;"
        }">
          ${b.status === "CONFIRMED" ? "ยืนยันแล้ว" : "ยกเลิก"}
        </span>
      </td>
    </tr>
  `
    )
    .join("");

  const printContent = `
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="utf-8">
      <title>รายงานการจองห้องประชุม</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Sarabun', sans-serif;
          margin: 0;
          padding: 24px;
          color: #1e293b;
          background: #ffffff;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #4f46e5;
          padding-bottom: 16px;
          margin-bottom: 20px;
        }
        .title {
          font-size: 22px;
          font-weight: 700;
          color: #1e1b4b;
          margin: 0;
        }
        .subtitle {
          font-size: 13px;
          color: #64748b;
          margin-top: 4px;
        }
        .meta {
          text-align: right;
          font-size: 12px;
          color: #64748b;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        th {
          background-color: #f8fafc;
          border-bottom: 2px solid #cbd5e1;
          color: #334155;
          font-weight: 600;
          font-size: 13px;
          padding: 10px 8px;
          text-align: left;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 11px;
          color: #94a3b8;
          border-top: 1px solid #e2e8f0;
          padding-top: 12px;
        }
        @media print {
          body { padding: 0; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1 class="title">รายงานการจองห้องประชุม (Smart Meeting Room)</h1>
          <div class="subtitle">${filtersSummary} | จำนวนทั้งหมด ${bookings.length} รายการ</div>
        </div>
        <div class="meta">
          พิมพ์เมื่อ: ${formatThaiDate(new Date(), "medium")}<br>
          เวลา: ${formatThaiTime(new Date())}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 40px; text-align: center;">#</th>
            <th style="width: 100px;">รหัสการจอง</th>
            <th style="width: 150px;">ห้องประชุม</th>
            <th>หัวข้อการประชุม</th>
            <th style="width: 140px;">ผู้จอง / แผนก</th>
            <th style="width: 140px;">วัน-เวลา</th>
            <th style="width: 50px; text-align: center;">คน</th>
            <th style="width: 70px; text-align: center;">สถานะ</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div class="footer">
        ระบบจองห้องประชุมออนไลน์ (Smart Meeting Room Booking System) — เอกสารออกโดยระบบอัตโนมัติ
      </div>

      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(printContent);
  printWindow.document.close();
}
