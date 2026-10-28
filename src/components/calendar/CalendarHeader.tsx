"use client";

import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Filter,
} from "lucide-react";
import {
  formatThaiDate,
  toBuddhistYear,
  getThaiMonthName,
} from "@/lib/date-thai";

interface CalendarHeaderProps {
  currentDate: Date;
  view: "day" | "week" | "month";
  onViewChange: (view: "day" | "week" | "month") => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  rooms: Array<{ id: string; name: string; color: string }>;
  selectedRoomId: string;
  onRoomSelect: (roomId: string) => void;
}

export function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onPrev,
  onNext,
  onToday,
  rooms,
  selectedRoomId,
  onRoomSelect,
}: CalendarHeaderProps) {
  // สร้างข้อความหัวเรื่องวันที่ตามมุมมอง
  const getHeaderTitle = () => {
    if (view === "day") {
      return formatThaiDate(currentDate, "medium");
    }
    if (view === "month") {
      const monthName = getThaiMonthName(currentDate.getMonth());
      const yearBE = toBuddhistYear(currentDate);
      return `${monthName} พ.ศ. ${yearBE}`;
    }
    // Week view
    const weekStart = new Date(currentDate);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1); // Monday
    weekStart.setDate(diff);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return `${formatThaiDate(weekStart, "short")} - ${formatThaiDate(
      weekEnd,
      "short"
    )}`;
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Date Navigation & Title */}
      <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={onPrev}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
            title="ก่อนหน้า"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={onToday}
            className="px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-white rounded-lg transition-colors"
          >
            วันนี้
          </button>
          <button
            type="button"
            onClick={onNext}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
            title="ถัดไป"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center">
          <CalendarIcon className="w-5 h-5 mr-2 text-indigo-600 hidden sm:inline" />
          {getHeaderTitle()}
        </h2>
      </div>

      {/* Filters and View Switcher */}
      <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
        {/* Room Filter */}
        <div className="relative min-w-[150px]">
          <select
            value={selectedRoomId}
            onChange={(e) => onRoomSelect(e.target.value)}
            className="w-full text-xs font-medium pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none text-slate-700 cursor-pointer"
          >
            <option value="all">🏢 ทุกห้องประชุม</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                ● {r.name}
              </option>
            ))}
          </select>
          <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
        </div>

        {/* View Switch Buttons */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => onViewChange("day")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              view === "day"
                ? "bg-white text-indigo-600 shadow-sm"
                : "hover:text-slate-900"
            }`}
          >
            วัน
          </button>
          <button
            type="button"
            onClick={() => onViewChange("week")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              view === "week"
                ? "bg-white text-indigo-600 shadow-sm"
                : "hover:text-slate-900"
            }`}
          >
            สัปดาห์
          </button>
          <button
            type="button"
            onClick={() => onViewChange("month")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              view === "month"
                ? "bg-white text-indigo-600 shadow-sm"
                : "hover:text-slate-900"
            }`}
          >
            เดือน
          </button>
        </div>
      </div>
    </div>
  );
}
