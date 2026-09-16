import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

/**
 * NextAuth is used ONLY for the site owner's admin login (Google). Regular
 * visitors never see this — bidding and claiming a @username is anonymous
 * and handled entirely by src/lib/anonSession.ts. There's no public /login
 * page; reaching /api/auth/signin (NextAuth's default UI) is how an admin
 * signs in.
 */
const providers: NextAuthOptions["providers"] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await prisma.user.upsert({
          where: { email: user.email ?? "" },
          update: { displayName: user.name ?? undefined, avatarUrl: user.image ?? undefined },
          create: {
            email: user.email ?? undefined,
            displayName: user.name ?? undefined,
            avatarUrl: user.image ?? undefined,
            username: `user_${(user.email ?? "").split("@")[0].replace(/[^a-zA-Z0-9_]/g, "").slice(0, 15) || Math.random().toString(36).slice(2, 10)}`,
          },
        });
      }
      return true;
    },
    async jwt({ token }) {
      const dbUser = await prisma.user.findFirst({
        where: { OR: [{ email: token.email ?? undefined }, { id: token.sub }] },
      });
      if (dbUser) {
        token.uid = dbUser.id;
        token.username = dbUser.username;
        token.isAdmin = dbUser.isAdmin;
        token.isBanned = dbUser.isBanned;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.uid;
        (session.user as any).username = token.username;
        (session.user as any).isAdmin = token.isAdmin;
        (session.user as any).isBanned = token.isBanned;
      }
      return session;
    },
  },
};
