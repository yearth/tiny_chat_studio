import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Chat } from "@prisma/client";
import { QueryKeys } from "@/constants/queryKeys";

// 获取用户聊天列表的函数
const fetchUserChats = async (userId: string): Promise<Chat[]> => {
  if (!userId) return [];

  const response = await fetch(`/api/chats?userId=${userId}`);
  if (!response.ok) {
    throw new Error(`获取聊天列表失败: ${response.statusText}`);
  }

  const data = await response.json();
  return data.chats || [];
};

// 创建新聊天的函数
const createChat = async (userId: string, title?: string): Promise<Chat> => {
  if (!userId) throw new Error("缺少用户ID参数");

  const response = await fetch(`/api/chats`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, title }),
  });

  if (!response.ok) {
    throw new Error(`创建聊天失败: ${response.statusText}`);
  }

  const data = await response.json();
  return data.chat;
};

interface UseChatResult {
  chats: Chat[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  fetchChats: (userId: string) => Promise<void>;
  addChat: (title?: string) => Promise<Chat>;
  isAddingChat: boolean;
}

export function useChat(userId?: string): UseChatResult {
  const queryClient = useQueryClient();

  const {
    data: chats = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [QueryKeys.CHATS, userId],
    queryFn: () => fetchUserChats(userId || ""),
    enabled: !!userId,
  });

  // 为了保持与原有 API 兼容，提供 fetchChats 方法
  const fetchChats = async (newUserId: string) => {
    if (newUserId !== userId) {
      // 如果传入的 userId 与当前不同，则使用新的 userId 重新获取数据
      await queryClient.fetchQuery({
        queryKey: [QueryKeys.CHATS, newUserId],
        queryFn: () => fetchUserChats(newUserId),
      });
    } else {
      // 否则刷新当前查询
      await refetch();
    }
  };

  // 添加创建聊天的 mutation
  const {
    mutateAsync: addChat,
    isPending: isAddingChat,
  } = useMutation({
    mutationKey: [QueryKeys.ADD_CHAT, userId],
    mutationFn: async (title?: string) => {
      const newChat = await createChat(userId || "", title);
      return newChat;
    },
    onSuccess: () => {
      // 创建成功后刷新聊天列表
      queryClient.invalidateQueries({ queryKey: [QueryKeys.CHATS, userId] });
    },
  });

  return {
    chats,
    isLoading,
    error: error as Error | null,
    refetch: async () => {
      await refetch();
    },
    fetchChats,
    addChat,
    isAddingChat,
  };
}
