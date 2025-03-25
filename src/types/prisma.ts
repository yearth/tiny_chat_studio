import { Message, AIModel } from "@prisma/client";

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
