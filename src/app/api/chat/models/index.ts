import { AIMessage } from "../utils/types";
import { logToConsole } from "../utils/logger";
import { generateDeepSeekResponse } from "./deepseek";
import { generateOpenAIResponse } from "./openai";
import { generateQwenResponse } from "./qwen";

/**
 * 根据模型生成响应的统一入口
 * @param messages 消息列表
 * @param modelId 模型ID
 * @returns 生成的响应文本
 */
export async function generateResponse(
  messages: AIMessage[],
  modelId: string
): Promise<string> {
  // 获取用户最后一条消息
  const lastUserMessage = messages[messages.length - 1];

  logToConsole("Last user message:", messages);
  logToConsole("Model ID:", modelId);

  // 根据不同的模型生成不同的响应
  if (modelId === "deepseek-r1") {
    return generateDeepSeekResponse(messages, modelId);
  } else if (modelId === "gpt-3.5-turbo" || modelId === "gpt-4") {
    return generateOpenAIResponse(messages, modelId);
  } else if (modelId === "qwen-qwq-plus") {
    return generateQwenResponse(messages, modelId);
  } else {
    // 默认模拟响应
    logToConsole(`Using mock response for model: ${modelId}`);
    await new Promise((resolve) => setTimeout(resolve, 500)); // 模拟延迟
    return `这是对"${lastUserMessage.content}"的模拟响应。模型 ${modelId} 尚未实现实际API调用。`;
  }
}
