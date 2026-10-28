"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { LogOut, User as UserIcon, Shield, Menu } from "lucide-react";
import { format } from "date-fns";

export function Navbar({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const { data: session } = useSession();
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const update = () => {
      setTimeStr(format(new Date(), "HH:mm:ss"));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-muted text-foreground"
              aria-label="เปิดเมนู"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              S
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-foreground flex items-center gap-1.5">
                SmartRoom
                <span className="hidden sm:inline-block text-[11px] font-normal px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  จองห้องประชุม
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Live Bangkok Time Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-muted text-xs font-mono text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span>BKK {timeStr}</span>
          </div>

          <NotificationBell />
          <ThemeToggle />

          {/* User profile dropdown or info */}
          {session?.user && (
            <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-border">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-foreground truncate max-w-[140px]">
                  {session.user.name}
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center justify-end gap-1">
                  {session.user.role === "ADMIN" ? (
                    <span className="text-blue-500 font-medium flex items-center gap-0.5">
                      <Shield className="w-2.5 h-2.5" /> Admin
                    </span>
                  ) : (
                    session.user.department || "พนักงาน"
                  )}
                </span>
              </div>

              {session.user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.avatarUrl}
                  alt={session.user.name}
                  className="w-8 h-8 rounded-full border border-border object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs border border-primary/20">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}

              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                title="ออกจากระบบ"
                aria-label="ออกจากระบบ"
                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
