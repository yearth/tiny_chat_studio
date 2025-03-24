import React from "react";
import { EnhancedChatInput } from "../chat/enhanced-chat-input";

interface DesktopLayoutProps {
  children: React.ReactNode;
}

export function DesktopLayout({ children }: DesktopLayoutProps) {
  // 将子组件内容拆分为聊天内容和输入区域
  // 假设子组件是一个数组，第一个元素是聊天内容，第二个元素是输入区域
  const childrenArray = React.Children.toArray(children);
  const chatContent = childrenArray[0];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* 聊天内容区域 */}
      <div className="flex-1 overflow-y-auto pb-24">{chatContent}</div>

      {/* 输入区域 - 固定在底部 */}
      <div className="sticky bottom-10 w-full bg-background/80 backdrop-blur-sm py-4">
        <div className="container max-w-4xl mx-auto px-4">
          <EnhancedChatInput onSendMessage={() => Promise.resolve()} />
        </div>
      </div>
    </div>
  );
}
