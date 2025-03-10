import { AIModel, AIModelConfig, AIMessage, AIResponse } from '../types';
import { OpenAIClient } from '../clients/openai';

/**
 * OpenAI模型实现
 */
export class OpenAIModel implements AIModel {
  config: AIModelConfig;
  private client: OpenAIClient;

  constructor(config?: Partial<AIModelConfig>, apiKey?: string) {
    this.config = {
      id: 'gpt-3.5-turbo',
      name: 'ChatGPT 3.5',
      description: 'OpenAI的GPT-3.5 Turbo模型',
      maxTokens: 4096,
      apiType: 'openai',
      isDefault: true,
      ...config,
    };
    
    this.client = new OpenAIClient(apiKey);
  }

  /**
   * 发送消息到OpenAI API
   */
  async sendMessage(
    message: string, 
    conversationId: string, 
    history: AIMessage[] = []
  ): Promise<AIResponse> {
    // 转换历史消息为OpenAI格式
    const formattedHistory = history.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    // 添加当前消息
    const messages = [
      ...formattedHistory,
      { role: 'user' as const, content: message },
    ];

    // 调用OpenAI API
    return this.client.chat(messages, {
      model: this.config.id,
      maxTokens: this.config.maxTokens,
    });
  }
}
