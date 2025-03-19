import { useState } from "react";
import { LocalMessage } from "@/data/mockData";
import { sendChatMessage } from "@/services/chatService";

interface UseChatOptions {
  initialMessages?: LocalMessage[];
}

/**
 * 自定义钩子，用于管理聊天消息和发送消息
 */
export function useChat({ initialMessages = [] }: UseChatOptions = {}) {
  const [messages, setMessages] = useState<LocalMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 发送消息并处理响应
   */
  const sendMessage = async (content: string, modelId: string) => {
    if (!content.trim()) return;
    
    setError(null);
    setIsLoading(true);
    
    // 创建用户消息
    const userMessage: LocalMessage = {
      id: `user-${Date.now()}`,
      content,
      role: "user",
      createdAt: new Date(),
    };
    
    // 添加用户消息到列表
    setMessages((prev) => [...prev, userMessage]);
    
    try {
      // 发送消息到API
      const response = await sendChatMessage(
        [...messages, userMessage],
        modelId
      );
      
      // 创建AI响应消息
      const aiMessage: LocalMessage = {
        id: `assistant-${Date.now()}`,
        content: response.message,
        role: "assistant",
        createdAt: new Date(),
      };
      
      // 添加AI响应到消息列表
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Error sending message:", err);
      setError(err instanceof Error ? err.message : "发送消息时出现错误");
      
      // 创建错误消息
      const errorMessage: LocalMessage = {
        id: `error-${Date.now()}`,
        content: "抱歉，发送消息时出现错误。请稍后再试。",
        role: "assistant",
        createdAt: new Date(),
      };
      
      // 添加错误消息到列表
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    messages,
    sendMessage,
    isLoading,
    error,
    setMessages,
  };
}
