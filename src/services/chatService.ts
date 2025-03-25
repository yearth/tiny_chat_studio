import { logToConsole } from "@/app/api/chat/utils/logger";
import { Message } from "@/types/chat";

interface ChatResponse {
  message: string;
  conversationId?: string;
}

interface StreamChunk {
  chunk: string;
  conversationId: string;
}

/**
 * 发送聊天消息到API（非流式）
 * @param messages 消息历史
 * @param modelId 模型ID
 * @param conversationId 可选的会话ID
 * @returns API响应
 */
export async function sendChatMessage(
  messages: Message[],
  modelId: string,
  conversationId?: string
): Promise<ChatResponse> {
  // 根据是否有对话 ID 选择不同的 API 路径
  const apiPath = conversationId
    ? `/api/chat/${conversationId}/messages`
    : "/api/chat";

  const response = await fetch(apiPath, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: {
        role: messages[messages.length - 1].role,
        content: messages[messages.length - 1].content,
        modelId,
      },
      ...(conversationId && { conversationId }),
    }),
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return await response.json();
}

/**
 * 发送聊天消息到API（流式响应）
 * @param messages 消息历史
 * @param modelId 模型ID
 * @param conversationId 可选的会话ID
 * @param onChunk 接收每个响应片段的回调函数
 * @returns 完整的响应文本
 */
export async function sendChatMessageStream(
  messages: Message[],
  modelId: string,
  onChunk: (chunk: string) => void,
  conversationId?: string
): Promise<string> {
  let fullResponse = "";
  let responseConversationId = conversationId;

  logToConsole("sendChatMessageStream messages", messages);
  logToConsole("sendChatMessageStream modelId", modelId);
  logToConsole("sendChatMessageStream conversationId", conversationId);
  try {
    // 根据是否有对话 ID 选择不同的 API 路径
    const apiPath = conversationId
      ? `/api/chat/${conversationId}/messages`
      : "/api/chat";

    const response = await fetch(apiPath, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          role: messages[messages.length - 1].role,
          content: messages[messages.length - 1].content,
          modelId,
        },
        ...(conversationId && { conversationId }),
      }),
    });

    logToConsole("sendChatMessageStream response", response);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    // 确保响应是可读流
    if (!response.body) {
      throw new Error("Response body is null");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // 解码二进制数据为文本
      const chunk = decoder.decode(value, { stream: true });

      // 处理SSE格式的数据
      const lines = chunk.split("\n\n");
      for (const line of lines) {
        if (!line.trim() || !line.startsWith("data: ")) continue;

        const data = line.replace("data: ", "").trim();

        // 检查是否是结束信号
        if (data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data) as StreamChunk;

          // 如果有会话ID，保存它
          if (parsed.conversationId) {
            responseConversationId = parsed.conversationId;
          }

          // 如果有内容块，处理它
          if (parsed.chunk) {
            fullResponse += parsed.chunk;
            onChunk(parsed.chunk);
          }
        } catch (e) {
          console.error("Error parsing SSE data:", e);
        }
      }
    }

    return fullResponse;
  } catch (error) {
    console.error("Error in stream request:", error);
    throw error;
  }
}
