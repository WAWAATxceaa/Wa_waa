"use client";

import React, { useState, useEffect, useCallback } from "react";
import { BookingTable } from "@/components/bookings/BookingTable";
import { BookingItem } from "@/types";
import { useSession } from "next-auth/react";
import { Shield, RefreshCw } from "lucide-react";

export default function AdminBookingsPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bookings");
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllBookings();
  }, [fetchAllBookings]);

  if (session?.user?.role !== "ADMIN") {
    return (
      <div className="p-8 text-center text-sm text-destructive">
        สิทธิ์ไม่เพียงพอ หน้านี้สำหรับผู้ดูแลระบบ (Admin) เท่านั้น
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>ส่วนงานผู้ดูแลระบบ</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground mt-0.5">
            รายการจองทั้งหมดในองค์กร (All Bookings)
          </h1>
          <p className="text-xs text-muted-foreground">
            ดูภาพรวมการจองของพนักงานทุกแผนก และสามารถช่วยยกเลิกหรือแก้ไขการจองได้
          </p>
        </div>

        <button
          onClick={fetchAllBookings}
          disabled={loading}
          className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground self-start sm:self-auto"
          title="รีเฟรชข้อมูล"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <BookingTable
        bookings={bookings}
        onRefresh={fetchAllBookings}
        isAdminView={true}
      />
    </div>
  );
}
