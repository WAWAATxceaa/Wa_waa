import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  FileDown,
  Search,
  Filter,
  ArrowUpDown,
  Building2,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useBookingContext } from '../../context/BookingContext';
import { formatThaiDate } from '../../utils/dateUtils';
import { exportToExcel, exportToPDF } from '../../services/exportService';
import { DEPARTMENTS } from '../../config/constants';
import { Booking } from '../../types';

export const ReportsView: React.FC = () => {
  const { rooms, bookings, addToast } = useBookingContext();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roomFilter, setRoomFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Sorting
  const [sortField, setSortField] = useState<'date' | 'title' | 'roomName' | 'bookerName'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filtered & Sorted Data
  const filteredBookings = useMemo(() => {
    return bookings
      .filter((b) => {
        if (roomFilter !== 'all' && b.roomId !== roomFilter) return false;
        if (departmentFilter !== 'all' && b.department !== departmentFilter) return false;
        if (statusFilter !== 'all' && b.status !== statusFilter) return false;
        if (startDate && b.date < startDate) return false;
        if (endDate && b.date > endDate) return false;

        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchCode = b.bookingCode.toLowerCase().includes(q);
          const matchTitle = b.title.toLowerCase().includes(q);
          const matchBooker = b.bookerName.toLowerCase().includes(q);
          const matchRoom = b.roomName.toLowerCase().includes(q);
          const matchDept = b.department.toLowerCase().includes(q);
          if (!matchCode && !matchTitle && !matchBooker && !matchRoom && !matchDept) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        let valA = a[sortField] || '';
        let valB = b[sortField] || '';
        if (sortField === 'date') {
          valA = `${a.date} ${a.startTime}`;
          valB = `${b.date} ${b.startTime}`;
        }
        const cmp = valA.localeCompare(valB);
        return sortOrder === 'asc' ? cmp : -cmp;
      });
  }, [bookings, roomFilter, departmentFilter, statusFilter, startDate, endDate, searchTerm, sortField, sortOrder]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleExportExcel = () => {
    if (filteredBookings.length === 0) {
      addToast('warning', 'ไม่มีข้อมูล', 'ไม่มีรายการที่ตรงกับเงื่อนไขการส่งออก');
      return;
    }
    try {
      exportToExcel(filteredBookings, `meeting-bookings-${new Date().toISOString().split('T')[0]}.xlsx`);
      addToast('success', 'ส่งออก Excel สำเร็จ! 📊', `ดาวน์โหลด ${filteredBookings.length} รายการแล้ว`);
    } catch (e: any) {
      addToast('error', 'ส่งออกล้มเหลว', e.message);
    }
  };

  const handleExportPDF = () => {
    if (filteredBookings.length === 0) {
      addToast('warning', 'ไม่มีข้อมูล', 'ไม่มีรายการที่ตรงกับเงื่อนไขการส่งออก');
      return;
    }
    try {
      exportToPDF(filteredBookings);
      addToast('success', 'ส่งออก PDF สำเร็จ! 📑', `ดาวน์โหลดรายงาน PDF เรียบร้อย`);
    } catch (e: any) {
      addToast('error', 'ส่งออกล้มเหลว', e.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header and Export Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display bg-gradient-to-r from-violet-600 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
            รายงานและประวัติการจอง 📊
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            ค้นหา กรองข้อมูล และส่งออกรายงานในรูปแบบ Excel หรือ PDF
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-semibold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            ส่งออก Excel
          </button>
          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 hover:opacity-95 text-white font-display font-semibold text-xs shadow-md shadow-violet-500/20 flex items-center gap-2 transition-all"
          >
            <FileDown className="w-4 h-4" />
            ส่งออก PDF
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาด้วยรหัส, ชื่อหัวข้อ, ผู้จอง, หรือแผนก..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        {/* Dropdowns Filter Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Room Filter */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1">
              ห้องประชุม
            </label>
            <select
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
            >
              <option value="all">ทุกห้อง</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1">
              แผนก
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
            >
              <option value="all">ทุกแผนก</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1">
              สถานะ
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="confirmed">ยืนยันแล้ว</option>
              <option value="cancelled">ยกเลิกแล้ว</option>
            </select>
          </div>

          {/* Date range shortcut */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1">
              ช่วงวันที่
            </label>
            <div className="flex gap-1">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-1/2 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[10px] sm:text-xs outline-none"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-1/2 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[10px] sm:text-xs outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-4xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-display font-semibold text-slate-600 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th
                  onClick={() => toggleSort('title')}
                  className="py-3 px-4 cursor-pointer hover:text-violet-600"
                >
                  <div className="flex items-center gap-1">
                    หัวข้อการประชุม
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('roomName')}
                  className="py-3 px-4 cursor-pointer hover:text-violet-600"
                >
                  <div className="flex items-center gap-1">
                    ห้องประชุม
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('date')}
                  className="py-3 px-4 cursor-pointer hover:text-violet-600"
                >
                  <div className="flex items-center gap-1">
                    วันและเวลา
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('bookerName')}
                  className="py-3 px-4 cursor-pointer hover:text-violet-600"
                >
                  <div className="flex items-center gap-1">
                    ผู้จอง / แผนก
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    ไม่พบข้อมูลการจองตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-violet-600 dark:text-violet-400">
                      {b.bookingCode}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white max-w-[200px] truncate">
                      {b.title}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: b.roomColor || '#8B5CF6' }}
                        />
                        <span>{b.roomName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div>{formatThaiDate(b.date, { short: true })}</div>
                      <div className="text-[11px] text-slate-400">
                        {b.startTime} - {b.endTime} น.
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div>{b.bookerName}</div>
                      <div className="text-[11px] text-slate-400">{b.department}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {b.status === 'confirmed' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" /> ยืนยันแล้ว
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                          <XCircle className="w-3 h-3" /> ยกเลิก
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary */}
        <div className="px-5 py-3 bg-slate-50/50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>แสดง {filteredBookings.length} จากทั้งหมด {bookings.length} รายการ</span>
        </div>
      </div>
    </div>
  );
};
