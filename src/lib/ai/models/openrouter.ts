import { AIModel, AIModelConfig, AIMessage, AIResponse } from "../types";
import { OpenRouterClient } from "../clients/openrouter";

/**
 * OpenRouter Deepseek V3 模型实现
 */
export class OpenRouterDeepseekModel implements AIModel {
  config: AIModelConfig;
  private client: OpenRouterClient;

  constructor(config?: Partial<AIModelConfig>, apiKey?: string) {
    this.config = {
      id: "deepseek/deepseek-chat-v3-0324:free",
      name: "Deepseek V3",
      description: "OpenRouter 提供的 Deepseek V3 模型",
      maxTokens: 4096,
      apiType: "openrouter",
      isDefault: false,
      ...config,
    };

    this.client = new OpenRouterClient(apiKey);
  }

  /**
   * 发送消息到 OpenRouter API
   */
  async sendMessage(
    message: string,
    conversationId: string,
    history: AIMessage[] = []
  ): Promise<AIResponse> {
    // 转换历史消息为 OpenRouter 格式
    const formattedHistory = history.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // 添加当前消息
    const messages = [
      ...formattedHistory,
      { role: "user" as const, content: message },
    ];

    // 调用 OpenRouter API
    return this.client.chat(messages, {
      model: this.config.id,
      maxTokens: this.config.maxTokens,
    });
  }
}
