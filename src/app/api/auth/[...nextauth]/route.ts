import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/server/db/client";
import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";

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

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
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
  // 使用默认的回调URL，不再需要自定义登录页面
  // 因为我们使用模态对话框进行登录
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
