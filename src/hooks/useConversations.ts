import { useState, useEffect } from "react";
import { LocalConversation } from "@/data/mockData";
import {
  getUserConversations,
  createConversation,
} from "@/services/conversationService";

interface UseConversationsOptions {
  userId: string;
  initialConversations?: LocalConversation[];
}

/**
 * 自定义钩子，用于管理对话列表和当前选中的对话
 */
export function useConversations({
  userId,
  initialConversations = [],
}: UseConversationsOptions) {
  const [conversations, setConversations] =
    useState<LocalConversation[]>(initialConversations);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载对话列表
  const loadConversations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const loadedConversations = await getUserConversations(userId);
      setConversations(loadedConversations);

      // 如果有对话，默认选择第一个
      if (loadedConversations.length > 0 && !selectedConversationId) {
        setSelectedConversationId(loadedConversations[0].id);
      }
    } catch (err) {
      console.error("加载对话列表错误:", err);
      setError(err instanceof Error ? err.message : "加载对话列表失败");
    } finally {
      setIsLoading(false);
    }
  };

  // 创建新对话
  const addConversation = async (title: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const newConversation = await createConversation(userId, title);
      setConversations((prev) => [newConversation, ...prev]);
      setSelectedConversationId(newConversation.id);
      return newConversation;
    } catch (err) {
      console.error("创建对话错误:", err);
      setError(err instanceof Error ? err.message : "创建对话失败");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // 选择对话
  const selectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  // 初始加载对话列表
  useEffect(() => {
    if (userId) {
      loadConversations();
    }
  }, [userId]);

  return {
    conversations,
    selectedConversationId,
    isLoading,
    error,
    loadConversations,
    addConversation,
    selectConversation,
    setConversations,
  };
}
