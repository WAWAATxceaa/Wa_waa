import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  User,
  Users,
  Plus,
  Filter,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useBookingContext } from '../../context/BookingContext';
import { formatThaiDate, getTodayString, toBuddhistYear } from '../../utils/dateUtils';
import { Booking } from '../../types';

type ViewMode = 'month' | 'week' | 'day';

export const CalendarView: React.FC = () => {
  const navigate = useNavigate();
  const { rooms, bookings } = useBookingContext();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (b.status !== 'confirmed') return false;
      if (selectedRoomFilter !== 'all' && b.roomId !== selectedRoomFilter) return false;
      return true;
    });
  }, [bookings, selectedRoomFilter]);

  // Navigation handlers
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') {
      d.setMonth(d.getMonth() - 1);
    } else if (viewMode === 'week') {
      d.setDate(d.getDate() - 7);
    } else {
      d.setDate(d.getDate() - 1);
    }
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') {
      d.setMonth(d.getMonth() + 1);
    } else if (viewMode === 'week') {
      d.setDate(d.getDate() + 7);
    } else {
      d.setDate(d.getDate() + 1);
    }
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Month Matrix Generator
  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startingDayOfWeek = firstDay.getDay(); // 0 is Sunday
    const daysInMonth = lastDay.getDate();

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Prev month days padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const pDay = prevMonthLastDay - i;
      const prevDate = new Date(year, month - 1, pDay);
      days.push({
        dateStr: prevDate.toISOString().split('T')[0],
        dayNum: pDay,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const curDate = new Date(year, month, i);
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(i).padStart(2, '0');
      days.push({
        dateStr: `${year}-${mStr}-${dStr}`,
        dayNum: i,
        isCurrentMonth: true,
      });
    }

    // Next month days padding to fill 35 or 42 slots
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nDate = new Date(year, month + 1, i);
      days.push({
        dateStr: nDate.toISOString().split('T')[0],
        dayNum: i,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentDate]);

  const todayStr = getTodayString();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display bg-gradient-to-r from-violet-600 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
            ปฏิทินการใช้ห้องประชุม 📅
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            คลิกที่ช่องว่างวันใดก็ได้เพื่อเปิดฟอร์มจองทันที ✨
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Room Filter Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs shadow-sm">
            <Filter className="w-3.5 h-3.5 text-violet-500" />
            <select
              value={selectedRoomFilter}
              onChange={(e) => setSelectedRoomFilter(e.target.value)}
              className="bg-transparent outline-none text-slate-700 dark:text-slate-200 cursor-pointer font-medium"
            >
              <option value="all">ทุกห้องประชุม</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            {(['month', 'week', 'day'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-display capitalize transition-all ${
                  viewMode === mode
                    ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {mode === 'month' ? 'เดือน' : mode === 'week' ? 'สัปดาห์' : 'วัน'}
              </button>
            ))}
          </div>

          <button
            onClick={() => navigate('/book')}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-violet-600 via-pink-500 to-cyan-400 text-white font-display font-bold text-xs shadow-md shadow-pink-500/20 hover:opacity-95 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            จองห้อง
          </button>
        </div>
      </div>

      {/* Date Navigation Bar */}
      <div className="flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            วันนี้
          </button>
        </div>

        <h2 className="text-base sm:text-lg font-bold font-display text-slate-900 dark:text-white">
          {formatThaiDate(currentDate, { includeDay: false, includeYear: true })}
        </h2>

        {/* Legend */}
        <div className="hidden md:flex items-center gap-3 text-xs">
          {rooms.slice(0, 4).map((r) => (
            <div key={r.id} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
              <span className="text-slate-600 dark:text-slate-400 truncate max-w-[100px]">
                {r.name.split(' (')[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Grid - Month View */}
      {viewMode === 'month' && (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-4xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 text-center py-3 bg-slate-50/50 dark:bg-slate-800/30 text-xs font-bold font-display text-slate-600 dark:text-slate-400">
            <span>อา.</span>
            <span>จ.</span>
            <span>อ.</span>
            <span>พ.</span>
            <span>พฤ.</span>
            <span>ศ.</span>
            <span>ส.</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800/60">
            {monthData.map((day, idx) => {
              const dayBookings = filteredBookings.filter((b) => b.date === day.dateStr);
              const isToday = day.dateStr === todayStr;

              return (
                <div
                  key={idx}
                  onClick={() => navigate(`/book?date=${day.dateStr}`)}
                  className={`min-h-[110px] sm:min-h-[130px] p-2 flex flex-col justify-between transition-colors cursor-pointer group ${
                    day.isCurrentMonth
                      ? 'bg-white dark:bg-slate-900/40 hover:bg-violet-50/40 dark:hover:bg-slate-800/50'
                      : 'bg-slate-50/40 dark:bg-slate-950/40 text-slate-400 dark:text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold font-display w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-gradient-to-r from-violet-600 to-pink-500 text-white shadow-sm'
                          : ''
                      }`}
                    >
                      {day.dayNum}
                    </span>
                    <Plus className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-violet-600 transition-opacity" />
                  </div>

                  {/* Booking Events inside this day */}
                  <div className="flex-1 space-y-1 overflow-y-auto max-h-[80px]">
                    {dayBookings.slice(0, 3).map((b) => (
                      <div
                        key={b.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBooking(b);
                        }}
                        style={{
                          borderLeftColor: b.roomColor || '#8B5CF6',
                        }}
                        className="text-[10px] p-1 rounded-md bg-slate-100 dark:bg-slate-800 border-l-2 text-slate-800 dark:text-slate-200 truncate hover:scale-[1.02] transition-transform font-medium"
                      >
                        <span className="font-bold">{b.startTime}</span> {b.title}
                      </div>
                    ))}
                    {dayBookings.length > 3 && (
                      <div className="text-[9px] text-violet-600 dark:text-violet-400 font-bold pl-1">
                        +{dayBookings.length - 3} รายการเพิ่มเติม
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week / Day View List */}
      {(viewMode === 'week' || viewMode === 'day') && (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-4xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-display font-bold text-sm text-slate-700 dark:text-slate-300">
            รายการประชุม ({filteredBookings.length} รายการที่ตรงกับเงื่อนไข)
          </h3>
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              ไม่มีการจองห้องในช่วงนี้ สามารถคลิกปุ่ม &quot;จองห้อง&quot; เพื่อสร้างการจองใหม่ได้เลย ✨
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredBookings.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBooking(b)}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-violet-400 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="w-3.5 h-3.5 rounded-full mt-1 shrink-0"
                      style={{ backgroundColor: b.roomColor || '#8B5CF6' }}
                    />
                    <div>
                      <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                        {b.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span>🏢 {b.roomName}</span>
                        <span>📅 {formatThaiDate(b.date)}</span>
                        <span>⏰ {b.startTime} - {b.endTime} น.</span>
                        <span>👤 {b.bookerName} ({b.department})</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
                      #{b.bookingCode}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-4xl p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: selectedBooking.roomColor || '#8B5CF6' }}
              />
              <span className="text-xs font-bold text-violet-600 dark:text-violet-400 font-mono">
                #{selectedBooking.bookingCode}
              </span>
            </div>

            <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-2">
              {selectedBooking.title}
            </h3>

            {selectedBooking.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl">
                {selectedBooking.description}
              </p>
            )}

            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 mb-6">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">ห้องประชุม:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedBooking.roomName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">วันที่:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formatThaiDate(selectedBooking.date)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">เวลา:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedBooking.startTime} - {selectedBooking.endTime} น.</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">ผู้จอง:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedBooking.bookerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">แผนก:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedBooking.department}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">ผู้เข้าร่วม:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedBooking.participantCount} คน</span>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => {
                  const code = selectedBooking.bookingCode;
                  setSelectedBooking(null);
                  navigate(`/manage/${code}`);
                }}
                className="flex-1 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-violet-600 via-pink-500 to-cyan-400 text-white font-display text-xs font-bold shadow-md hover:opacity-95"
              >
                จัดการการจองนี้ (แก้ไข/ยกเลิก)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
