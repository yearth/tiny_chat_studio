import { Message } from "@/types/chat";

interface ChatRequest {
  messages: {
    role: string;
    content: string;
  }[];
  modelId: string;
  conversationId?: string;
}

interface ChatResponse {
  message: string;
  conversationId?: string;
}

/**
 * 发送聊天消息到API
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
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      modelId,
      ...(conversationId && { conversationId }),
    } as ChatRequest),
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return await response.json();
}
