import { useRef, useEffect } from "react";
import { User, Bot } from "lucide-react";
import { LocalMessage } from "@/data/mockData";
import { MessageWithThinking } from "./MessageWithThinking";

interface MessageListProps {
  messages: LocalMessage[];
}

/**
 * 消息列表组件
 * 显示用户和AI的消息，并自动滚动到最新消息
 */
export function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 当消息更新时，滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-3xl mx-auto">
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
                  <div className="text-sm">{message.content}</div>
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
