import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";
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

// 发送消息的参数接口
interface SendMessageParams {
  content: string;
  modelId?: string;
}

interface UseMessageResult {
  messages: Message[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  fetchMessages: (chatId: string) => Promise<void>;
  sendMessage: (params: SendMessageParams) => Promise<void>;
  isSending: boolean;
  streamingMessageId: string | null;
  streamingContent: string;
}

// 保存单条消息到数据库
export const saveMessage = async (
  chatId: string,
  message: { content: string; role: string; modelId?: string }
): Promise<Message> => {
  const response = await fetch(`/api/chat/${chatId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error(`保存消息失败: ${response.statusText}`);
  }

  const data = await response.json();
  console.log("🔍 ~  ~ src/hooks/useMessage.ts:52 ~ data:", data);
  return data.message;
};

// 发送消息给 AI 模型并获取响应
const sendMessageToAI = async (
  messages: Message[],
  chatId: string,
  modelId?: string,
  onStreamChunk?: (chunk: string) => void
) => {
  // 将消息格式化为 AI API 所需的格式
  const formattedMessages = messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
    modelId: msg.modelId,
  }));

  // 调用 AI API
  const response = await fetch(`/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: formattedMessages,
      chatId,
      modelId,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI 响应失败: ${response.statusText}`);
  }

  // 如果提供了流式处理回调，则处理流式响应
  if (
    onStreamChunk &&
    response.headers.get("Content-Type")?.includes("text/event-stream")
  ) {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (reader) {
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") return response;

            try {
              const parsed = JSON.parse(data);
              if (parsed.chunk) {
                onStreamChunk(parsed.chunk);
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          }
        }
      }
    }
  }

  return response;
};

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

  // 流式消息状态
  const [streamingContent, setStreamingContent] = useState<string>("");
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null
  );

  // 发送消息的 mutation
  const { mutateAsync, isPending: isSending } = useMutation({
    mutationFn: async ({ content, modelId }: SendMessageParams) => {
      if (!chatId) throw new Error("聊天 ID 不能为空");

      // 1. 先保存用户消息到数据库
      const userMessage = await saveMessage(chatId, {
        content,
        role: "user",
        modelId,
      });

      // 2. 更新本地消息列表（乐观更新）
      queryClient.setQueryData(
        [QueryKeys.MESSAGES, chatId],
        (oldData: Message[] = []) => {
          return [...oldData, userMessage];
        }
      );

      // 创建一个流式消息 ID
      const tempStreamingId = `streaming-${Date.now()}`;
      setStreamingMessageId(tempStreamingId);
      setStreamingContent("");

      // 3. 发送消息给 AI 并获取响应
      // 注意：这里我们需要包含新添加的用户消息
      const updatedMessages = [...messages, userMessage];

      // 处理流式响应的回调
      const handleStreamChunk = (chunk: string) => {
        setStreamingContent((prev: string) => prev + chunk);
      };

      await sendMessageToAI(
        updatedMessages,
        chatId,
        modelId,
        handleStreamChunk
      );

      // 重置流式状态
      setStreamingMessageId(null);
      setStreamingContent("");

      // 4. 刷新消息列表以获取 AI 响应
      // 由于 AI 响应已经通过 API 保存到数据库，我们只需要刷新查询
      await queryClient.invalidateQueries({
        queryKey: [QueryKeys.MESSAGES, chatId],
      });
    },
  });

  // 封装 sendMessage 函数，确保返回类型为 Promise<void>
  const sendMessage = async (params: SendMessageParams): Promise<void> => {
    await mutateAsync(params);
  };

  return {
    messages,
    isLoading,
    error: error as Error | null,
    refetch: async () => {
      await refetch();
    },
    fetchMessages,
    sendMessage,
    isSending,
    streamingMessageId,
    streamingContent,
  };
}
