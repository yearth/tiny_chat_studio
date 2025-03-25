"use client";

import { EnhancedChatInput } from "@/components/chat/enhanced-chat-input";
import { MessageList } from "@/components/chat/message-list";
import { use } from "react";

export default function ChatPage({ params }: { params: any }) {
  const resolvedParams =
    typeof params === "object" && !("then" in params) ? params : use(params);
  const chatId = resolvedParams.chatId;

  return (
    <div className="flex-1 flex flex-col h-full bg-background text-foreground">
      {/* 聊天内容区域 - 使用原生滚动并美化滚动条 */}
      <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
        <div className="max-w-3xl mx-auto pt-4 pb-4">
          <MessageList
            messages={[]}
            streamingMessageId={null}
            currentModelId={""}
            conversationId={chatId || undefined}
            className=""
          />
        </div>
      </div>

      {/* 输入区域 - 使用sticky定位固定在底部 */}
      <div className="sticky bottom-0 left-0 right-0 w-full bg-background/80 backdrop-blur-sm py-4">
        <div className="max-w-3xl mx-auto px-8">
          <EnhancedChatInput onSendMessage={() => Promise.resolve()} />
        </div>
      </div>
    </div>
  );
}
