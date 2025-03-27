/**
 * AI 提供商配置文件
 * 使用 Vercel AI SDK v4.0+ 配置 AI providers
 */
import { createOpenAI } from '@ai-sdk/openai';

/**
 * 创建 OpenRouter AI provider
 * OpenRouter API 兼容 OpenAI 格式，因此使用 @ai-sdk/openai 包
 */
export const openRouterProvider = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  headers: {
    'HTTP-Referer': 'https://chat.openrouter.ai/',
    'X-Title': 'Tiny Chat Studio',
  },
});
