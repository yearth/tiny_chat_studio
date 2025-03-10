import { ModelFactory } from './modelFactory';
import { AIMessage } from './types';

/**
 * 生成AI响应
 * @param messages 消息历史
 * @param provider AI提供商 (例如: 'openai', 'anthropic')
 * @param modelId 模型ID
 * @param apiKey API密钥
 * @returns AI响应内容
 */
export async function generateAIResponse(
  messages: AIMessage[],
  provider: string = 'openai',
  modelId: string = 'gpt-3.5-turbo',
  apiKey?: string
): Promise<string> {
  try {
    const factory = new ModelFactory();
    
    // 获取指定的模型或默认模型
    const model = modelId 
      ? factory.getModel(modelId) 
      : factory.getDefaultModel();
    
    if (!model) {
      throw new Error(`Model ${modelId || 'default'} not found`);
    }
    
    // 获取最后一条用户消息
    const lastUserMessage = messages[messages.length - 1];
    
    // 发送消息到AI模型
    const response = await model.sendMessage(
      lastUserMessage.content,
      'temp-conversation-id', // 在实际应用中，这应该是一个真实的会话ID
      messages.slice(0, -1) // 历史消息，不包括最后一条
    );
    
    // 确保返回的是字符串
    return typeof response.content === 'string' 
      ? response.content 
      : String(response.content);
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
}
