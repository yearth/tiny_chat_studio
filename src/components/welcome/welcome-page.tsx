"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { EnhancedChatInput } from "@/components/chat/enhanced-chat-input";
import { Navbar } from "@/components/layout/navbar";

interface WelcomePageProps {
  features: string[];
}

export function WelcomePage({ features }: WelcomePageProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const handleNewChat = () => {
    router.push("/chat/new");
  };

  // 处理发送消息的函数
  const handleSendMessage = async (
    message: string,
    modelId: string,
    files?: File[]
  ) => {
    // 创建新对话并跳转
    router.push(
      "/chat/new?message=" + encodeURIComponent(message) + "&modelId=" + modelId
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <div className="flex flex-col items-center justify-center flex-1 p-4">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight gradient-text">
            欢迎使用 Tiny Chat Studio
          </h1>
          <p className="text-muted-foreground">
            {session
              ? `您好，${session.user?.name || "用户"}`
              : "开始您的AI对话之旅"}
          </p>
        </div>

        <div className="mt-8">
          <EnhancedChatInput onSendMessage={handleSendMessage} />
        </div>
      </div>
      </div>
    </div>
  );
}
