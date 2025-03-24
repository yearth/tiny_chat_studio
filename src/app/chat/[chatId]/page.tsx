"use client";

import { useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MessageList } from "@/components/chat/message-list";
import { useChat } from "@/hooks/useChat";
import { useConversations } from "@/hooks/useConversations";
import { EnhancedChatInput } from "@/components/chat/enhanced-chat-input";

export default function ChatPage({ params }: { params: any }) {
  const resolvedParams =
    typeof params === "object" && !("then" in params) ? params : use(params);
  const chatId = resolvedParams.chatId;
  const router = useRouter();

  // 获取用户会话信息
  const { data: session } = useSession();

  // 使用自定义钩子管理对话列表
  // 根据环境选择用户ID：生产环境使用登录用户ID，开发环境使用硬编码ID
  const { conversations, selectConversation } = useConversations({
    userId:
      process.env.NODE_ENV === "production" && session?.user?.id
        ? session.user.id
        : "cm8ke3nrj0000jsxy4tsfv7gy", // 开发环境使用测试用户ID
  });

  // 当路由参数chatId变化时，选择对应的对话
  useEffect(() => {
    if (chatId && conversations.length > 0) {
      const conversation = conversations.find((conv) => conv.id === chatId);
      if (conversation) {
        selectConversation(chatId);
      } else {
        // 如果找不到对应的对话，可以重定向到首页或显示错误信息
        router.push("/");
      }
    }
  }, [chatId, conversations, selectConversation, router]);

  // 使用自定义钩子管理当前对话的消息
  const { messages, streamingMessageId } = useChat({
    chatId, // 使用新的 chatId 参数
  });

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* 聊天内容区域 */}
      <div className="flex-1 overflow-y-auto pb-24">
        <MessageList
          key="message-list"
          messages={messages}
          streamingMessageId={streamingMessageId}
          currentModelId={"deepseek/deepseek-chat:free"}
          conversationId={chatId}
        />
      </div>

      {/* 输入区域  */}
      <div className="sticky w-full bg-background/80 backdrop-blur-sm py-4">
        <div className="container max-w-4xl mx-auto px-4">
          <EnhancedChatInput onSendMessage={() => Promise.resolve()} />
        </div>
      </div>
    </div>
  );
}
