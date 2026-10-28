"use client";

import React from "react";
import { CheckCircle2, XCircle, Calendar, Users } from "lucide-react";

interface MetricCardsProps {
  totalRooms: number;
  availableRoomsNow: number;
  busyRoomsNow: number;
  todayBookingsCount: number;
  totalParticipantsToday: number;
}

export function MetricCards({
  totalRooms,
  availableRoomsNow,
  busyRoomsNow,
  todayBookingsCount,
  totalParticipantsToday,
}: MetricCardsProps) {
  const cards = [
    {
      title: "ห้องว่างพร้อมใช้งานตอนนี้",
      value: `${availableRoomsNow} / ${totalRooms}`,
      subtitle: `พร้อมสำหรับการประชุมด่วน`,
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      title: "ห้องที่กำลังใช้งานอยู่",
      value: busyRoomsNow,
      subtitle: `กำลังมีการประชุมขณะนี้`,
      icon: XCircle,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
    },
    {
      title: "การประชุมทั้งหมดของวันนี้",
      value: todayBookingsCount,
      subtitle: `รายการจองในวันนี้`,
      icon: Calendar,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      title: "ผู้เข้าร่วมประชุมวันนี้",
      value: `${totalParticipantsToday} คน`,
      subtitle: `จำนวนคนเข้าร่วมโดยประมาณ`,
      icon: Users,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-5 rounded-2xl border bg-card text-card-foreground shadow-sm flex items-center justify-between ${card.border}`}
          >
            <div>
              <p className="text-xs font-medium text-muted-foreground">{card.title}</p>
              <h3 className="text-2xl font-bold mt-1 tracking-tight text-foreground">
                {card.value}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">{card.subtitle}</p>
            </div>
            <div className={`p-3 rounded-2xl ${card.bg} ${card.color}`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
