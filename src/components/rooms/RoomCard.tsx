"use client";

import React from "react";
import { RoomItem } from "@/types";
import { Building, Users, Edit3, Trash2, CalendarPlus, AlertCircle } from "lucide-react";

interface RoomCardProps {
  room: RoomItem;
  isAdmin?: boolean;
  onEdit?: (room: RoomItem) => void;
  onDelete?: (room: RoomItem) => void;
  onBook?: (roomId: string) => void;
}

export function RoomCard({ room, isAdmin, onEdit, onDelete, onBook }: RoomCardProps) {
  const isMaintenance = room.status === "MAINTENANCE";
  const isInactive = room.status === "INACTIVE";
  const isActive = room.status === "ACTIVE";

  return (
    <div className="group rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Room Image or Colored Banner */}
        <div className="relative h-44 w-full bg-muted overflow-hidden">
          {room.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={room.imageUrl}
              alt={room.name}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div
              className="h-full w-full flex items-center justify-center text-white/90 font-bold text-2xl"
              style={{ backgroundColor: room.color || "#3b82f6" }}
            >
              {room.name.slice(0, 2)}
            </div>
          )}

          {/* Color tag & Status Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span
              className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: room.color }}
            />
          </div>

          <div className="absolute top-3 right-3">
            {isMaintenance ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500 text-white shadow-sm flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> ปิดปรับปรุง
              </span>
            ) : isInactive ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-zinc-600 text-white shadow-sm">
                ปิดใช้งาน
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-600 text-white shadow-sm">
                เปิดใช้งาน
              </span>
            )}
          </div>
        </div>

        {/* Room Body */}
        <div className="p-5">
          <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
            {room.name}
          </h3>

          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium">
              <Building className="w-4 h-4 text-primary" /> ชั้น {room.floor}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Users className="w-4 h-4 text-primary" /> จุได้ {room.capacity} ที่นั่ง
            </span>
          </div>

          {room.description && (
            <p className="text-xs text-muted-foreground mt-2.5 line-clamp-2">
              {room.description}
            </p>
          )}

          {/* Amenities */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {room.amenities.map((item, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-muted text-[11px] text-muted-foreground font-medium"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-5 pt-0 flex items-center justify-between border-t border-border mt-3 pt-3">
        {isAdmin ? (
          <div className="flex items-center gap-2 w-full justify-end">
            <button
              onClick={() => onEdit?.(room)}
              className="px-3 py-1.5 rounded-xl border border-border text-xs font-medium hover:bg-muted text-foreground flex items-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>แก้ไข</span>
            </button>
            <button
              onClick={() => onDelete?.(room)}
              className="px-3 py-1.5 rounded-xl border border-destructive/20 text-xs font-medium text-destructive hover:bg-destructive/10 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ลบ</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-muted-foreground">
              {isActive ? "ว่างสำหรับการจอง" : "ไม่สามารถจองได้"}
            </span>
            <button
              onClick={() => onBook?.(room.id)}
              disabled={!isActive}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>จองห้องนี้</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
