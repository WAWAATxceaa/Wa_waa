import type { Metadata } from "next";
import { Prompt, Sarabun } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { NotificationToast } from "@/components/layout/NotificationToast";

const prompt = Prompt({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-prompt",
  display: "swap",
});

const sarabun = Sarabun({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-sarabun",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ระบบจองห้องประชุมออนไลน์ (Smart Meeting Room Booking System)",
  description: "ระบบจองห้องประชุมอัจฉริยะ ใช้งานง่าย ไม่ต้องล็อกอิน ป้องกันเวลาชน พร้อมแจ้งเตือนแบบเรียลไทม์",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${prompt.variable} ${sarabun.variable}`}>
      <body className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-indigo-500 selection:text-white">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4">
            ระบบจองห้องประชุมออนไลน์ (Smart Meeting Room Booking System) • Next.js 15 & Prisma (SQLite)
          </div>
        </footer>
        {/* Real-time SSE Toast Notifications */}
        <NotificationToast />
      </body>
    </html>
  );
}
