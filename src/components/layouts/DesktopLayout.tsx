import React from "react";
import { Sidebar, SimpleConversation } from "./Sidebar";

interface DesktopLayoutProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  conversations: SimpleConversation[];
  children: React.ReactNode;
  onSelectConversation?: (conversationId: string) => void;
  selectedConversationId?: string | null;
}

export function DesktopLayout({
  isSidebarOpen,
  toggleSidebar,
  conversations,
  children,
  onSelectConversation,
  selectedConversationId,
}: DesktopLayoutProps) {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* 使用通用侧边栏组件 */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        conversations={conversations}
        onSelectConversation={onSelectConversation}
        selectedConversationId={selectedConversationId}
        variant="desktop"
      />

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* 子组件内容 */}
        {children}
      </div>
    </div>
  );
}
