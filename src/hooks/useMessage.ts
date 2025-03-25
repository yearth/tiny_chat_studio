import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Message } from "@prisma/client";
import { QueryKeys } from "@/constants/queryKeys";

// 获取特定聊天消息的函数
const fetchChatMessages = async (chatId: string): Promise<Message[]> => {
  if (!chatId) return [];

  const response = await fetch(`/api/chat/${chatId}/messages`);
  if (!response.ok) {
    throw new Error(`获取消息失败: ${response.statusText}`);
  }

  const data = await response.json();

  return data.messages || [];
};

interface UseMessageResult {
  messages: Message[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  fetchMessages: (chatId: string) => Promise<void>;
}

export function useMessage(chatId?: string): UseMessageResult {
  const queryClient = useQueryClient();

  const {
    data: messages = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [QueryKeys.MESSAGES, chatId],
    queryFn: () => fetchChatMessages(chatId || ""),
    enabled: !!chatId,
  });

  const fetchMessages = async (newChatId: string) => {
    if (newChatId !== chatId) {
      // 如果传入的 chatId 与当前不同，则使用新的 chatId 重新获取数据
      await queryClient.fetchQuery({
        queryKey: [QueryKeys.MESSAGES, newChatId],
        queryFn: () => fetchChatMessages(newChatId),
      });
    } else {
      // 否则刷新当前查询
      await refetch();
    }
  };

  return {
    messages,
    isLoading,
    error: error as Error | null,
    refetch: async () => {
      await refetch();
    },
    fetchMessages,
  };
}
