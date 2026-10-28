"use client";

import React, { useState, useEffect, useCallback } from "react";
import { BookingItem, RoomItem } from "@/types";
import { formatThaiDate, formatThaiTime } from "@/lib/timezone";
import {
  FileSpreadsheet,
  FileText,
  Filter,
  Calendar,
  Clock,
  Users,
  Download,
  Building,
} from "lucide-react";
import { differenceInMinutes } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function ReportView() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [roomId, setRoomId] = useState("all");
  const [department, setDepartment] = useState("all");
  const [loading, setLoading] = useState(false);

  // 1. Fetch Rooms
  useEffect(() => {
    async function loadRooms() {
      const res = await fetch("/api/rooms?availability=false");
      if (res.ok) {
        const data = await res.json();
        setRooms(data);
      }
    }
    loadRooms();
  }, []);

  // 2. Fetch Filtered Report Data
  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (roomId !== "all") params.set("roomId", roomId);
      if (department !== "all") params.set("department", department);

      const res = await fetch(`/api/reports?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, roomId, department]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Derived metrics
  const totalBookings = bookings.length;
  const totalConfirmed = bookings.filter((b) => b.status === "CONFIRMED").length;
  const totalMinutes = bookings
    .filter((b) => b.status === "CONFIRMED")
    .reduce((sum, b) => sum + differenceInMinutes(new Date(b.endTime), new Date(b.startTime)), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const totalAttendees = bookings
    .filter((b) => b.status === "CONFIRMED")
    .reduce((sum, b) => sum + (b.participantCount || 1), 0);

  // Export CSV
  const handleExportCSV = () => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (roomId !== "all") params.set("roomId", roomId);
    if (department !== "all") params.set("department", department);

    window.open(`/api/reports/export-csv?${params.toString()}`, "_blank");
  };

  // Export PDF with jsPDF and autoTable
  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Document Header
    doc.setFontSize(16);
    doc.text("Smart Meeting Room Booking Report", 14, 20);

    doc.setFontSize(10);
    doc.text(`Generated at: ${new Date().toLocaleString("th-TH")} (Timezone: Asia/Bangkok)`, 14, 28);
    doc.text(
      `Summary: Total ${totalBookings} Bookings | Confirmed: ${totalConfirmed} | Total Hours: ${totalHours} hrs | Participants: ${totalAttendees}`,
      14,
      35
    );

    // Table Data
    const tableHeaders = [
      ["Title", "Room", "Date", "Time", "Booked By", "Dept", "Guests", "Status"],
    ];

    const tableRows = bookings.map((b) => [
      b.title,
      b.room.name,
      formatThaiDate(b.startTime, "yyyy-MM-dd"),
      `${formatThaiTime(b.startTime)} - ${formatThaiTime(b.endTime)}`,
      b.user.name,
      b.user.department || "-",
      b.participantCount,
      b.status === "CONFIRMED" ? "Confirmed" : "Cancelled",
    ]);

    autoTable(doc, {
      head: tableHeaders,
      body: tableRows,
      startY: 42,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    doc.save(`meeting-room-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Filter className="w-4 h-4 text-primary" />
          <span>ตัวกรองรายงาน</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              ตั้งแต่วันที่
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              ถึงวันที่
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs"
            />
          </div>

          {/* Room Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              ห้องประชุม
            </label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs"
            >
              <option value="all">ทุกห้องประชุม</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              แผนก / ฝ่าย
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs"
            >
              <option value="all">ทุกแผนก</option>
              <option value="IT">วิศวกรรมซอฟต์แวร์ (IT)</option>
              <option value="HR">ทรัพยากรบุคคล (HR)</option>
              <option value="Marketing">การตลาด (Marketing)</option>
              <option value="บริหาร">ฝ่ายบริหาร</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
          <button
            onClick={() => {
              setStartDate("");
              setEndDate("");
              setRoomId("all");
              setDepartment("all");
            }}
            className="text-xs text-muted-foreground hover:text-foreground font-medium underline"
          >
            ล้างตัวกรองทั้งหมด
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl border border-border bg-card text-foreground hover:bg-muted text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export CSV (Excel)</span>
            </button>

            <button
              onClick={handleExportPDF}
              className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <FileText className="w-4 h-4 text-white" />
              <span>Export PDF Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-border bg-card text-card-foreground">
          <p className="text-xs text-muted-foreground">การจองทั้งหมด</p>
          <p className="text-2xl font-bold mt-1">{totalBookings} รายการ</p>
        </div>
        <div className="p-4 rounded-2xl border border-border bg-card text-card-foreground">
          <p className="text-xs text-muted-foreground">จองสำเร็จ (ยืนยัน)</p>
          <p className="text-2xl font-bold mt-1 text-emerald-600">{totalConfirmed}</p>
        </div>
        <div className="p-4 rounded-2xl border border-border bg-card text-card-foreground">
          <p className="text-xs text-muted-foreground">ชั่วโมงการใช้งานรวม</p>
          <p className="text-2xl font-bold mt-1 text-blue-600">{totalHours} ชม.</p>
        </div>
        <div className="p-4 rounded-2xl border border-border bg-card text-card-foreground">
          <p className="text-xs text-muted-foreground">ผู้เข้าร่วมรวม</p>
          <p className="text-2xl font-bold mt-1 text-purple-600">{totalAttendees} คน</p>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3.5">หัวข้อการประชุม</th>
                <th className="px-4 py-3.5">ห้องประชุม</th>
                <th className="px-4 py-3.5">วันเวลาที่ใช้งาน</th>
                <th className="px-4 py-3.5">ผู้จอง & แผนก</th>
                <th className="px-4 py-3.5">ผู้เข้าร่วม</th>
                <th className="px-4 py-3.5">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    ไม่พบข้อมูลการจองตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-sm">
                      {b.title}
                      {b.description && (
                        <p className="text-[11px] text-muted-foreground font-normal line-clamp-1 mt-0.5">
                          {b.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 font-medium">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: b.room.color }}
                        />
                        <span>{b.room.name}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground block ml-4">
                        ชั้น {b.room.floor}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono">
                      <div>{formatThaiDate(b.startTime, "d MMM yyyy")}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {formatThaiTime(b.startTime)} - {formatThaiTime(b.endTime)}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold">{b.user.name}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {b.user.department || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-medium">
                      {b.participantCount} คน
                    </td>
                    <td className="px-4 py-3.5">
                      {b.status === "CONFIRMED" ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          ยืนยันแล้ว
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                          ยกเลิกแล้ว
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
