import { AIModel } from "@/types/chat";

// 可用的AI模型列表
export const availableModels: AIModel[] = [
  {
    id: "deepseek/deepseek-chat-v3-0324:free",
    name: "Deepseek V3",
    provider: "openrouter",
    modelId: "deepseek/deepseek-chat-v3-0324:free",
    isActive: true,
  },
  {
    id: "qwen-qwq-plus",
    name: "通义千问-QwQ-Plus",
    provider: "alibaba",
    modelId: "qwen-qwq-plus",
    isActive: true,
  },
];

// 获取默认模型
export const getDefaultModel = (): AIModel => {
  return availableModels[0];
};

// 根据ID获取模型
export const getModelById = (id: string): AIModel | undefined => {
  return availableModels.find((model) => model.id === id);
};
