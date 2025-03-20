import { AIModel } from "@/types/chat";

// 可用的AI模型列表
export const availableModels: AIModel[] = [
  { 
    id: "deepseek/deepseek-chat:free", 
    name: "Deepseek V3 (OpenRouter)",
    provider: "openrouter",
    modelId: "deepseek/deepseek-chat:free",
    isActive: true
  },
  { 
    id: "deepseek-r1", 
    name: "DeepSeek R1",
    provider: "deepseek",
    modelId: "deepseek-r1",
    isActive: true
  },
  { 
    id: "qwen-qwq-plus", 
    name: "通义千问-QwQ-Plus",
    provider: "alibaba",
    modelId: "qwen-qwq-plus",
    isActive: true
  },
  { 
    id: "gpt-3.5-turbo", 
    name: "GPT-3.5 Turbo",
    provider: "openai",
    modelId: "gpt-3.5-turbo",
    isActive: true
  },
  { 
    id: "gpt-4", 
    name: "GPT-4",
    provider: "openai",
    modelId: "gpt-4",
    isActive: true
  },
];

// 获取默认模型
export const getDefaultModel = (): AIModel => {
  return availableModels[0];
};

// 根据ID获取模型
export const getModelById = (id: string): AIModel | undefined => {
  return availableModels.find(model => model.id === id);
};
