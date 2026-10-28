"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Calendar,
  DoorOpen,
  CalendarCheck,
  Shield,
  FileSpreadsheet,
  Settings2,
  X,
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const navigation = [
    { name: "แดชบอร์ด", href: "/", icon: LayoutDashboard },
    { name: "ปฏิทินห้องประชุม", href: "/calendar", icon: Calendar },
    { name: "ห้องประชุมทั้งหมด", href: "/rooms", icon: DoorOpen },
    { name: "การจองของฉัน", href: "/bookings", icon: CalendarCheck },
  ];

  const adminNavigation = [
    { name: "จัดการห้องประชุม", href: "/admin/rooms", icon: Settings2 },
    { name: "รายการจองทั้งหมด", href: "/admin/bookings", icon: CalendarCheck },
    { name: "รายงานและ Export", href: "/admin/reports", icon: FileSpreadsheet },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 border-r border-border bg-card transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-30 flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header in mobile */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-border lg:hidden">
          <span className="font-bold text-lg">เมนูนำทาง</span>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-muted text-muted-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-2">
              เมนูหลัก
            </div>
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Admin Tools */}
          {isAdmin && (
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-2">
                <Shield className="w-3 h-3 text-blue-500" />
                <span>สำหรับผู้ดูแล (Admin)</span>
              </div>
              <nav className="space-y-1">
                {adminNavigation.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* System info footer */}
        <div className="p-4 border-t border-border">
          <div className="p-3 rounded-xl bg-muted/60 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Smart Meeting Room</p>
            <p>เวอร์ชัน 1.0 (Next.js 14)</p>
            <p className="text-[10px] text-muted-foreground/80">ระบบจองห้องประชุมองค์กร</p>
          </div>
        </div>
      </aside>
    </>
  );
}
