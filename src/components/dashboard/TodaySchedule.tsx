"use client";

import React from "react";
import { BookingItem } from "@/types";
import { formatThaiTime } from "@/lib/timezone";
import { Clock, MapPin, Users, CalendarDays } from "lucide-react";
import Link from "next/link";

export function TodaySchedule({ bookings }: { bookings: BookingItem[] }) {
  const now = new Date();

  return (
    <div className="p-5 rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">การประชุมวันนี้</h3>
          <p className="text-xs text-muted-foreground">รายการประชุมทั้งหมดตามลำดับเวลา</p>
        </div>
        <Link
          href="/calendar"
          className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span>ดูบนปฏิทิน</span>
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="py-8 text-center text-xs text-muted-foreground">
          ไม่มีการประชุมสำหรับวันนี้ สามารถคลิกจองห้องว่างได้ทันที
        </div>
      ) : (
        <div className="divide-y divide-border">
          {bookings.map((item) => {
            const start = new Date(item.startTime);
            const end = new Date(item.endTime);
            const isOngoing = now >= start && now <= end;
            const isPast = now > end;

            return (
              <div
                key={item.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-2.5 h-10 rounded-full shrink-0 mt-0.5"
                    style={{ backgroundColor: item.room.color }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">
                        {item.title}
                      </span>
                      {isOngoing && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 text-[10px] font-bold border border-rose-500/20 animate-pulse">
                          กำลังประชุม
                        </span>
                      )}
                      {isPast && (
                        <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px]">
                          เสร็จสิ้นแล้ว
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        {item.room.name}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {item.user.name} ({item.participantCount} คน)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-foreground bg-muted/60 px-3 py-1.5 rounded-xl shrink-0 self-start sm:self-center">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>
                    {formatThaiTime(item.startTime)} - {formatThaiTime(item.endTime)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
