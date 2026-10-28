import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "อีเมล", type: "email", placeholder: "user@company.com" },
        password: { label: "รหัสผ่าน", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("กรุณากรอกอีเมลและรหัสผ่าน");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.trim().toLowerCase() },
        });

        if (!user) {
          throw new Error("ไม่พบบัญชีผู้ใช้นี้ในระบบ");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          throw new Error("รหัสผ่านไม่ถูกต้อง");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          department: user.department,
          role: user.role,
          avatarUrl: user.avatarUrl,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.department = user.department;
        token.avatarUrl = user.avatarUrl;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.department = token.department as string | null;
        session.user.avatarUrl = token.avatarUrl as string | null;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "smart-meeting-room-secret-fallback-key",
};
