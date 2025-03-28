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
  abortFetchAIResponse: () => void; // 中止 AI 响应的函数
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

export function useMessage(chatId?: string): UseMessageResult {
  console.log("[useMessage Hook Execution] ChatId:", chatId);

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

  // 中止控制器状态
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  // 1. 发送用户消息的 mutation
  const {
    mutateAsync: sendUserMessageMutation,
    isPending: isSendingUserMessage,
  } = useMutation({
    mutationFn: async ({
      content,
      modelId,
    }: SendUserMessageParams): Promise<Message> => {
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
    isPending: isFetchingAIResponse,
  } = useMutation({
    mutationFn: async ({ modelId }: FetchAIResponseParams = {}) => {
      if (!chatId) throw new Error("聊天 ID 不能为空");

      // 从缓存中获取当前消息列表（包括刚刚添加的用户消息）
      const currentMessages =
        queryClient.getQueryData<Message[]>([QueryKeys.MESSAGES, chatId]) || [];

      // 生成临时ID用于占位消息，添加随机数确保唯一性
      const tempStreamingId = `streaming-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 10)}`;
      console.log(
        `[useMessage - Start Fetch] Generated tempStreamingId: ${tempStreamingId}`
      ); // <-- 新增日志

      // 立即在缓存中添加占位符消息对象
      queryClient.setQueryData(
        [QueryKeys.MESSAGES, chatId],
        (oldData: Message[] = []) => {
          console.log(
            "[useMessage - Add Placeholder] Before:",
            oldData.map((m) => ({
              id: m.id,
              content: m.content.slice(0, 10) + "...",
              isStreaming: (m as any).isStreaming,
            }))
          );
          const newData = [
            ...oldData,
            {
              id: tempStreamingId,
              role: "assistant",
              content: "",
              chatId,
              createdAt: new Date(),
              modelId: modelId || undefined,
              isStreaming: true, // 临时标记，表示这是一个正在流式传输的消息
            } as Message & { isStreaming?: boolean },
          ];
          console.log(
            "[useMessage - Add Placeholder] After:",
            newData.map((m) => ({
              id: m.id,
              content: m.content.slice(0, 10) + "...",
              isStreaming: (m as any).isStreaming,
            }))
          );
          return newData;
        }
      );

      // 设置流式状态（仍然保留这些状态以保持向后兼容）
      setStreamingMessageId(tempStreamingId);
      setStreamingContent("");

      // 创建新的中止控制器
      const controller = new AbortController();
      setAbortController(controller);

      try {
        // 将消息格式化为 AI API 所需的格式
        const formattedMessages = currentMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
          modelId: msg.modelId,
        }));

        // 直接调用 API 并获取流式响应，传递临时ID
        const response = await fetch(`/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: formattedMessages,
            chatId,
            modelId,
            tempId: tempStreamingId, // 发送临时ID给后端
          }),
          signal: controller.signal, // 传递中止信号
        });

        if (!response.ok) {
          throw new Error(`AI 响应失败: ${response.statusText}`);
        }

        // 处理 Vercel AI SDK 生成的标准 SSE 流
        if (response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          try {
            let buffer = "";
            let eventName = "";

            while (true) {
              // 检查是否已中止
              if (controller.signal.aborted) {
                reader.cancel();
                break;
              }

              const { done, value } = await reader.read();
              if (done) break;

              // 再次检查是否已中止
              if (controller.signal.aborted) {
                reader.cancel();
                break;
              }

              // 解码二进制数据
              const chunk = decoder.decode(value, { stream: true });
              buffer += chunk;

              // 处理 SSE 格式，支持事件名称和数据
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";

              for (const line of lines) {
                // 检查是否是事件行
                if (line.startsWith("event:")) {
                  eventName = line.substring("event:".length).trim();
                  continue;
                }

                // 检查是否是数据行
                if (line.startsWith("data:")) {
                  const data = line.substring("data:".length).trim();

                  // 处理 message_complete 事件
                  if (eventName === "message_complete") {
                    try {
                      // 解析最终消息数据
                      const finalMessageData = JSON.parse(data);
                      console.log(
                        "[useMessage - Complete Event] Received final data:",
                        finalMessageData
                      );

                      // 使用 setQueryData 更新缓存中的消息
                      queryClient.setQueryData(
                        [QueryKeys.MESSAGES, chatId],
                        (oldData: Message[] = []) => {
                          console.log(
                            "[useMessage - Replace Final] Before:",
                            oldData.map((m) => ({
                              id: m.id,
                              content: m.content.slice(0, 10) + "...",
                              isStreaming: (m as any).isStreaming,
                            }))
                          );
                          const newData = oldData.map((msg) => {
                            if (msg.id === finalMessageData.tempId) {
                              console.log(
                                `[useMessage - Replace Final] Replacing message with tempId: ${finalMessageData.tempId} with finalId: ${finalMessageData.id}`
                              );
                              return {
                                id: finalMessageData.id,
                                content: finalMessageData.content,
                                role: finalMessageData.role,
                                chatId,
                                modelId: finalMessageData.modelId,
                                createdAt: new Date(finalMessageData.createdAt),
                              } as Message;
                            }
                            return msg;
                          });
                          console.log(
                            "[useMessage - Replace Final] After:",
                            newData.map((m) => ({
                              id: m.id,
                              content: m.content.slice(0, 10) + "...",
                            }))
                          );
                          return newData;
                        }
                      );

                      // 重置事件名称
                      eventName = "";
                    } catch (error) {
                      console.error(
                        "解析 message_complete 事件数据失败:",
                        error
                      );
                    }
                    continue;
                  }

                  // 处理普通数据行（流式内容）
                  try {
                    // 调试原始数据
                    console.log("原始数据行:", data);

                    // 尝试解析 Vercel AI SDK 格式 (0:"text")
                    // 使用更精确的正则表达式，确保只提取引号内的内容
                    const match = data.match(/^(\d+:)"(.*)"$/);

                    if (match && match[2] !== undefined) {
                      // 调试提取的原始内容
                      console.log("正则提取的原始内容:", match[2]);

                      // 提取文本内容并处理转义字符
                      // 注意：使用 match[2] 而不是 match[1]，match[1] 是前缀 (0:)
                      let textChunk = match[2];

                      // 处理转义字符
                      textChunk = textChunk
                        .replace(/\\n/g, "\n")
                        .replace(/\\(.)/g, "$1");

                      console.log(
                        `[useMessage - Update Chunk] Received chunk for tempId ${tempStreamingId}:`,
                        textChunk.slice(0, 50) + "..."
                      );

                      // 调试最终处理后的文本内容
                      console.log(
                        "处理后的流式数据块:",
                        textChunk.length < 50
                          ? textChunk
                          : textChunk.substring(0, 50) + "..."
                      );

                      // 更新流式内容状态（用于向后兼容）
                      setStreamingContent((prev) => prev + textChunk);

                      // 更新缓存中的占位符消息
                      queryClient.setQueryData(
                        [QueryKeys.MESSAGES, chatId],
                        (oldData: Message[] = []) => {
                          return oldData.map((msg) => {
                            if (msg.id === tempStreamingId) {
                              return {
                                ...msg,
                                content: (msg.content || "") + textChunk,
                              };
                            }
                            return msg;
                          });
                        }
                      );
                    } else {
                      // 如果数据不符合预期格式，记录日志以便调试
                      console.warn("收到非标准格式的数据行:", data);
                    }
                  } catch (error) {
                    console.error("处理流式数据块失败:", error);
                  }

                  // 重置事件名称
                  eventName = "";
                }
              }
            }
          } catch (error) {
            // 特别处理中止错误
            if (error instanceof DOMException && error.name === "AbortError") {
              console.log("流式响应已被用户中止");
            } else {
              throw error; // 重新抛出其他错误
            }
          }
        }

        // 后端通过 onFinish 回调已经将完整响应保存到数据库
        // 但前端需要通过 invalidateQueries 刷新缓存以显示最新消息
      } catch (error) {
        // 特别处理中止错误
        if (error instanceof DOMException && error.name === "AbortError") {
          console.log("AI 响应已被用户中止");
        } else {
          console.error("获取 AI 响应失败:", error);
          throw error;
        }
      } finally {
        console.log("[useMessage - Finally] Entering finally block");
        // 清理前端流式状态
        setStreamingMessageId(null);
        setStreamingContent("");
        setAbortController(null);

        // 安全检查：移除任何可能残留的带有 isStreaming 标记的消息
        queryClient.setQueryData(
          [QueryKeys.MESSAGES, chatId],
          (oldData: Message[] = []) => {
            console.log(
              "[useMessage - Finally Cleanup] Before:",
              oldData.map((m) => ({
                id: m.id,
                content: m.content.slice(0, 10) + "...",
                isStreaming: (m as any).isStreaming,
              }))
            ); // <-- 新增日志
            const newData = oldData.filter(
              (msg) =>
                !(
                  msg.id === tempStreamingId &&
                  (msg as any).isStreaming === true
                )
            );
            console.log(
              "[useMessage - Finally Cleanup] After:",
              newData.map((m) => ({
                id: m.id,
                content: m.content.slice(0, 10) + "...",
                isStreaming: (m as any).isStreaming,
              }))
            ); // <-- 新增日志
            return newData;
          }
        );
        console.log("[useMessage - Finally] Exiting finally block"); // <-- 新增日志
      }
    },
  });

  // 封装 sendUserMessage 函数，返回保存的用户消息
  const sendUserMessage = async (
    params: SendUserMessageParams
  ): Promise<Message> => {
    return await sendUserMessageMutation(params);
  };

  // 封装 fetchAIResponse 函数
  const fetchAIResponse = async (
    params: FetchAIResponseParams = {}
  ): Promise<void> => {
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
    abortFetchAIResponse,
    isSendingUserMessage,
    isFetchingAIResponse,
    streamingMessageId,
    streamingContent,
  };
}
