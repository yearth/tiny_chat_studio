"use client";

import { useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { useChat } from "@/hooks/useChat";
import { useConversations } from "@/hooks/useConversations";
import { EnhancedChatInput } from "@/components/chat/enhanced-chat-input";
import { MessageList } from "@/components/chat/message-list";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  // 获取当前选中的对话信息
  const selectedConversation = conversations.find((conv) => conv.id === chatId);
  const currentModelId =
    selectedConversation?.modelId || "deepseek/deepseek-chat:free";

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      {/* 聊天内容区域 - 使用原生滚动并美化滚动条 */}
      <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
        <div className="max-w-3xl mx-auto pt-4 pb-4">
          <MessageList
            messages={messages}
            streamingMessageId={streamingMessageId}
            currentModelId={currentModelId}
            conversationId={chatId || undefined}
            className=""
          />
        </div>
      </div>

      {/* 输入区域 - 使用sticky定位固定在底部 */}
      <div className="sticky bottom-0 left-0 right-0 w-full bg-background/80 backdrop-blur-sm py-4">
        <div className="max-w-3xl mx-auto px-8">
          <EnhancedChatInput onSendMessage={() => Promise.resolve()} />
        </div>
      </div>
    </div>
  );
}
