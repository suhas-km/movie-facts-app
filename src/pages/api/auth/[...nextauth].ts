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
  useSecureCookies: process.env.NODE_ENV === "production",
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === "production"
      }
    }
  },
  callbacks: {
    async session({ session, user }) {
      // Add user ID and favoriteMovie to session for database operations
      try {
        if (user && session.user?.email) {
          // Fetch the full user data from database
          const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email },
          });
          
          session.user = {
            ...session.user,
            id: user.id,
            favoriteMovie: dbUser?.favoriteMovie || null,
          };
        }
        return session;
      } catch (error) {
        console.error("Session callback error:", error);
        return session;
      }
    },
  },
};

export default NextAuth(authOptions);
