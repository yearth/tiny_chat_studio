"use client";

import { useState } from "react";
import { MobileLayout } from "@/components/layouts/MobileLayout";
import { TabletLayout } from "@/components/layouts/TabletLayout";
import { DesktopLayout } from "@/components/layouts/DesktopLayout";
import { LocalConversation } from "@/data/mockData";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { useScreenSize } from "@/hooks/useScreenSize";
import { useChat } from "@/hooks/useChat";
import { useConversations } from "@/hooks/useConversations";
import { ScreenSize } from "@/types/layout";
import { ConversationProvider } from "@/contexts/ConversationContext";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 使用自定义钩子管理屏幕尺寸
  const screenSize = useScreenSize();

  // 使用自定义钩子管理对话列表
  // 注意：在实际应用中，userId应该从认证系统获取
  const {
    conversations,
    selectedConversationId,
    isLoading: isLoadingConversations,
    selectConversation,
    addConversation,
    removeConversation,
    restoreDeletedConversation,
  } = useConversations({
    userId: "cm8h2lozw0000jsz3jff2qk1h", // 使用 seed 脚本创建的测试用户ID
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
    const newConversation = await addConversation('新对话');
    if (newConversation) {
      // 如果创建成功，选中该对话
      selectConversation(newConversation.id);
    }
  };

  // 渲染聊天内容 - 现在分开返回消息列表和输入区域
  const renderChatContent = () => [
    // 第一个元素是消息列表（黑色部分）
    <MessageList 
      key="message-list" 
      messages={messages} 
      streamingMessageId={streamingMessageId} 
    />,
    // 第二个元素是输入区域（黄色部分）
    <ChatInput
      key="chat-input"
      onSendMessage={handleSendMessage}
      disabled={isLoadingMessages || isLoadingConversations}
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
        >
          {renderChatContent()}
        </DesktopLayout>
      )}
    </ConversationProvider>
  );
}
