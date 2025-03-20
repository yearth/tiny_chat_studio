import React from "react";
import {
  Menu,
  Plus,
  ChevronDown,
  MessageSquare,
  Settings,
  History,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

// 使用通用的类型定义
export type SimpleConversation = {
  id: string;
  title: string;
};

export interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  conversations: SimpleConversation[];
  onSelectConversation?: (conversationId: string) => void;
  onNewConversation?: () => void; // 添加新对话的回调函数
  selectedConversationId?: string | null;
  variant?: "desktop" | "tablet" | "mobile";
  className?: string;
}

export function Sidebar({
  isSidebarOpen,
  toggleSidebar,
  conversations,
  onSelectConversation,
  onNewConversation,
  selectedConversationId,
  variant = "desktop",
  className = "",
}: SidebarProps) {
  // 根据不同设备类型设置不同的样式
  const isMobile = variant === "mobile";
  const isDesktop = variant === "desktop";
  const isTablet = variant === "tablet";

  // 侧边栏容器样式
  const sidebarContainerClasses = isMobile
    ? `fixed z-20 h-full bg-background border-r border-gray-700 transition-all duration-300 ease-in-out ${
        isSidebarOpen ? "w-64" : "w-0 overflow-hidden"
      } ${!isSidebarOpen ? "-translate-x-full" : "translate-x-0"}`
    : `relative z-10 h-full bg-background border-r border-gray-700 transition-all duration-300 ease-in-out ${
        isSidebarOpen ? "w-64" : "w-16 overflow-hidden"
      }`;

  // 侧边栏样式
  const sidebarStyle =
    isMobile || isTablet
      ? {
          boxShadow: isSidebarOpen ? "0 0 15px rgba(0, 0, 0, 0.3)" : "none",
        }
      : {};

  // 标题样式
  const titleClasses =
    isDesktop || isTablet
      ? `font-medium transition-opacity duration-200 ${
          isSidebarOpen ? "opacity-100" : "opacity-0"
        }`
      : "font-medium";

  // 新建聊天按钮
  const renderNewChatButton = () => {
    // 处理新建对话的点击事件
    const handleNewConversation = () => {
      if (onNewConversation) {
        onNewConversation();
        // 如果是移动端，点击后关闭侧边栏
        if (isMobile) {
          toggleSidebar();
        }
      }
    };

    if (isMobile || isSidebarOpen) {
      return (
        <Button 
          className="w-full bg-transparent border border-gray-700 hover:bg-gray-800 transition-all justify-start px-4 text-foreground"
          onClick={handleNewConversation}
        >
          <Plus className="h-5 w-5 mr-2" />
          <span>开启新对话</span>
        </Button>
      );
    } else {
      return (
        <div className="flex justify-center">
          <div 
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
            onClick={handleNewConversation}
          >
            <Plus className="h-5 w-5 text-foreground stroke-[2.5]" />
          </div>
        </div>
      );
    }
  };

  // 处理对话选择
  const handleConversationSelect = (conversationId: string) => {
    if (onSelectConversation) {
      onSelectConversation(conversationId);
    }
    // 在移动端选择对话后关闭侧边栏
    if (isMobile) {
      toggleSidebar();
    }
  };

  return (
    <div
      className={`${sidebarContainerClasses} ${className}`}
      style={sidebarStyle}
    >
      <div className="flex flex-col h-full">
        {/* 侧边栏头部 */}
        <div className="flex items-center p-4 h-16 border-b border-muted">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? "收起侧边栏" : "展开侧边栏"}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* 新建聊天按钮 */}
        <div className="p-3">{renderNewChatButton()}</div>

        {/* 对话列表 */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <h3
              className={`text-xs text-foreground px-2 mb-2 ${
                isSidebarOpen || isMobile ? "block" : "hidden"
              }`}
            >
              近期对话
            </h3>
            <ul className="space-y-1">
              {conversations.map((conversation) => (
                <li key={conversation.id}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      selectedConversationId === conversation.id
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground"
                    } hover:text-foreground hover:bg-muted/50 ${
                      isSidebarOpen || isMobile ? "px-3" : "px-2"
                    }`}
                    onClick={() => handleConversationSelect(conversation.id)}
                  >
                    <MessageSquare className="h-5 w-5 mr-3" />
                    {(isSidebarOpen || isMobile) && (
                      <span className="truncate text-sm">
                        {conversation.title}
                      </span>
                    )}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 侧边栏底部 */}
        <div className="mt-auto border-t border-muted">
          <div className="p-2">
            <ul className="space-y-1">
              <li>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-foreground hover:text-foreground hover:bg-muted ${
                    isSidebarOpen || isMobile ? "px-3" : "px-2"
                  }`}
                >
                  <History className="h-5 w-5 mr-3" />
                  {(isSidebarOpen || isMobile) && (
                    <span className="text-sm">历史记录</span>
                  )}
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-foreground hover:text-foreground hover:bg-muted ${
                    isSidebarOpen || isMobile ? "px-3" : "px-2"
                  }`}
                >
                  <Sparkles className="h-5 w-5 mr-3" />
                  {(isSidebarOpen || isMobile) && (
                    <span className="text-sm">小应用</span>
                  )}
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-foreground hover:text-foreground hover:bg-muted ${
                    isSidebarOpen || isMobile ? "px-3" : "px-2"
                  }`}
                >
                  <Settings className="h-5 w-5 mr-3" />
                  {(isSidebarOpen || isMobile) && (
                    <span className="text-sm">设置</span>
                  )}
                </Button>
              </li>
              <li>
                <div
                  className={`flex items-center ${
                    isSidebarOpen || isMobile
                      ? "px-3 py-2"
                      : "justify-center py-2"
                  }`}
                >
                  {(isSidebarOpen || isMobile) && (
                    <span className="text-sm text-muted-foreground mr-auto">
                      主题切换
                    </span>
                  )}
                  <ThemeToggle />
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
