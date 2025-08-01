// src/types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      favoriteMovie?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    favoriteMovie?: string | null;
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser {
    favoriteMovie?: string | null;
  }
}
