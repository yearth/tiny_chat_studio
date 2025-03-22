import React from "react";
import { Menu } from "lucide-react";
import { Sidebar, SimpleConversation } from "./sidebar-layout";
import { Header } from "./header-layout";

interface MobileLayoutProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  conversations: SimpleConversation[];
  children: React.ReactNode;
  onSelectConversation?: (conversationId: string) => void;
  onNewConversation?: () => void; // 添加新对话的回调函数
  selectedConversationId?: string | undefined;
  isLoading?: boolean; // 添加加载状态
}

export function MobileLayout({
  isSidebarOpen,
  toggleSidebar,
  conversations,
  children,
  onSelectConversation,
  onNewConversation,
  selectedConversationId,
  isLoading = false,
}: MobileLayoutProps) {
  // 将子组件内容拆分为聊天内容和输入区域
  const childrenArray = React.Children.toArray(children);
  const chatContent = childrenArray[0];
  const inputArea = childrenArray[1];

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

      {/* 红色部分：侧边栏 */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        conversations={conversations}
        onSelectConversation={onSelectConversation}
        onNewConversation={onNewConversation}
        selectedConversationId={selectedConversationId}
        isLoading={isLoading}
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

        {/* 蓝色部分：Header */}
        <div className="sticky top-0 z-20 w-full bg-background/80 backdrop-blur-sm border-b border-muted shadow-sm">
          <Header toggleSidebar={toggleSidebar} variant="mobile" />
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
