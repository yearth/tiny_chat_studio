import OpenAI from 'openai';

/**
 * OpenAI API客户端
 */
export class OpenAIClient {
  private client: OpenAI;

  constructor(apiKey?: string) {
    // 使用环境变量中的API密钥或传入的API密钥
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  /**
   * 发送聊天请求到OpenAI API
   */
  async chat(
    messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    } = {}
  ) {
    const { model = 'gpt-3.5-turbo', temperature = 0.7, maxTokens } = options;

    const response = await this.client.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    });

    return {
      content: response.choices[0]?.message?.content || '',
      model: response.model,
      usage: response.usage ? {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      } : undefined,
    };
  }
}
