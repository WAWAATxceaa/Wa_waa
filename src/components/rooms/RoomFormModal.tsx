"use client";

import React, { useState, useEffect } from "react";
import { X, Building, Users, Palette, Check, AlertCircle } from "lucide-react";
import { RoomItem } from "@/types";

interface RoomFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  roomToEdit?: RoomItem | null;
}

const COMMON_AMENITIES = [
  "โปรเจกเตอร์ 4K",
  "ระบบ Video Conference",
  "ไวท์บอร์ดอัจฉริยะ",
  "Smart TV 65-75\"",
  "ไมโครโฟนไร้สาย",
  "ระบบเสียงรอบทิศทาง",
  "ปลั๊กไฟตั้งโต๊ะรอบทิศ",
  "ชุดโซฟาพักผ่อน",
];

const PRESET_COLORS = [
  "#2563eb", // Blue
  "#10b981", // Emerald
  "#8b5cf6", // Purple
  "#f59e0b", // Amber
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#f97316", // Orange
  "#64748b", // Slate
];

export function RoomFormModal({
  isOpen,
  onClose,
  onSuccess,
  roomToEdit,
}: RoomFormModalProps) {
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(10);
  const [floor, setFloor] = useState(1);
  const [description, setDescription] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE" | "MAINTENANCE">("ACTIVE");
  const [imageUrl, setImageUrl] = useState("");
  const [color, setColor] = useState("#2563eb");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (roomToEdit) {
      setName(roomToEdit.name);
      setCapacity(roomToEdit.capacity);
      setFloor(roomToEdit.floor);
      setDescription(roomToEdit.description || "");
      setAmenities(roomToEdit.amenities || []);
      setStatus(roomToEdit.status);
      setImageUrl(roomToEdit.imageUrl || "");
      setColor(roomToEdit.color || "#2563eb");
    } else {
      setName("");
      setCapacity(8);
      setFloor(2);
      setDescription("");
      setAmenities(["โปรเจกเตอร์ 4K", "ไวท์บอร์ดอัจฉริยะ"]);
      setStatus("ACTIVE");
      setImageUrl("");
      setColor("#2563eb");
    }
    setError(null);
  }, [roomToEdit, isOpen]);

  if (!isOpen) return null;

  const toggleAmenity = (item: string) => {
    setAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = roomToEdit ? `/api/rooms/${roomToEdit.id}` : "/api/rooms";
      const method = roomToEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          capacity,
          floor,
          description,
          amenities,
          status,
          imageUrl: imageUrl || null,
          color,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "ไม่สามารถบันทึกข้อมูลห้องประชุมได้");
        setLoading(false);
        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in-0">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl text-card-foreground max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {roomToEdit ? "แก้ไขข้อมูลห้องประชุม" : "เพิ่มห้องประชุมใหม่"}
              </h2>
              <p className="text-xs text-muted-foreground">
                กำหนดชื่อ ความจุ อุปกรณ์ประจำห้อง และสถานะการใช้งาน
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Room Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              ชื่อห้องประชุม <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น ห้องประชุมสัตตบรรณ (Boardroom A)"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Floor & Capacity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                ชั้นที่ตั้ง <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="99"
                value={floor}
                onChange={(e) => setFloor(Number(e.target.value))}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                ความจุ (คน) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Status & Color */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                สถานะการใช้งาน
              </label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ACTIVE">เปิดใช้งานปกติ (Active)</option>
                <option value="MAINTENANCE">ปิดปรับปรุงชั่วคราว (Maintenance)</option>
                <option value="INACTIVE">ปิดใช้งาน (Inactive)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                สีแสดงผลบนปฏิทิน
              </label>
              <div className="flex items-center gap-1.5 pt-1">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                    style={{ backgroundColor: c }}
                  >
                    {color === c && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Amenities Multi-select */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              อุปกรณ์และสิ่งอำนวยความสะดวก
            </label>
            <div className="grid grid-cols-2 gap-2">
              {COMMON_AMENITIES.map((item) => {
                const checked = amenities.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleAmenity(item)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium text-left border transition-all flex items-center justify-between ${
                      checked
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <span>{item}</span>
                    {checked && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              URL รูปภาพห้องประชุม (ไม่บังคับ)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              รายละเอียด / หมายเหตุ
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ข้อมูลเพิ่มเติม เช่น เงื่อนไขการขอใช้ หรือตำแหน่งห้อง..."
              className="w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? "กำลังบันทึก..." : roomToEdit ? "บันทึกการแก้ไข" : "สร้างห้องประชุม"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
