"use client";

import React, { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Lock, Mail, ArrowRight, Shield, User, AlertCircle } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl,
    });

    if (res?.error) {
      setError(res.error || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      setLoading(false);
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-blue-500/20">
            S
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Smart Meeting Room
          </h1>
          <p className="text-xs text-muted-foreground">
            ระบบจองห้องประชุมออนไลน์องค์กร • เข้าสู่ระบบเพื่อใช้งาน
          </p>
        </div>

        {/* Card */}
        <div className="p-6 sm:p-8 rounded-3xl border border-border bg-card text-card-foreground shadow-xl space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                อีเมลองค์กร
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                รหัสผ่าน
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>กำลังตรวจสอบ...</span>
                </>
              ) : (
                <>
                  <span>เข้าสู่ระบบ</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Buttons */}
          <div className="pt-4 border-t border-border">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 text-center">
              คลิกเพื่อเลือกบัญชีทดสอบระบบ
            </p>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => handleQuickLogin("admin@company.com", "admin1234")}
                className="w-full p-2.5 rounded-xl border border-border hover:bg-muted text-xs font-medium flex items-center justify-between text-foreground transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-blue-500" />
                  <span>Admin: สมเกียรติ ยิ่งเจริญ</span>
                </span>
                <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                  admin@company.com
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("somchai@company.com", "emp1234")}
                className="w-full p-2.5 rounded-xl border border-border hover:bg-muted text-xs font-medium flex items-center justify-between text-foreground transition-colors"
              >
                <span className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Employee: สมชาย พัฒนาการ (IT)</span>
                </span>
                <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                  somchai@company.com
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("suda@company.com", "emp1234")}
                className="w-full p-2.5 rounded-xl border border-border hover:bg-muted text-xs font-medium flex items-center justify-between text-foreground transition-colors"
              >
                <span className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-purple-500" />
                  <span>Employee: สุดา ดวงใจ (HR)</span>
                </span>
                <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                  suda@company.com
                </span>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground">
          ระบบรักษาความปลอดภัยและจัดการเวลามาตรฐาน Asia/Bangkok
        </p>
      </div>
    </div>
  );
}
