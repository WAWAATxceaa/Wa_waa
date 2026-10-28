"use client";

import React, { useState, useEffect, useCallback } from "react";
import { BookingTable } from "@/components/bookings/BookingTable";
import { BookingItem } from "@/types";
import { useSession } from "next-auth/react";
import { RefreshCw, Plus } from "lucide-react";
import { BookingModal } from "@/components/calendar/BookingModal";

export default function MyBookingsPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchMyBookings = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings?userId=${session.user.id}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchMyBookings();
  }, [fetchMyBookings]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            การจองของฉัน (My Bookings)
          </h1>
          <p className="text-xs text-muted-foreground">
            ตรวจสอบรายการจองห้องประชุมของคุณ ติดตามสถานะ และยกเลิกการจองได้ที่นี่
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchMyBookings}
            disabled={loading}
            className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>จองห้องประชุมใหม่</span>
          </button>
        </div>
      </div>

      <BookingTable
        bookings={bookings}
        onRefresh={fetchMyBookings}
        isAdminView={false}
      />

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchMyBookings}
      />
    </div>
  );
}
