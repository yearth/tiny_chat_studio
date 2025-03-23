"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useConversations } from "@/hooks/useConversations";

export default function NewChatPage() {
  const router = useRouter();
  const { data: session } = useSession();

  // 根据环境选择用户ID
  const { addConversation } = useConversations({
    userId:
      process.env.NODE_ENV === "production" && session?.user?.id
        ? session.user.id
        : "cm8ke3nrj0000jsxy4tsfv7gy", // 开发环境使用测试用户ID
  });

  useEffect(() => {
    // 使用一个标志来防止多次创建
    let isCreating = false;
    
    const createNewChat = async () => {
      if (isCreating) return; // 如果正在创建，则跳过
      isCreating = true;
      
      try {
        // 创建一个新对话
        const newConversation = await addConversation("新对话");
        if (newConversation) {
          // 如果创建成功，重定向到新对话的页面
          router.push(`/chat/${newConversation.id}`);
        } else {
          // 如果创建失败，重定向到首页
          router.push("/");
        }
      } catch (error) {
        console.error("创建新对话失败:", error);
        // 发生错误时重定向到首页
        router.push("/");
      } finally {
        isCreating = false;
      }
    };

    createNewChat();
    
    // 只依赖 router，不依赖 addConversation
  }, [router]);

  // 显示加载中状态
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-muted-foreground">正在创建新对话...</p>
      </div>
    </div>
  );
}
