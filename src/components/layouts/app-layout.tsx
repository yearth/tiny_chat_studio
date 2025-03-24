import React, { ReactNode } from "react";
import { SimpleConversation } from "@/types/conversation";

interface AppLayoutProps {
  // Sidebar 相关属性
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  conversations: SimpleConversation[];
  onSelectConversation?: (conversationId: string) => void;
  selectedConversationId?: string | null;

  // 内容区域
  header: ReactNode;
  content: ReactNode;
  inputArea: ReactNode;

  // 设备类型
  variant: "desktop" | "tablet" | "mobile";
}

export function AppLayout({
  isSidebarOpen,
  toggleSidebar,
  conversations,
  onSelectConversation,
  selectedConversationId,
  header,
  content,
  inputArea,
  variant,
}: AppLayoutProps) {
  // 是否为移动设备
  const isMobile = variant === "mobile";

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* 红色部分: 侧边栏 - 由各个设备的布局组件处理 */}

      {/* 主内容区域 - 包含蓝色、黑色和黄色部分 */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* 遮罩层 - 移动设备侧边栏打开时显示 */}
        {isMobile && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-10"
            onClick={toggleSidebar}
          ></div>
        )}

        {/* 蓝色部分: 顶部导航栏 - 固定在顶部 */}
        <div className="sticky top-0 z-20 w-full bg-background/80 backdrop-blur-sm border-b border-muted shadow-sm">
          {header}
        </div>

        {/* 黑色部分: 聊天内容区域 - 可滚动 */}
        <div className="flex-1 overflow-y-auto w-full">{content}</div>

        {/* 黄色部分: 输入区域 - 固定在底部 */}
        <div className="sticky bottom-0 z-20 w-full bg-background/80 backdrop-blur-sm border-t border-muted">
          {inputArea}
        </div>
      </div>
    </div>
  );
}
