import React from "react";
import { Sidebar, SimpleConversation } from "./Sidebar";
import { Header } from "./Header";

interface TabletLayoutProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  conversations: SimpleConversation[];
  children: React.ReactNode;
  onSelectConversation?: (conversationId: string) => void;
  onNewConversation?: () => void; // 添加新对话的回调函数
  selectedConversationId?: string | null;
}

export function TabletLayout({
  isSidebarOpen,
  toggleSidebar,
  conversations,
  children,
  onSelectConversation,
  onNewConversation,
  selectedConversationId,
}: TabletLayoutProps) {
  // 将子组件内容拆分为聊天内容和输入区域
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
        variant="tablet"
      />

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* 蓝色部分：Header */}
        <div className="sticky top-0 z-20 w-full bg-background/80 backdrop-blur-sm border-b border-muted shadow-sm">
          <Header toggleSidebar={toggleSidebar} variant="tablet" />
        </div>
        
        {/* 黑色部分：聊天内容 */}
        <div className="flex-1 overflow-y-auto w-full">
          {chatContent}
        </div>
        
        {/* 黄色部分：输入区域 */}
        <div className="sticky bottom-0 z-20 w-full bg-background/80 backdrop-blur-sm border-t border-muted">
          {inputArea}
        </div>
      </div>
    </div>
  );
}
