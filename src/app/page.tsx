"use client";

import { useState, useEffect } from "react";
import { MobileLayout } from "@/components/layouts/MobileLayout";
import { TabletLayout } from "@/components/layouts/TabletLayout";
import { DesktopLayout } from "@/components/layouts/DesktopLayout";
import { LocalConversation, mockMessages, mockConversations } from "@/data/mockData";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { useScreenSize } from "@/hooks/useScreenSize";
import { useChat } from "@/hooks/useChat";
import { ScreenSize } from "@/types/layout";

/**
 * 主页面组件
 * 根据屏幕尺寸选择合适的布局组件
 */

export default function Home() {
  // 状态管理
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState<LocalConversation[]>([]);
  
  // 自定义钩子
  const screenSize = useScreenSize();
  const { messages, sendMessage, isLoading, setMessages } = useChat();

  // 加载模拟数据
  useEffect(() => {
    setConversations(mockConversations);
    setMessages(mockMessages);
  }, [setMessages]);

  // 处理消息发送
  const handleSendMessage = async (message: string, modelId: string) => {
    await sendMessage(message, modelId);
  };

  // 切换侧边栏
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // 渲染聊天内容区域
  const renderChatContent = () => (
    <>
      <MessageList messages={messages} />
      <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </>
  );

  // 根据屏幕尺寸渲染不同的布局
  return screenSize === ScreenSize.MOBILE ? (
    <MobileLayout
      isSidebarOpen={isSidebarOpen}
      toggleSidebar={toggleSidebar}
      conversations={conversations}
    >
      {renderChatContent()}
    </MobileLayout>
  ) : screenSize === ScreenSize.TABLET ? (
    <TabletLayout
      isSidebarOpen={isSidebarOpen}
      toggleSidebar={toggleSidebar}
      conversations={conversations}
    >
      {renderChatContent()}
    </TabletLayout>
  ) : (
    <DesktopLayout
      isSidebarOpen={isSidebarOpen}
      toggleSidebar={toggleSidebar}
      conversations={conversations}
    >
      {renderChatContent()}
    </DesktopLayout>
  );
}
