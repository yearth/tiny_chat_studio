// 配置 DNS 解析顺序，优先使用 IPv4，解决超时问题
import { setDefaultResultOrder } from "dns";
setDefaultResultOrder("ipv4first");

import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/server/db/client";
import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import type { NextAuthOptions } from "next-auth";

type SessionCallbackParams = {
  session: Session;
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  token: JWT;
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",

      authorization: {
        params: {
          prompt: "select_account",
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
        },
      },

      httpOptions: {
        timeout: 10000, // 增加超时时间到10秒
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      httpOptions: {
        timeout: 10000, // 增加超时时间到10秒
      },
    }),
  ],
  callbacks: {
    async session({ session, user }: SessionCallbackParams) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development", // 在开发环境中启用调试模式
};
