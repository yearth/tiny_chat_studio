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
// 使用更通用的类型定义
type SimpleConversation = {
  id: string;
  title: string;
};

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

      {/* 侧边栏 */}
      <div
        className={`fixed z-20 h-full bg-background border-r border-gray-700 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "w-64" : "w-0 overflow-hidden"
        } ${!isSidebarOpen ? "-translate-x-full" : "translate-x-0"}`}
        style={{
          boxShadow: isSidebarOpen ? "0 0 15px rgba(0, 0, 0, 0.3)" : "none",
        }}
      >
        <div className="flex flex-col h-full">
          {/* 侧边栏头部 */}
          <div className="flex items-center p-4 h-16 border-b border-muted">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2"
              onClick={toggleSidebar}
              aria-label="收起侧边栏"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="font-medium">
              <div className="flex items-center">
                <span className="font-semibold">Gemini</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </div>
              <div className="text-xs text-muted-foreground">2.0 Beta</div>
            </div>
          </div>

          {/* 新建聊天按钮 */}
          <div className="p-3">
            <Button className="w-full bg-transparent border border-gray-700 hover:bg-gray-800 transition-all justify-start px-4">
              <Plus className="h-5 w-5 mr-2" />
              <span>开启新对话</span>
            </Button>
          </div>

          {/* 对话列表 */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              <h3 className="text-xs text-muted-foreground px-2 mb-2">
                近期对话
              </h3>
              <ul className="space-y-1">
                {conversations.map((conversation) => (
                  <li key={conversation.id}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start ${selectedConversationId === conversation.id ? "bg-muted text-foreground" : "text-muted-foreground"} hover:text-foreground hover:bg-muted/50 px-3`}
                      onClick={() => {
                        onSelectConversation && onSelectConversation(conversation.id);
                        // 在移动端选择对话后关闭侧边栏
                        toggleSidebar();
                      }}
                    >
                      <MessageSquare className="h-5 w-5 mr-3" />
                      <span className="truncate text-sm">
                        {conversation.title}
                      </span>
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
                    className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800 px-3"
                  >
                    <History className="h-5 w-5 mr-3" />
                    <span className="text-sm">历史记录</span>
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800 px-3"
                  >
                    <Sparkles className="h-5 w-5 mr-3" />
                    <span className="text-sm">小应用</span>
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800 px-3"
                  >
                    <Settings className="h-5 w-5 mr-3" />
                    <span className="text-sm">设置</span>
                  </Button>
                </li>
                <li>
                  <div className="flex items-center px-3 py-2">
                    <span className="text-sm text-muted-foreground mr-auto">
                      主题切换
                    </span>
                    <ThemeToggle />
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

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
