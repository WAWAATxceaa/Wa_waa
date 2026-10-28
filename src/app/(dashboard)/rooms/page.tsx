"use client";

import React, { useState, useEffect } from "react";
import { RoomItem } from "@/types";
import { RoomCard } from "@/components/rooms/RoomCard";
import { BookingModal } from "@/components/calendar/BookingModal";
import { Search, Filter, RefreshCw } from "lucide-react";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFloor, setSelectedFloor] = useState<string>("all");
  const [selectedAmenity, setSelectedAmenity] = useState<string>("all");

  const [bookingRoomId, setBookingRoomId] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/rooms?availability=true");
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

  // Filter logic
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (room.description && room.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFloor =
      selectedFloor === "all" || room.floor.toString() === selectedFloor;

    const matchesAmenity =
      selectedAmenity === "all" || room.amenities.includes(selectedAmenity);

    return matchesSearch && matchesFloor && matchesAmenity;
  });

  const allAmenities = Array.from(new Set(rooms.flatMap((r) => r.amenities)));
  const allFloors = Array.from(new Set(rooms.map((r) => r.floor.toString()))).sort(
    (a, b) => Number(a) - Number(b)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            ห้องประชุมทั้งหมด
          </h1>
          <p className="text-xs text-muted-foreground">
            ค้นหาห้องประชุมที่ตรงกับความต้องการ ตรวจสอบอุปกรณ์ และจองได้ทันที
          </p>
        </div>

        <button
          onClick={fetchRooms}
          disabled={loading}
          className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground self-start sm:self-auto"
          title="รีเฟรชข้อมูล"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Search and Filters */}
      <div className="p-4 rounded-2xl border border-border bg-card shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="ค้นหาชื่อห้อง หรือวาระที่ต้องการ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Floor Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            className="px-3 py-2 rounded-xl border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">ทุกชั้น</option>
            {allFloors.map((f) => (
              <option key={f} value={f}>
                ชั้น {f}
              </option>
            ))}
          </select>
        </div>

        {/* Amenity Filter */}
        <select
          value={selectedAmenity}
          onChange={(e) => setSelectedAmenity(e.target.value)}
          className="px-3 py-2 rounded-xl border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">อุปกรณ์ทั้งหมด</option>
          {allAmenities.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      {/* Room Grid */}
      {filteredRooms.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border text-muted-foreground text-sm">
          ไม่พบห้องประชุมที่ตรงกับเงื่อนไขการค้นหา
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onBook={(id) => {
                setBookingRoomId(id);
                setIsBookingModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={fetchRooms}
        initialRoomId={bookingRoomId || undefined}
      />
    </div>
  );
}
