"use client";

import React, { useState, useEffect } from "react";
import { RoomItem } from "@/types";
import { RoomCard } from "@/components/rooms/RoomCard";
import { RoomFormModal } from "@/components/rooms/RoomFormModal";
import { Plus, Shield, RefreshCw } from "lucide-react";
import { useSession } from "next-auth/react";

export default function AdminRoomsPage() {
  const { data: session } = useSession();
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedRoomToEdit, setSelectedRoomToEdit] = useState<RoomItem | null>(null);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/rooms?availability=false");
      if (res.ok) {
        const data = await res.json();
        setRooms(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCreateRoom = () => {
    setSelectedRoomToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleEditRoom = (room: RoomItem) => {
    setSelectedRoomToEdit(room);
    setIsFormModalOpen(true);
  };

  const handleDeleteRoom = async (room: RoomItem) => {
    if (!confirm(`คุณต้องการลบห้อง "${room.name}" ใช่หรือไม่? (การจองที่เกี่ยวข้องจะถูกลบด้วย)`)) {
      return;
    }

    try {
      const res = await fetch(`/api/rooms/${room.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchRooms();
      } else {
        alert("ไม่สามารถลบห้องประชุมได้");
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

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
            จัดการห้องประชุม (Room Management)
          </h1>
          <p className="text-xs text-muted-foreground">
            เพิ่มห้องประชุมใหม่ แก้ไขสิ่งอำนวยความสะดวก ปิดปรับปรุง หรือปรับเปลี่ยนสถานะ
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchRooms}
            disabled={loading}
            className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleCreateRoom}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มห้องประชุมใหม่</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            isAdmin={true}
            onEdit={handleEditRoom}
            onDelete={handleDeleteRoom}
          />
        ))}
      </div>

      <RoomFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={fetchRooms}
        roomToEdit={selectedRoomToEdit}
      />
    </div>
  );
}
