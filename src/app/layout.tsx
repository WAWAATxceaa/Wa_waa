import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { AuthProvider } from "@/components/shared/AuthProvider";

export const metadata: Metadata = {
  title: "Smart Meeting Room Booking System - ระบบจองห้องประชุมออนไลน์",
  description: "ระบบจองห้องประชุมอัจฉริยะแบบเรียลไทม์ พร้อมแดชบอร์ดและรายงานการใช้งาน",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className="antialiased selection:bg-primary/20 selection:text-primary">
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
