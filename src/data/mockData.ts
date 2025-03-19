import { Message } from "@/types/chat";

// 本地消息类型，确保所有必需字段都有值
export interface LocalMessage extends Message {
  id: string;
  createdAt: Date;
}

// 本地对话类型
export interface LocalConversation {
  id: string;
  title: string;
  updatedAt: Date;
}

// 模拟对话数据
export const mockConversations: LocalConversation[] = [
  { id: "1", title: "计算机视觉分析器开发", updatedAt: new Date() },
  {
    id: "2",
    title: "Gemini Impact 如何写好写作提示词",
    updatedAt: new Date(),
  },
  { id: "3", title: "对比自然语言处理技术", updatedAt: new Date() },
  { id: "4", title: "Web+生成式AI的应用场景", updatedAt: new Date() },
  { id: "5", title: "PowerPoint制作工作汇报", updatedAt: new Date() },
];

// 模拟消息数据
export const mockMessages: LocalMessage[] = [
  {
    id: "system-1",
    content: "Yearth, 你好",
    role: "assistant",
    createdAt: new Date(),
  },
];
