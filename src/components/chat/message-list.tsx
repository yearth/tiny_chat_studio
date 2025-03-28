import React, { useState, useEffect } from "react";
import { Copy, Check, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MessageBubble } from "./message-bubble";
import { cn } from "@/lib/utils";

interface Message {
  role: string;
  content: string;
  timestamp?: string;
  id?: string;
}

interface MessageListProps {
  messages: Message[];
  isPreview?: boolean;
  maxContentLength?: number;
  streamingMessageId: string | null;
  currentModelId?: string;
  conversationId?: string;
  className?: string;
  isFetchingAIResponse?: boolean;
  aiFetchStartTime?: number | null;
}

export function MessageList({
  messages,
  isPreview = false,
  maxContentLength = 300,
  streamingMessageId,
  currentModelId,
  conversationId,
  className,
  isFetchingAIResponse = false,
  aiFetchStartTime = null,
}: MessageListProps) {
  // 用于跟踪哪些消息已被复制
  const [copiedMessageIds, setCopiedMessageIds] = useState<
    Record<string, boolean>
  >({});

  // 计时器状态
  const [elapsedTime, setElapsedTime] = useState<string>("0.0s");

  // 复制消息内容到剪贴板
  const copyMessageContent = async (
    content: string,
    messageId: string | undefined
  ) => {
    try {
      await navigator.clipboard.writeText(content);

      // 设置复制状态，2秒后恢复
      if (messageId) {
        setCopiedMessageIds((prev) => ({ ...prev, [messageId]: true }));
        setTimeout(() => {
          setCopiedMessageIds((prev) => ({ ...prev, [messageId]: false }));
        }, 2000);
      }
    } catch (error) {
      console.error("复制失败:", error);
    }
  };

  // 为消息生成唯一ID（如果没有提供）
  const getMessageId = (message: Message, index: number) => {
    return message.id || `msg-${index}`;
  };

  // 为消息生成唯一的 React key，确保即使 ID 相同也有不同的渲染键
  const getMessageKey = (message: Message, index: number) => {
    // 将消息的 ID 和索引结合，确保唯一性
    return `${getMessageId(message, index)}-pos-${index}`;
  };

  // 计时器效果
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    // 只有当满足以下条件时才启动计时器：
    // 1. 正在获取 AI 响应 (isFetchingAIResponse 为 true)
    // 2. 有流式消息 ID (streamingMessageId 不为 null)
    // 3. 有开始时间 (aiFetchStartTime 不为 null)
    // 4. 流式内容为空 (等待第一个数据块)
    const shouldShowTimer =
      isFetchingAIResponse &&
      streamingMessageId !== null &&
      aiFetchStartTime !== null &&
      messages.some((m) => m.id === streamingMessageId && m.content === "");

    if (shouldShowTimer && aiFetchStartTime) {
      // 每 100 毫秒更新一次计时器
      intervalId = setInterval(() => {
        const elapsed = (Date.now() - aiFetchStartTime) / 1000;
        setElapsedTime(`${elapsed.toFixed(1)}s`);
      }, 100);
    }

    // 清理函数
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isFetchingAIResponse, streamingMessageId, aiFetchStartTime, messages]);

  return (
    <ScrollArea className={cn("h-full w-full", className)}>
      <div className="flex flex-col space-y-8">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            开始新的对话吧
          </div>
        ) : (
          messages.map((message, index) => {
            const messageId = getMessageId(message, index);
            const isStreaming = streamingMessageId === messageId;
            const isCopied = copiedMessageIds[messageId];

            return (
              <div key={getMessageKey(message, index)} className="space-y-2">
                {/* 发送者标识 */}
                <div
                  className={`text-sm font-medium text-muted-foreground ${
                    message.role === "user" ? "text-right" : ""
                  }`}
                >
                  {message.role === "user" ? "您" : "AI"}
                </div>

                {/* 消息气泡 */}
                <MessageBubble
                  content={
                    isPreview && message.content.length > maxContentLength
                      ? `${message.content.substring(0, maxContentLength)}...`
                      : message.content
                  }
                  isUser={message.role === "user"}
                  timestamp={message.timestamp}
                />

                {/* 等待 AI 响应的加载指示器和计时器 */}
                {!isPreview &&
                  message.role === "assistant" &&
                  message.id === streamingMessageId &&
                  message.content === "" &&
                  isFetchingAIResponse &&
                  aiFetchStartTime && (
                    <div className="flex items-center text-muted-foreground mt-2 ml-1">
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      <span className="text-xs">{elapsedTime}</span>
                    </div>
                  )}

                {/* 操作按钮（非预览模式下显示） */}
                {!isPreview && (
                  <div
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    } mt-2`}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-muted-foreground hover:text-foreground"
                      onClick={() =>
                        copyMessageContent(message.content, messageId)
                      }
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-3.5 w-3.5 mr-1" />
                          <span className="text-xs">已复制</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 mr-1" />
                          <span className="text-xs">复制</span>
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </ScrollArea>
  );
}
