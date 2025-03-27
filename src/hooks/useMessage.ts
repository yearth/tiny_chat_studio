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

// 发送用户消息的参数接口
interface SendUserMessageParams {
  content: string;
  modelId?: string;
}

// 获取 AI 响应的参数接口
interface FetchAIResponseParams {
  modelId?: string;
}

interface UseMessageResult {
  messages: Message[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  fetchMessages: (chatId: string) => Promise<void>;
  sendUserMessage: (params: SendUserMessageParams) => Promise<Message>;
  fetchAIResponse: (params?: FetchAIResponseParams) => Promise<void>;
  abortFetchAIResponse: () => void; // 新增中止 AI 响应的函数
  isSendingUserMessage: boolean;
  isFetchingAIResponse: boolean;
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
  onStreamChunk?: (chunk: string) => void,
  abortSignal?: AbortSignal
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
    signal: abortSignal, // 添加中止信号
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

      try {
        while (true) {
          // 检查是否已中止
          if (abortSignal?.aborted) {
            reader.cancel();
            break;
          }
          
          const { done, value } = await reader.read();
          if (done) break;
          
          // 再次检查是否已中止
          if (abortSignal?.aborted) {
            reader.cancel();
            break;
          }

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
      } catch (error) {
        // 如果是中止错误，静默处理
        if (error instanceof DOMException && error.name === 'AbortError') {
          console.log('流式响应已被用户中止');
        } else {
          throw error; // 重新抛出其他错误
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
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  
  // 中止控制器状态
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // 1. 发送用户消息的 mutation
  const { 
    mutateAsync: sendUserMessageMutation, 
    isPending: isSendingUserMessage 
  } = useMutation({
    mutationFn: async ({ content, modelId }: SendUserMessageParams): Promise<Message> => {
      if (!chatId) throw new Error("聊天 ID 不能为空");

      // 保存用户消息到数据库
      const userMessage = await saveMessage(chatId, {
        content,
        role: "user",
        modelId,
      });

      // 执行乐观更新，将用户消息添加到本地缓存
      queryClient.setQueryData(
        [QueryKeys.MESSAGES, chatId],
        (oldData: Message[] = []) => {
          return [...oldData, userMessage];
        }
      );

      return userMessage;
    },
  });

  // 2. 获取 AI 响应的 mutation
  const { 
    mutateAsync: fetchAIResponseMutation, 
    isPending: isFetchingAIResponse 
  } = useMutation({
    mutationFn: async ({ modelId }: FetchAIResponseParams = {}) => {
      if (!chatId) throw new Error("聊天 ID 不能为空");

      // 从缓存中获取当前消息列表（包括刚刚添加的用户消息）
      const currentMessages = queryClient.getQueryData<Message[]>(
        [QueryKeys.MESSAGES, chatId]
      ) || [];

      // 设置流式状态
      const tempStreamingId = `streaming-${Date.now()}`;
      setStreamingMessageId(tempStreamingId);
      setStreamingContent("");
      
      // 创建新的中止控制器
      const controller = new AbortController();
      setAbortController(controller);

      // 处理流式响应的回调
      const handleStreamChunk = (chunk: string) => {
        setStreamingContent((prev) => prev + chunk);
      };

      try {
        // 发送消息给 AI 并获取响应
        await sendMessageToAI(
          currentMessages,
          chatId,
          modelId,
          handleStreamChunk,
          controller.signal // 传递中止信号
        );

        // 刷新消息列表以获取 AI 响应
        // 由于 AI 响应已经通过 API 保存到数据库，我们只需要刷新查询
        await queryClient.invalidateQueries({
          queryKey: [QueryKeys.MESSAGES, chatId],
        });
      } catch (error) {
        // 特别处理中止错误
        if (error instanceof DOMException && error.name === 'AbortError') {
          console.log('AI 响应已被用户中止');
        } else {
          console.error("获取 AI 响应失败:", error);
          throw error;
        }
      } finally {
        // 无论成功与否，都重置流式状态和中止控制器
        setStreamingMessageId(null);
        setStreamingContent("");
        setAbortController(null);
      }
    },
  });

  // 封装 sendUserMessage 函数，返回保存的用户消息
  const sendUserMessage = async (params: SendUserMessageParams): Promise<Message> => {
    return await sendUserMessageMutation(params);
  };

  // 封装 fetchAIResponse 函数
  const fetchAIResponse = async (params: FetchAIResponseParams = {}): Promise<void> => {
    await fetchAIResponseMutation(params);
  };
  
  // 封装中止 AI 响应的函数
  const abortFetchAIResponse = () => {
    if (abortController) {
      abortController.abort();
      // 不在这里设置 abortController 为 null，因为这会在 mutation 的 finally 块中处理
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
    sendUserMessage,
    fetchAIResponse,
    abortFetchAIResponse, // 添加中止函数
    isSendingUserMessage,
    isFetchingAIResponse,
    streamingMessageId,
    streamingContent,
  };
}
