import React from "react";
import { Sidebar, SimpleConversation } from "./sidebar-layout";
import { AppLayout } from "./app-layout";
import { Header } from "./header-layout";

interface DesktopLayoutProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  conversations: SimpleConversation[];
  children: React.ReactNode;
  onSelectConversation?: (conversationId: string) => void;
  onNewConversation?: () => void; // 添加新对话的回调函数
  selectedConversationId?: string | undefined;
  isLoading?: boolean; // 添加加载状态
}

export function DesktopLayout({
  isSidebarOpen,
  toggleSidebar,
  conversations,
  children,
  onSelectConversation,
  onNewConversation,
  selectedConversationId,
  isLoading = false,
}: DesktopLayoutProps) {
  // 将子组件内容拆分为聊天内容和输入区域
  // 假设子组件是一个数组，第一个元素是聊天内容，第二个元素是输入区域
  const childrenArray = React.Children.toArray(children);
  const chatContent = childrenArray[0];
  const inputArea = childrenArray[1];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* 红色部分：侧边栏 */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        conversations={conversations}
        onSelectConversation={onSelectConversation}
        onNewConversation={onNewConversation}
        selectedConversationId={selectedConversationId}
        isLoading={isLoading}
        variant="desktop"
      />

      {/* 蓝色、黑色和黄色部分由 AppLayout 处理 */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* 蓝色部分：Header */}
        <div className="sticky top-0 z-20 w-full bg-background/80 backdrop-blur-sm border-b border-muted shadow-sm">
          <Header toggleSidebar={toggleSidebar} variant="desktop" />
        </div>

        {/* 黑色部分：聊天内容 */}
        <div className="flex-1 overflow-y-auto w-full">{chatContent}</div>

        {/* 黄色部分：输入区域 */}
        <div className="sticky bottom-0 z-20 w-full bg-background/80 backdrop-blur-sm border-t border-muted">
          {inputArea}
        </div>
      </div>
    </div>
  );
}
