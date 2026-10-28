"use client";

import React, { useState } from "react";
import { BookingItem } from "@/types";
import { formatThaiDate, formatThaiTime } from "@/lib/timezone";
import { Clock, MapPin, Trash2, Users, AlertCircle, CheckCircle2 } from "lucide-react";
import { useSession } from "next-auth/react";

interface BookingTableProps {
  bookings: BookingItem[];
  onRefresh: () => void;
  isAdminView?: boolean;
}

export function BookingTable({ bookings, onRefresh, isAdminView = false }: BookingTableProps) {
  const { data: session } = useSession();
  const [filterTab, setFilterTab] = useState<"all" | "upcoming" | "past" | "cancelled">("all");
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<BookingItem | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();

  const filteredBookings = bookings.filter((b) => {
    const end = new Date(b.endTime);
    if (filterTab === "cancelled") return b.status === "CANCELLED";
    if (filterTab === "upcoming") return b.status === "CONFIRMED" && end >= now;
    if (filterTab === "past") return b.status === "CONFIRMED" && end < now;
    return true;
  });

  const handleConfirmCancel = async () => {
    if (!selectedBookingForCancel) return;
    setCancelling(true);
    setError(null);

    try {
      const res = await fetch(`/api/bookings/${selectedBookingForCancel.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "ไม่สามารถยกเลิกการจองได้");
        setCancelling(false);
        return;
      }

      setSelectedBookingForCancel(null);
      setCancelReason("");
      onRefresh();
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto">
        <button
          onClick={() => setFilterTab("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filterTab === "all"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          ทั้งหมด ({bookings.length})
        </button>
        <button
          onClick={() => setFilterTab("upcoming")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filterTab === "upcoming"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          ที่จะมาถึง ({bookings.filter((b) => b.status === "CONFIRMED" && new Date(b.endTime) >= now).length})
        </button>
        <button
          onClick={() => setFilterTab("past")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filterTab === "past"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          ประวัติที่ผ่านมา ({bookings.filter((b) => b.status === "CONFIRMED" && new Date(b.endTime) < now).length})
        </button>
        <button
          onClick={() => setFilterTab("cancelled")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filterTab === "cancelled"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          ยกเลิกแล้ว ({bookings.filter((b) => b.status === "CANCELLED").length})
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3.5">หัวข้อการประชุม</th>
                <th className="px-4 py-3.5">ห้องประชุม</th>
                <th className="px-4 py-3.5">วันที่ & เวลา</th>
                {isAdminView && <th className="px-4 py-3.5">ผู้จอง</th>}
                <th className="px-4 py-3.5">ผู้เข้าร่วม</th>
                <th className="px-4 py-3.5">สถานะ</th>
                <th className="px-4 py-3.5 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAdminView ? 7 : 6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    ไม่พบรายการจองห้องประชุม
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const isOwner = session?.user?.id === b.userId;
                  const isAdmin = session?.user?.role === "ADMIN";
                  const canCancel = (isOwner || isAdmin) && b.status === "CONFIRMED";

                  return (
                    <tr key={b.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3.5 font-semibold text-sm">
                        <div>{b.title}</div>
                        {b.description && (
                          <div className="text-[11px] text-muted-foreground font-normal line-clamp-1 mt-0.5">
                            {b.description}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 font-medium">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: b.room.color }}
                          />
                          <span>{b.room.name}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground block ml-4">
                          ชั้น {b.room.floor}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono">
                        <div className="font-semibold">
                          {formatThaiDate(b.startTime, "d MMM yyyy")}
                        </div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-primary" />
                          <span>
                            {formatThaiTime(b.startTime)} - {formatThaiTime(b.endTime)}
                          </span>
                        </div>
                      </td>
                      {isAdminView && (
                        <td className="px-4 py-3.5">
                          <div className="font-medium">{b.user.name}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {b.user.department || b.user.email}
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 font-medium">
                          <Users className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>{b.participantCount} คน</span>
                        </div>
                        {b.participantsNote && (
                          <div className="text-[10px] text-muted-foreground line-clamp-1">
                            {b.participantsNote}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {b.status === "CONFIRMED" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> ยืนยันแล้ว
                          </span>
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                              <AlertCircle className="w-3 h-3" /> ยกเลิกแล้ว
                            </span>
                            {b.cancelledReason && (
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {b.cancelledReason}
                              </p>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {canCancel ? (
                          <button
                            onClick={() => setSelectedBookingForCancel(b)}
                            className="px-3 py-1.5 rounded-xl border border-destructive/20 text-destructive hover:bg-destructive/10 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>ยกเลิก</span>
                          </button>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      {selectedBookingForCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in-0">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl text-card-foreground">
            <h3 className="text-base font-bold text-destructive flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>ยืนยันการยกเลิกการจองห้องประชุม</span>
            </h3>

            <p className="text-xs text-muted-foreground mt-2">
              คุณกำลังจะยกเลิกการจอง &quot;<strong>{selectedBookingForCancel.title}</strong>&quot; ณ{" "}
              {selectedBookingForCancel.room.name}
            </p>

            {error && (
              <div className="mt-3 p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs">
                {error}
              </div>
            )}

            <div className="mt-4">
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                ระบุเหตุผลในการยกเลิก (ไม่บังคับ)
              </label>
              <input
                type="text"
                placeholder="เช่น เปลี่ยนแปลงเวลา, ติดภารกิจด่วน"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedBookingForCancel(null);
                  setError(null);
                }}
                disabled={cancelling}
                className="px-4 py-2 rounded-xl border border-border text-xs font-medium hover:bg-muted"
              >
                ย้อนกลับ
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="px-4 py-2 rounded-xl bg-destructive text-destructive-foreground text-xs font-semibold hover:bg-destructive/90"
              >
                {cancelling ? "กำลังยกเลิก..." : "ยืนยันยกเลิก"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
