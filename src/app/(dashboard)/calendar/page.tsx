"use client";

import React from "react";
import { BookingCalendar } from "@/components/calendar/BookingCalendar";

export default function CalendarPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          ปฏิทินการจองห้องประชุม
        </h1>
        <p className="text-xs text-muted-foreground">
          คลิกหรือลากช่องเวลาว่างเพื่อจองห้องประชุมทันที หรือคลิกที่แถบรายการเพื่อดูรายละเอียด
        </p>
      </div>

      <BookingCalendar />
    </div>
  );
}
