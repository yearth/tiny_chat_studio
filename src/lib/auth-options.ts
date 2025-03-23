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

// 注意：这里我们不再在代码中配置代理
// 而是依赖环境变量 HTTP_PROXY 和 HTTPS_PROXY
// 这些变量应该在启动应用前设置，例如：
// HTTP_PROXY=http://127.0.0.1:7897 HTTPS_PROXY=http://127.0.0.1:7897 npm run dev

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
      httpOptions: {
        timeout: 3500,
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      httpOptions: {
        timeout: 3500,
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
  // 使用默认的回调URL，不再需要自定义登录页面
  // 因为我们使用模态对话框进行登录
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development", // 在开发环境中启用调试模式
};
