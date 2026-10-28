"use client";

import React, { useState } from "react";
import { X, Calendar, Clock, MapPin, Users, User, Trash2, AlertTriangle } from "lucide-react";
import { BookingItem } from "@/types";
import { formatThaiDateRange } from "@/lib/timezone";
import { useSession } from "next-auth/react";

interface BookingDetailModalProps {
  booking: BookingItem | null;
  isOpen: boolean;
  onClose: () => void;
  onCancelled: () => void;
}

export function BookingDetailModal({
  booking,
  isOpen,
  onClose,
  onCancelled,
}: BookingDetailModalProps) {
  const { data: session } = useSession();
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState("");
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !booking) return null;

  const isOwner = session?.user?.id === booking.userId;
  const isAdmin = session?.user?.role === "ADMIN";
  const canCancel = (isOwner || isAdmin) && booking.status === "CONFIRMED";

  const handleCancelBooking = async () => {
    setCancelling(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "ไม่สามารถยกเลิกการจองได้");
        setCancelling(false);
        return;
      }

      onCancelled();
      onClose();
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in-0">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl text-card-foreground">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span
              className="w-3.5 h-3.5 rounded-full shrink-0"
              style={{ backgroundColor: booking.room.color }}
            />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              รายละเอียดการจอง
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-4 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">{booking.title}</h3>
            {booking.status === "CANCELLED" && (
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400 text-xs font-medium">
                ยกเลิกแล้ว {booking.cancelledReason ? `(${booking.cancelledReason})` : ""}
              </span>
            )}
          </div>

          <div className="space-y-2.5 text-sm">
            <div className="flex items-center gap-3 text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span>
                <strong className="text-foreground">{booking.room.name}</strong> (ชั้น {booking.room.floor})
              </span>
            </div>

            <div className="flex items-center gap-3 text-muted-foreground">
              <Clock className="w-4 h-4 text-primary shrink-0" />
              <span>{formatThaiDateRange(booking.startTime, booking.endTime)}</span>
            </div>

            <div className="flex items-center gap-3 text-muted-foreground">
              <User className="w-4 h-4 text-primary shrink-0" />
              <span>
                ผู้จอง: <strong className="text-foreground">{booking.user.name}</strong>{" "}
                {booking.user.department ? `(${booking.user.department})` : ""}
              </span>
            </div>

            <div className="flex items-center gap-3 text-muted-foreground">
              <Users className="w-4 h-4 text-primary shrink-0" />
              <span>
                ผู้เข้าร่วม: <strong className="text-foreground">{booking.participantCount} คน</strong>{" "}
                {booking.participantsNote ? `• ${booking.participantsNote}` : ""}
              </span>
            </div>
          </div>

          {booking.description && (
            <div className="p-3 rounded-xl bg-muted/50 text-xs text-muted-foreground border border-border">
              <span className="font-semibold block text-foreground mb-1">วาระ / รายละเอียด:</span>
              {booking.description}
            </div>
          )}

          {/* Cancellation section */}
          {canCancel && !showConfirmCancel && (
            <div className="pt-3 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => setShowConfirmCancel(true)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-destructive hover:bg-destructive/10 border border-destructive/20 flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ยกเลิกการจองนี้</span>
              </button>
            </div>
          )}

          {canCancel && showConfirmCancel && (
            <div className="mt-3 p-3.5 rounded-xl border border-destructive/30 bg-destructive/5 space-y-3">
              <p className="text-xs font-medium text-destructive">
                คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการจองนี้?
              </p>
              <input
                type="text"
                placeholder="ระบุเหตุผลการยกเลิก (ไม่บังคับ)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmCancel(false)}
                  disabled={cancelling}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs"
                >
                  ย้อนกลับ
                </button>
                <button
                  type="button"
                  onClick={handleCancelBooking}
                  disabled={cancelling}
                  className="px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-xs font-medium hover:bg-destructive/90"
                >
                  {cancelling ? "กำลังยกเลิก..." : "ยืนยันยกเลิก"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
