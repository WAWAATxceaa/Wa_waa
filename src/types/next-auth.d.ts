import { Role } from "@prisma/client";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    department?: string | null;
    role: Role;
    avatarUrl?: string | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      department?: string | null;
      role: Role;
      avatarUrl?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    department?: string | null;
    avatarUrl?: string | null;
  }
}
