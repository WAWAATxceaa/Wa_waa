"use client";

import { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  FileText,
  Filter,
  Search,
  Calendar,
  Building2,
  Users,
  Download,
  RefreshCw,
} from "lucide-react";
import { formatThaiDate, formatThaiTime } from "@/lib/date-thai";
import { exportBookingsToExcel } from "@/lib/export-excel";
import { exportBookingsToPDF } from "@/lib/export-pdf";

export function ReportsView() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedRoomId, setSelectedRoomId] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDept, setSelectedDept] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      // ดึงห้องประชุมสำหรับใส่ใน Filter
      const roomsRes = await fetch("/api/rooms");
      const roomsData = await roomsRes.json();
      if (roomsData.success) {
        setRooms(roomsData.data);
      }

      // ดึงรายการจองตาม Filter
      const params = new URLSearchParams();
      if (selectedRoomId !== "all") params.append("roomId", selectedRoomId);
      if (selectedStatus !== "all") params.append("status", selectedStatus);
      if (selectedDept !== "all") params.append("department", selectedDept);
      if (searchQuery) params.append("q", searchQuery);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const bookingsRes = await fetch(`/api/bookings?${params.toString()}`);
      const bookingsData = await bookingsRes.json();
      if (bookingsData.success) {
        setBookings(bookingsData.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedRoomId, selectedStatus, selectedDept, startDate, endDate]);

  // ค้นหารายการแผนกที่ไม่ซ้ำกัน
  const uniqueDepartments = Array.from(
    new Set(bookings.map((b) => b.bookerDepartment).filter(Boolean))
  );

  const handleExportExcel = () => {
    const exportData = bookings.map((b) => ({
      bookingCode: b.bookingCode,
      roomName: b.room?.name || "-",
      roomCode: b.room?.code || "-",
      title: b.title,
      bookerName: b.bookerName,
      bookerDepartment: b.bookerDepartment,
      bookerPhone: b.bookerPhone,
      bookerEmail: b.bookerEmail || "",
      startTime: b.startTime,
      endTime: b.endTime,
      participantCount: b.participantCount,
      status: b.status,
    }));
    exportBookingsToExcel(exportData, "รายงานการจองห้องประชุม");
  };

  const handleExportPDF = () => {
    const exportData = bookings.map((b) => ({
      bookingCode: b.bookingCode,
      roomName: b.room?.name || "-",
      roomCode: b.room?.code || "-",
      title: b.title,
      bookerName: b.bookerName,
      bookerDepartment: b.bookerDepartment,
      bookerPhone: b.bookerPhone,
      bookerEmail: b.bookerEmail || "",
      startTime: b.startTime,
      endTime: b.endTime,
      participantCount: b.participantCount,
      status: b.status,
    }));

    const summaryText = `รายงานการจองห้องประชุม (${
      selectedRoomId === "all" ? "ทุกห้อง" : "เฉพาะห้องที่เลือก"
    })`;
    exportBookingsToPDF(exportData, summaryText);
  };

  return (
    <div className="space-y-6">
      {/* Header and Export Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">
            รายงานและประวัติการจอง (Reports)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ค้นหา กรอง และส่งออกรายงานการใช้ห้องประชุมเป็น Excel หรือ PDF
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={bookings.length === 0}
            className="inline-flex items-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5" />
            ส่งออก Excel (.xlsx)
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            disabled={bookings.length === 0}
            className="inline-flex items-center px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            <FileText className="w-4 h-4 mr-1.5" />
            พิมพ์ / บันทึก PDF
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Room Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ห้องประชุม
            </label>
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="all">🏢 ทุกห้องประชุม</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              แผนก / ฝ่าย
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="all">👥 ทุกแผนก</option>
              {uniqueDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ตั้งแต่วันที่
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ถึงวันที่
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Search input and Status buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="ค้นหาชื่อผู้จอง, รหัส หรือหัวข้อ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchData()}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center space-x-1.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setSelectedStatus("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                selectedStatus === "all"
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              ทั้งหมด
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus("CONFIRMED")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                selectedStatus === "CONFIRMED"
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              ยืนยันแล้ว
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus("CANCELLED")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                selectedStatus === "CANCELLED"
                  ? "bg-rose-600 text-white"
                  : "bg-rose-50 text-rose-700 hover:bg-rose-100"
              }`}
            >
              ยกเลิกแล้ว
            </button>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-sm text-slate-800">
            รายการผลลัพธ์ ({bookings.length} รายการ)
          </span>
          <button
            type="button"
            onClick={fetchData}
            className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            รีเฟรช
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs text-slate-400">กำลังค้นหาข้อมูล...</span>
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            ไม่พบรายการจองตามเงื่อนไขที่กำหนด
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">รหัสการจอง</th>
                  <th className="py-3 px-4">ห้องประชุม</th>
                  <th className="py-3 px-4">หัวข้อการประชุม</th>
                  <th className="py-3 px-4">ผู้จอง / แผนก</th>
                  <th className="py-3 px-4">วัน-เวลา</th>
                  <th className="py-3 px-4 text-center">ผู้เข้าร่วม</th>
                  <th className="py-3 px-4 text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                      {b.bookingCode}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: b.room?.color }}
                        />
                        <span className="font-semibold text-slate-800">
                          {b.room?.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {b.title}
                    </td>
                    <td className="py-3 px-4">
                      <div>{b.bookerName}</div>
                      <span className="text-[11px] text-slate-400">
                        {b.bookerDepartment} • {b.bookerPhone}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-700">
                        {formatThaiDate(b.startTime, "short")}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {formatThaiTime(b.startTime)} - {formatThaiTime(b.endTime)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-semibold">
                      {b.participantCount} คน
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          b.status === "CONFIRMED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {b.status === "CONFIRMED" ? "ยืนยันแล้ว" : "ยกเลิกแล้ว"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
