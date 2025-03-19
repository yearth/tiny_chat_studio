import { useState, useEffect } from "react";
import { sendChatMessage } from "@/services/chatService";
import {
  getConversationMessages,
  saveMessageToConversation,
} from "@/services/conversationService";
import { ChatMessage, MessageRole, convertToFrontendMessage } from "@/types/prisma";

interface UseChatOptions {
  initialMessages?: ChatMessage[];
  conversationId?: string | null;
}

/**
 * 自定义钩子，用于管理聊天消息和发送消息
 */
export function useChat({
  initialMessages = [],
  conversationId = null,
}: UseChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 当对话ID变化时，加载该对话的消息
  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
    } else {
      // 如果没有对话ID，清空消息列表
      setMessages([]);
    }
  }, [conversationId]);

  // 加载特定对话的消息
  const loadMessages = async (convId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const dbMessages = await getConversationMessages(convId);
      console.log(
        "🔍 ~ useChat ~ src/hooks/useChat.ts:35 ~ loadedMessages:",
        dbMessages
      );
      // 将数据库消息转换为前端消息格式
      const frontendMessages = dbMessages.map(convertToFrontendMessage);
      setMessages(frontendMessages);
    } catch (err) {
      console.error("加载消息错误:", err);
      setError(err instanceof Error ? err.message : "加载消息失败");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 发送消息并处理响应
   */
  const sendMessage = async (content: string, modelId: string) => {
    if (!content.trim()) return;

    setError(null);
    setIsLoading(true);

    // 创建用户消息
    const userMessage: ChatMessage = {
      id: `temp-user-${Date.now()}`, // 临时ID，实际保存时会由数据库生成
      content,
      role: "user" as MessageRole,
      createdAt: new Date(),
    };

    // 添加用户消息到列表
    setMessages((prev) => [...prev, userMessage]);

    try {
      // 如果有对话ID，保存消息到数据库
      if (conversationId) {
        const savedMsg = await saveMessageToConversation(conversationId, {
          content: userMessage.content,
          role: userMessage.role
        });
        
        // 将保存的消息转换为前端消息格式
        const savedUserMessage = convertToFrontendMessage(savedMsg);
        
        // 替换临时消息为保存的消息
        setMessages(prev => 
          prev.map(msg => msg.id === userMessage.id ? savedUserMessage : msg)
        );
      }

      // 发送消息到API
      const response = await sendChatMessage(
        [...messages, userMessage],
        modelId
      );

      // 创建AI响应消息
      const aiMessage: ChatMessage = {
        id: `temp-assistant-${Date.now()}`, // 临时ID
        content: response.message,
        role: "assistant" as MessageRole,
        createdAt: new Date(),
      };

      // 添加AI响应到消息列表
      setMessages((prev) => [...prev, aiMessage]);

      // 如果有对话ID，保存AI响应到数据库
      if (conversationId) {
        const savedMsg = await saveMessageToConversation(conversationId, {
          content: aiMessage.content,
          role: aiMessage.role
        });
        
        // 将保存的消息转换为前端消息格式
        const savedAiMessage = convertToFrontendMessage(savedMsg);
        
        // 替换临时消息为保存的消息
        setMessages(prev => 
          prev.map(msg => msg.id === aiMessage.id ? savedAiMessage : msg)
        );
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError(err instanceof Error ? err.message : "发送消息时出现错误");

      // 创建错误消息
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        content: "抱歉，发送消息时出现错误。请稍后再试。",
        role: "assistant" as MessageRole,
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
    loadMessages,
  };
}
