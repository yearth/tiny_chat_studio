"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MobileLayout } from "@/components/layouts/mobile-layout";
import { TabletLayout } from "@/components/layouts/tablet-layout";
import { DesktopLayout } from "@/components/layouts/desktop-layout";
import { MessageList } from "@/components/chat/message-list";
import { ChatInput } from "@/components/chat/chat-input";
import { useScreenSize } from "@/hooks/useScreenSize";
import { useChat } from "@/hooks/useChat";
import { useConversations } from "@/hooks/useConversations";
import { ScreenSize } from "@/types/layout";
import { ConversationProvider } from "@/contexts/ConversationContext";
import { use } from "react";

export default function ChatPage({ params }: { params: any }) {
  // 使用 React.use() 解包 params Promise
  const resolvedParams = typeof params === 'object' && !('then' in params) ? params : use(params);
  const chatId = resolvedParams.chatId;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentModelId, setCurrentModelId] = useState(""); 
  const router = useRouter();

  // 使用自定义钩子管理屏幕尺寸
  const screenSize = useScreenSize();

  // 获取用户会话信息
  const { data: session } = useSession();

  // 使用自定义钩子管理对话列表
  // 根据环境选择用户ID：生产环境使用登录用户ID，开发环境使用硬编码ID
  const {
    conversations,
    selectedConversationId,
    isLoading: isLoadingConversations,
    selectConversation,
    addConversation,
    removeConversation,
    restoreDeletedConversation,
  } = useConversations({
    userId:
      process.env.NODE_ENV === "production" && session?.user?.id
        ? session.user.id
        : "cm8ke3nrj0000jsxy4tsfv7gy", // 开发环境使用测试用户ID
  });

  // 当路由参数chatId变化时，选择对应的对话
  useEffect(() => {
    if (chatId && conversations.length > 0) {
      const conversation = conversations.find(conv => conv.id === chatId);
      if (conversation) {
        selectConversation(chatId);
      } else {
        // 如果找不到对应的对话，可以重定向到首页或显示错误信息
        router.push('/');
      }
    }
  }, [chatId, conversations, selectConversation, router]);

  // 使用自定义钩子管理当前对话的消息
  const {
    messages,
    sendMessage,
    isLoading: isLoadingMessages,
    streamingMessageId,
  } = useChat({
    chatId, // 使用新的 chatId 参数
  });

  // 处理发送消息
  const handleSendMessage = async (message: string, modelId: string) => {
    // 直接发送消息到当前对话
    await sendMessage(message, modelId);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // 处理新建对话
  const handleNewConversation = async () => {
    // 创建一个新对话，使用默认标题
    const newConversation = await addConversation("新对话");
    if (newConversation) {
      // 如果创建成功，重定向到新对话的页面
      router.push(`/chat/${newConversation.id}`);
    }
  };

  // 处理模型变化
  const handleModelChange = (modelId: string) => {
    setCurrentModelId(modelId);
  };

  // 渲染聊天内容 - 现在分开返回消息列表和输入区域
  const renderChatContent = () => [
    // 第一个元素是消息列表
    <MessageList
      key="message-list"
      messages={messages}
      streamingMessageId={streamingMessageId}
      currentModelId={currentModelId}
      conversationId={chatId}
    />,
    // 第二个元素是输入区域
    <ChatInput
      key="chat-input"
      onSendMessage={handleSendMessage}
      disabled={isLoadingMessages || isLoadingConversations}
      onModelChange={handleModelChange}
      initialModelId={currentModelId}
    />,
  ];

  return (
    <ConversationProvider
      removeConversation={removeConversation}
      restoreDeletedConversation={restoreDeletedConversation}
      conversations={conversations}
      selectedConversationId={selectedConversationId}
    >
      {screenSize === ScreenSize.MOBILE ? (
        <MobileLayout>
          {renderChatContent()}
        </MobileLayout>
      ) : screenSize === ScreenSize.TABLET ? (
        <TabletLayout>
          {renderChatContent()}
        </TabletLayout>
      ) : (
        <DesktopLayout>
          {renderChatContent()}
        </DesktopLayout>
      )}
    </ConversationProvider>
  );
}
