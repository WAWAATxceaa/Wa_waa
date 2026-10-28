"use client";

import { useState, useEffect } from "react";
import {
  DoorOpen,
  Plus,
  Edit2,
  Power,
  Users,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
  Palette,
} from "lucide-react";

export function RoomsManagementView() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [capacity, setCapacity] = useState(10);
  const [location, setLocation] = useState("");
  const [color, setColor] = useState("#4F46E5");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchRooms = async () => {
    try {
      const res = await fetch("/api/rooms");
      const data = await res.json();
      if (data.success) {
        setRooms(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const openCreateModal = () => {
    setEditingRoom(null);
    setName("");
    setCode("");
    setCapacity(10);
    setLocation("");
    setColor("#4F46E5");
    setDescription("");
    setErrorMsg("");
    setModalOpen(true);
  };

  const openEditModal = (room: any) => {
    setEditingRoom(room);
    setName(room.name);
    setCode(room.code);
    setCapacity(room.capacity);
    setLocation(room.location);
    setColor(room.color);
    setDescription(room.description || "");
    setErrorMsg("");
    setModalOpen(true);
  };

  const handleToggleActive = async (room: any) => {
    try {
      const res = await fetch(`/api/rooms/${room.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !room.isActive }),
      });
      if (res.ok) {
        fetchRooms();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    try {
      const url = editingRoom ? `/api/rooms/${editingRoom.id}` : "/api/rooms";
      const method = editingRoom ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          code,
          capacity: Number(capacity),
          location,
          color,
          description,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "เกิดข้อผิดพลาดในการบันทึกห้อง");
      }

      setModalOpen(false);
      fetchRooms();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Room Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">
            จัดการห้องประชุม (Room Management)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            กำหนดความจุ สถานที่ อุปกรณ์ประจำห้อง และเปิด/ปิดสถานะการใช้งาน
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-md shadow-indigo-200 transition-colors"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          เพิ่มห้องประชุมใหม่
        </button>
      </div>

      {/* Room Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span className="text-xs text-slate-400">กำลังโหลดรายการห้อง...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rooms.map((room) => (
            <div
              key={room.id}
              className={`bg-white rounded-3xl border transition-all p-6 space-y-4 ${
                room.isActive
                  ? "border-slate-200 shadow-sm"
                  : "border-slate-200 bg-slate-50/70 opacity-70"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: room.color }}
                  />
                  <span className="font-mono font-bold text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                    {room.code}
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(room)}
                    className={`p-1.5 rounded-xl text-xs font-medium flex items-center space-x-1 transition-colors ${
                      room.isActive
                        ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                        : "text-slate-500 bg-slate-200 hover:bg-slate-300"
                    }`}
                    title={room.isActive ? "คลิกเพื่อปิดใช้งาน" : "คลิกเพื่อเปิดใช้งาน"}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{room.isActive ? "เปิดใช้งาน" : "ปิดปรับปรุง"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditModal(room)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                    title="แก้ไขข้อมูล"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-800">
                  {room.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                  {room.location}
                </p>
              </div>

              <div className="flex items-center space-x-4 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center">
                  <Users className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  <span>ความจุ {room.capacity} ท่าน</span>
                </div>
                <div>
                  <span className="text-slate-400">ประวัติการจอง: </span>
                  <span className="font-bold text-indigo-600">
                    {room._count?.bookings || 0} ครั้ง
                  </span>
                </div>
              </div>

              {/* Equipments list */}
              {room.equipments && room.equipments.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                    อุปกรณ์ประจำห้อง:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {room.equipments.map((eqItem: any) => (
                      <span
                        key={eqItem.equipment.id}
                        className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg"
                      >
                        {eqItem.equipment.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Room Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-800">
                {editingRoom ? "แก้ไขข้อมูลห้องประชุม" : "เพิ่มห้องประชุมใหม่"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อห้องประชุม *
                </label>
                <input
                  type="text"
                  placeholder="เช่น ห้องประชุมกาสะลอง (Meeting Room B)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    รหัสห้อง (Code) *
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น RM-101"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ความจุ (คน) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  สถานที่ตั้ง / ชั้น / อาคาร *
                </label>
                <input
                  type="text"
                  placeholder="เช่น ชั้น 3 อาคารอำนวยการ"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  โค้ดสีประจำห้อง (สำหรับแถบสีบนปฏิทิน)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-10 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-28 px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-xl uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  รายละเอียดห้อง
                </label>
                <textarea
                  rows={2}
                  placeholder="รายละเอียดสิ่งอำนวยความสะดวก โต๊ะ เก้าอี้..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-colors"
                >
                  {submitting ? "กำลังบันทึก..." : "บันทึกห้องประชุม"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
