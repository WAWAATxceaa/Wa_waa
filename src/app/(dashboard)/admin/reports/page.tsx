"use client";

import React from "react";
import { ReportView } from "@/components/reports/ReportView";
import { useSession } from "next-auth/react";
import { Shield } from "lucide-react";

export default function AdminReportsPage() {
  const { data: session } = useSession();

  if (session?.user?.role !== "ADMIN") {
    return (
      <div className="p-8 text-center text-sm text-destructive">
        สิทธิ์ไม่เพียงพอ หน้านี้สำหรับผู้ดูแลระบบ (Admin) เท่านั้น
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          <Shield className="w-3.5 h-3.5" />
          <span>ส่วนงานผู้ดูแลระบบ</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-foreground mt-0.5">
          รายงานการใช้ห้องประชุม & Export
        </h1>
        <p className="text-xs text-muted-foreground">
          กรองสถิติการใช้งานตามช่วงเวลา แผนก และห้องประชุม พร้อมส่งออกไฟล์ CSV และ PDF
        </p>
      </div>

      <ReportView />
    </div>
  );
}
