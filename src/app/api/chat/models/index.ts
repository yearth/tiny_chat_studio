import { AIMessage } from "../utils/types";
import { logToConsole } from "../utils/logger";
import { generateDeepSeekResponse } from "./deepseek";
import { generateOpenAIResponse } from "./openai";
import { generateQwenResponse } from "./qwen";
import {
  generateOpenRouterResponse,
  generateOpenRouterStreamResponse,
} from "./openrouter";

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
  } else if (modelId.includes("deepseek/deepseek-chat:free")) {
    console.log("enter v3");
    // OpenRouter Deepseek 模型
    return generateOpenRouterResponse(messages, modelId);
  } else {
    // 默认模拟响应
    logToConsole(`Using mock response for model: ${modelId}`);
    await new Promise((resolve) => setTimeout(resolve, 500)); // 模拟延迟
    return `这是对"${lastUserMessage.content}"的模拟响应。模型 ${modelId} 尚未实现实际API调用。`;
  }
}

/**
 * 流式生成响应的生成器函数
 * @param messages 消息列表
 * @param modelId 模型ID
 * @yields 生成的响应文本片段
 */
export async function* generateStreamResponse(
  messages: AIMessage[],
  modelId: string
): AsyncGenerator<string> {
  // 获取用户最后一条消息
  const lastUserMessage = messages[messages.length - 1];

  logToConsole("Streaming response for model:", modelId);

  // 由于我们还没有实现真正的流式API调用，这里使用模拟的流式响应
  // 在实际实现中，应该调用各个模型的流式API

  // 模拟的响应文本
  let fullResponse = "";

  if (modelId === "deepseek-r1") {
    fullResponse = await generateDeepSeekResponse(messages, modelId);
  } else if (modelId === "gpt-3.5-turbo" || modelId === "gpt-4") {
    fullResponse = await generateOpenAIResponse(messages, modelId);
  } else if (modelId === "qwen-qwq-plus") {
    fullResponse = await generateQwenResponse(messages, modelId);
  } else if (modelId.includes("deepseek/deepseek-chat:free")) {
    // 对于 OpenRouter 模型，我们直接使用流式 API
    // 这里只有当没有使用流式时才会执行到，所以保留这个回退方案
    fullResponse = await generateOpenRouterResponse(messages, modelId);
  } else {
    fullResponse = `这是对"${lastUserMessage.content}"的模拟流式响应。模型 ${modelId} 尚未实现实际API调用。`;
  }

  // 如果是 OpenRouter Deepseek 模型，使用真正的流式 API
  if (modelId.includes("deepseek/deepseek-chat:free")) {
    logToConsole("Using real streaming for OpenRouter");
    for await (const chunk of generateOpenRouterStreamResponse(
      messages,
      modelId
    )) {
      yield chunk;
    }
    return; // 结束生成器函数
  }

  // 对于其他模型，将完整响应分成小块，模拟流式输出
  const chunks = fullResponse.split(" ");

  for (const word of chunks) {
    // 添加随机延迟，模拟真实的流式输出
    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * 50 + 10)
    );
    yield word + " ";
  }
}
