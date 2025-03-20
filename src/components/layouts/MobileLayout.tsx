import React from "react";
import { Menu } from "lucide-react";
import { Sidebar, SimpleConversation } from "./Sidebar";

interface MobileLayoutProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  conversations: SimpleConversation[];
  children: React.ReactNode;
  onSelectConversation?: (conversationId: string) => void;
  selectedConversationId?: string | null;
}

export function MobileLayout({
  isSidebarOpen,
  toggleSidebar,
  conversations,
  children,
  onSelectConversation,
  selectedConversationId,
}: MobileLayoutProps) {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* 悬浮菜单按钮 - 在侧边栏关闭时显示 */}
      {!isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed left-4 top-4 z-50 bg-blue-500 text-white rounded-full p-3 shadow-lg hover:bg-blue-600 transition-all animate-pulse"
          aria-label="打开菜单"
          style={{ boxShadow: "0 0 10px rgba(59, 130, 246, 0.7)" }}
        >
          <Menu className="h-5 w-5" />
        </button>
      )}
      
      {/* 使用通用侧边栏组件 */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        conversations={conversations}
        onSelectConversation={onSelectConversation}
        selectedConversationId={selectedConversationId}
        variant="mobile"
      />

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* 遮罩层 - 侧边栏打开时显示 */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-10"
            onClick={toggleSidebar}
          ></div>
        )}

        {/* 子组件内容 */}
        {children}
      </div>
    </div>
  );
}
