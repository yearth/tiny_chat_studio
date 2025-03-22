import { Conversation, Message, AIModel } from "@prisma/client";

// 定义消息角色类型
export type MessageRole = "user" | "assistant" | "system";

// 在前端使用的消息类型
export interface ChatMessage {
  id: string;
  content: string;
  role: MessageRole;
  createdAt: Date;
  conversationId?: string; // 可选属性，允许临时消息没有这个字段
  modelInfo?: AIModel; // 可选属性，用于显示模型信息
}

// 将数据库消息转换为前端消息
export function convertToFrontendMessage(
  message: Message & { model?: AIModel }
): ChatMessage {
  return {
    id: message.id,
    content: message.content,
    role: message.role as MessageRole,
    createdAt: message.createdAt,
    conversationId: message.conversationId,
    modelInfo: message.model,
  };
}

// 带有消息的对话
export interface ConversationWithMessages extends Conversation {
  messages?: ChatMessage[];
}
