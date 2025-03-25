"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useChat } from "@/hooks/useChat";
import { DEV_USER_ID } from "@/constants/mockId";

export default function NewChatPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const { addChat } = useChat(
    process.env.NODE_ENV === "production" && session?.user?.id
      ? session.user.id
      : DEV_USER_ID
  );

  useEffect(() => {
    let isCreating = false;

    const createNewChat = async () => {
      if (isCreating) return; // 如果正在创建，则跳过
      isCreating = true;

      try {
        // 创建一个新对话
        const newChat = await addChat("新对话");
        if (newChat) {
          // 如果创建成功，重定向到新对话的页面
          router.push(`/chat/${newChat.id}`);
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

  return (
    <div className="w-full flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-muted-foreground">正在创建新对话...</p>
      </div>
    </div>
  );
}
