/**
 * AI模型类型定义
 */

export interface AIModelConfig {
  id: string;
  name: string;
  description: string;
  maxTokens: number;
  apiType: string;
  isDefault?: boolean;
}

export interface AIMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: Date;
}

export interface AIUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AIResponse {
  content: string;
  model: string;
  usage?: AIUsage;
}

export interface AIModel {
  config: AIModelConfig;
  
  /**
   * 发送消息到AI模型并获取响应
   * @param message 用户消息
   * @param conversationId 会话ID
   * @param history 历史消息记录
   */
  sendMessage(
    message: string, 
    conversationId: string, 
    history?: AIMessage[]
  ): Promise<AIResponse>;
}
