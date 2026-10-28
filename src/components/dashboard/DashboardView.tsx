import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { useBookingContext } from '../../context/BookingContext';
import { formatThaiDate } from '../../utils/dateUtils';

const GENZ_COLORS = ['#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F59E0B', '#3B82F6'];

export const DashboardView: React.FC = () => {
  const navigate = useNavigate();
  const {
    rooms,
    bookings,
    activeMeetingCount,
    todayBookingCount,
    availableRoomCount,
    upcomingBookings,
    loading,
  } = useBookingContext();

  // Chart 1: Most Popular Rooms (by confirmed booking count)
  const roomStats = useMemo(() => {
    return rooms.map((r) => {
      const count = bookings.filter((b) => b.roomId === r.id && b.status === 'confirmed').length;
      return {
        name: r.name.split(' (')[0], // Short name
        count,
        color: r.color,
      };
    });
  }, [rooms, bookings]);

  // Chart 2: Bookings by Department
  const departmentStats = useMemo(() => {
    const map: Record<string, number> = {};
    bookings
      .filter((b) => b.status === 'confirmed')
      .forEach((b) => {
        const dept = b.department.split(' (')[0];
        map[dept] = (map[dept] || 0) + 1;
      });

    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [bookings]);

  // Chart 3: Peak Booking Hours Distribution (08:00 - 18:00)
  const peakHourStats = useMemo(() => {
    const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    return hours.map((h) => {
      const count = bookings.filter((b) => {
        if (b.status !== 'confirmed') return false;
        return b.startTime <= h && b.endTime > h;
      }).length;
      return { hour: h, count };
    });
  }, [bookings]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-4xl bg-gradient-to-r from-violet-600 via-pink-600 to-cyan-500 p-6 sm:p-10 text-white shadow-2xl shadow-violet-500/20">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Real-time Meeting Space
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-display leading-tight">
              จองห้องประชุมอัจฉริยะ ✨
            </h1>
            <p className="text-violet-100 text-sm sm:text-base mt-1 max-w-xl">
              เลือกห้อง ว่างทันที ไม่ต้องรออนุมัติ พร้อมระบบป้องกันเวลาซ้อนกันและแจ้งเตือนอัตโนมัติ
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/book')}
              className="px-6 py-3.5 rounded-2xl bg-white text-violet-700 font-display font-bold text-sm shadow-lg hover:bg-violet-50 transition-all flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              จองห้องเลย ✨
            </button>
            <button
              onClick={() => navigate('/calendar')}
              className="px-5 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-display font-semibold text-sm transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              ดูปฏิทิน
            </button>
          </div>
        </div>
      </div>

      {/* Bento Grid: 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1 */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-rose-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              ใช้งานอยู่ตอนนี้
            </span>
            <div className="w-9 h-9 rounded-2xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-rose-500 animate-pulse" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black font-display text-slate-900 dark:text-white">
            {activeMeetingCount}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ห้องประชุมที่กำลังมีการใช้งาน
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-emerald-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              ห้องว่างพร้อมใช้
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black font-display text-emerald-600 dark:text-emerald-400">
            {availableRoomCount}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            จากทั้งหมด {rooms.length} ห้อง
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-violet-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              การจองวันนี้
            </span>
            <div className="w-9 h-9 rounded-2xl bg-violet-50 dark:bg-violet-950/50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-violet-600" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black font-display text-violet-600 dark:text-violet-400">
            {todayBookingCount}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            รายการประชุมทั้งหมดของวันนี้
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between text-cyan-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              รอเริ่มวันนี้
            </span>
            <div className="w-9 h-9 rounded-2xl bg-cyan-50 dark:bg-cyan-950/50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-cyan-500" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black font-display text-cyan-600 dark:text-cyan-400">
            {upcomingBookings.length}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            รอบประชุมที่กำลังจะมาถึง
          </p>
        </div>
      </div>

      {/* Live Room Status Grid (Bento Large Item) */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-4xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              สถานะห้องประชุมแบบสด (Live Status)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ไฟเขียว = ว่างพร้อมใช้งาน • ไฟแดง = มีคนกำลังประชุมอยู่
            </p>
          </div>
          <button
            onClick={() => navigate('/book')}
            className="text-xs sm:text-sm font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
          >
            เปิดฟอร์มจอง <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => {
            const isAvailable = room.isAvailableNow && room.status === 'active';
            return (
              <div
                key={room.id}
                className="rounded-3xl p-5 border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/40 relative overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: room.color }}
                      />
                      <span className="font-display font-semibold text-sm text-slate-900 dark:text-white">
                        {room.name}
                      </span>
                    </div>
                    {/* Live Indicator */}
                    {isAvailable ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        🟢 ว่าง
                      </span>
                    ) : room.status !== 'active' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                        ⚙️ ปิดปรับปรุง
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                        🔴 ใช้งานอยู่
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
                    {room.description}
                  </p>

                  {/* Current Active Meeting Info */}
                  {room.currentBooking && (
                    <div className="p-3 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/50 dark:border-rose-900/40 mb-3 text-xs">
                      <div className="font-bold text-rose-800 dark:text-rose-200 line-clamp-1">
                        {room.currentBooking.title}
                      </div>
                      <div className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">
                        โดย {room.currentBooking.bookerName} ({room.currentBooking.startTime} - {room.currentBooking.endTime} น.)
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>ความจุ: {room.capacity} คน</span>
                    <span>• ชั้น {room.floor}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    onClick={() => navigate(`/book?roomId=${room.id}`)}
                    disabled={room.status !== 'active'}
                    className={`w-full py-2.5 px-3 rounded-2xl text-xs font-bold font-display transition-all flex items-center justify-center gap-1.5 ${
                      isAvailable
                        ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {isAvailable ? 'จองห้องนี้ทันที ✨' : 'จองช่วงเวลาอื่น'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Analytics Charts Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Popular Rooms Bar Chart */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-4xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold font-display text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-violet-500" />
            ห้องยอดนิยม (จำนวนครั้งที่ถูกจอง)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roomStats}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" fontSize={11} stroke="#94A3B8" />
                <YAxis allowDecimals={false} fontSize={11} stroke="#94A3B8" />
                <Tooltip
                  contentStyle={{
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
                  }}
                />
                <Bar dataKey="count" name="จำนวนการจอง" radius={[10, 10, 0, 0]}>
                  {roomStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || GENZ_COLORS[index % GENZ_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Bookings by Department Pie Chart */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-4xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold font-display text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <PieIcon className="w-4 h-4 text-pink-500" />
            สัดส่วนการจองแยกตามแผนก
          </h3>
          <div className="h-64 flex items-center justify-center">
            {departmentStats.length === 0 ? (
              <div className="text-slate-400 text-xs">ยังไม่มีข้อมูลการจองในระบบ</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentStats}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={4}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    fontSize={11}
                  >
                    {departmentStats.map((entry, index) => (
                      <Cell key={`cell-dept-${index}`} fill={GENZ_COLORS[index % GENZ_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
