// src/pages/api/auth/[...nextauth].ts

import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, user }) {
      // Add user ID and favoriteMovie to session for database operations
      if (user) {
        session.user = {
          ...session.user,
          id: user.id,
          favoriteMovie: user.favoriteMovie,
        };
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
