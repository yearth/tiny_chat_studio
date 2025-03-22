import { useRef, useEffect } from "react";
import { User, Bot } from "lucide-react";
import { LocalMessage } from "@/data/mockData";
import { MessageWithThinking } from "./message-with-thinking";
import { Skeleton } from "@/components/ui/skeleton";

interface MessageListProps {
  messages: LocalMessage[];
  streamingMessageId?: string | null;
}

/**
 * 消息列表组件
 * 显示用户和AI的消息，并自动滚动到最新消息
 */
export function MessageList({
  messages,
  streamingMessageId,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 当消息更新时，滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 flex justify-center">
      <div className="max-w-3xl w-full">
        {messages.map((message) => (
          <div key={message.id} className="mb-6">
            <div className="flex items-start">
              <div className="mr-4 mt-1">
                {message.role === "user" ? (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                    <Bot className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium mb-1">
                  {message.role === "user" ? "You" : "Gemini"}
                </div>
                {message.role === "assistant" &&
                message.content.includes("**思考过程**:") ? (
                  <MessageWithThinking content={message.content} />
                ) : (
                  <div className="text-sm">
                    {message.content}
                    {/* 如果这是正在流式的消息，显示闪烁光标 */}
                    {streamingMessageId === message.id && message.content && (
                      <span className="ml-1 animate-pulse">▌</span>
                    )}
                    {/* 如果这是正在流式的消息但内容为空，显示加载骨架屏 */}
                    {streamingMessageId === message.id && !message.content && (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
