import OpenAI from "openai";
import { Message } from "@/types/chat";
import { OpenRouterClient } from "./ai/clients/openrouter";

// Initialize OpenAI client
const getOpenAIClient = (apiKey: string) => {
  return new OpenAI({
    apiKey: apiKey,
  });
};

// Convert our app's message format to OpenAI's format
const formatMessagesForOpenAI = (messages: Message[]) => {
  return messages.map((message) => ({
    role: message.role,
    content: message.content,
  }));
};

// Function to generate chat completion using OpenAI
export async function generateOpenAICompletion(
  messages: Message[],
  apiKey: string,
  model: string = "gpt-3.5-turbo"
) {
  const openai = getOpenAIClient(apiKey);

  try {
    const formattedMessages = formatMessagesForOpenAI(messages);

    const response = await openai.chat.completions.create({
      model: model,
      messages: formattedMessages,
      stream: true,
    });

    return response;
  } catch (error) {
    console.error("Error generating OpenAI completion:", error);
    throw error;
  }
}

// Function to generate chat completion using OpenRouter
export async function generateOpenRouterCompletion(
  messages: Message[],
  apiKey: string,
  model: string = "deepseek/deepseek-chat:free"
) {
  const openRouter = new OpenRouterClient(apiKey);

  try {
    const formattedMessages = formatMessagesForOpenAI(messages); // 复用同样的格式化函数

    // OpenRouter 不支持流式响应，所以我们需要手动实现类似的接口
    const response = await openRouter.chat(formattedMessages, {
      model: model,
    });

    // 创建一个类似于 OpenAI 流式响应的对象
    const streamResponse = {
      async *[Symbol.asyncIterator]() {
        // 只返回一个完整的响应
        yield {
          choices: [{
            delta: {
              content: response.content,
            },
          }],
        };
      },
    };

    return streamResponse;
  } catch (error) {
    console.error("Error generating OpenRouter completion:", error);
    throw error;
  }
}

// Function to handle different AI providers
export async function generateAIResponse(
  messages: Message[],
  provider: string,
  modelId: string,
  apiKey: string
) {
  switch (provider.toLowerCase()) {
    case "openai":
      return generateOpenAICompletion(messages, apiKey, modelId);
    case "openrouter":
      return generateOpenRouterCompletion(messages, apiKey, modelId);
    // Add more providers as needed
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}
