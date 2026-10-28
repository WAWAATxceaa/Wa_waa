"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/shared/Navbar";
import { Sidebar } from "@/components/shared/Sidebar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { status } = useSession();
  const router = useRouter();

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-muted-foreground font-medium">กำลังเตรียมระบบ...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
