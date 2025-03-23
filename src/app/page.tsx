"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
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

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentModelId, setCurrentModelId] = useState(""); // 添加当前选择的模型 ID 状态

  // 使用自定义钩子管理屏幕尺寸
  const screenSize = useScreenSize();

  // 获取用户会话信息
  const { data: session } = useSession();
  console.log("🔍 ~ Home ~ src/app/page.tsx:24 ~ session:", session);

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

  // 使用自定义钩子管理当前对话的消息
  const {
    messages,
    sendMessage,
    isLoading: isLoadingMessages,
    streamingMessageId,
  } = useChat({
    conversationId: selectedConversationId,
  });

  // 处理发送消息
  const handleSendMessage = async (message: string, modelId: string) => {
    // 如果没有选中的对话，先创建一个新对话
    if (!selectedConversationId) {
      // 使用消息的前10个字符作为对话标题
      const title =
        message.length > 10 ? `${message.substring(0, 10)}...` : message;
      const newConversation = await addConversation(title);
      // 如果创建成功，发送消息
      if (newConversation) {
        await sendMessage(message, modelId);
      }
    } else {
      // 直接发送消息到当前选中的对话
      await sendMessage(message, modelId);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // 处理新建对话
  const handleNewConversation = async () => {
    // 创建一个新对话，使用默认标题
    const newConversation = await addConversation("新对话");
    if (newConversation) {
      // 如果创建成功，选中该对话
      selectConversation(newConversation.id);
    }
  };

  // 处理模型变化
  const handleModelChange = (modelId: string) => {
    setCurrentModelId(modelId);
  };

  // 渲染聊天内容 - 现在分开返回消息列表和输入区域
  const renderChatContent = () => [
    // 第一个元素是消息列表（黑色部分）
    <MessageList
      key="message-list"
      messages={messages}
      streamingMessageId={streamingMessageId}
      currentModelId={currentModelId}
      conversationId={selectedConversationId}
    />,
    // 第二个元素是输入区域（黄色部分）
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
        <MobileLayout
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          conversations={conversations}
          onSelectConversation={selectConversation}
          onNewConversation={handleNewConversation}
          selectedConversationId={selectedConversationId}
          isLoading={isLoadingConversations}
        >
          {renderChatContent()}
        </MobileLayout>
      ) : screenSize === ScreenSize.TABLET ? (
        <TabletLayout
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          conversations={conversations}
          onSelectConversation={selectConversation}
          onNewConversation={handleNewConversation}
          selectedConversationId={selectedConversationId}
          isLoading={isLoadingConversations}
        >
          {renderChatContent()}
        </TabletLayout>
      ) : (
        <DesktopLayout
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          conversations={conversations}
          onSelectConversation={selectConversation}
          onNewConversation={handleNewConversation}
          selectedConversationId={selectedConversationId}
          isLoading={isLoadingConversations}
        >
          {renderChatContent()}
        </DesktopLayout>
      )}
    </ConversationProvider>
  );
}
