"use client";

import React, { useState } from "react";
import { RoomItem } from "@/types";
import { Users, Building, Plus, Clock, AlertCircle } from "lucide-react";
import { BookingModal } from "@/components/calendar/BookingModal";
import { formatThaiTime } from "@/lib/timezone";

interface RoomStatusGridProps {
  rooms: RoomItem[];
  onRefresh: () => void;
}

export function RoomStatusGrid({ rooms, onRefresh }: RoomStatusGridProps) {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBookRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-foreground">สถานะห้องประชุมแบบเรียลไทม์</h2>
          <p className="text-xs text-muted-foreground">
            ตรวจดูห้องที่พร้อมใช้งานทันที และข้อมูลการใช้งานขณะนี้
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => {
          const isAvailable = room.isAvailableNow;
          const isMaintenance = room.status === "MAINTENANCE";
          const isInactive = room.status === "INACTIVE";

          return (
            <div
              key={room.id}
              className="group relative rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header: Room Name & Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: room.color }}
                    />
                    <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                      {room.name}
                    </h3>
                  </div>

                  {isMaintenance ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      <AlertCircle className="w-3 h-3" /> ปิดปรับปรุง
                    </span>
                  ) : isInactive ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20">
                      ปิดใช้งาน
                    </span>
                  ) : isAvailable ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      ว่างพร้อมใช้งาน
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      กำลังใช้งาน
                    </span>
                  )}
                </div>

                {/* Sub details: Floor, Capacity */}
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5" /> ชั้น {room.floor}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> ความจุ {room.capacity} ที่นั่ง
                  </span>
                </div>

                {/* Description */}
                {room.description && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    {room.description}
                  </p>
                )}

                {/* Current Meeting Banner if in use */}
                {!isAvailable && room.currentBooking && (
                  <div className="mt-3 p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 text-xs space-y-1">
                    <p className="font-semibold text-rose-700 dark:text-rose-400 truncate">
                      {room.currentBooking.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3 text-rose-500" />
                      ถึงเวลา {formatThaiTime(room.currentBooking.endTime)} โดย {room.currentBooking.userName}
                    </p>
                  </div>
                )}

                {/* Amenities Badges */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {room.amenities.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-muted text-[10px] text-muted-foreground font-medium"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  {isAvailable ? "จองเพื่อใช้งานด่วน" : "ดูตารางในปฏิทิน"}
                </span>

                <button
                  type="button"
                  onClick={() => handleBookRoom(room.id)}
                  disabled={!isAvailable}
                  className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>จองห้องนี้</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={onRefresh}
        initialRoomId={selectedRoomId || undefined}
      />
    </div>
  );
}
