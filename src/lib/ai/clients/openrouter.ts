/**
 * OpenRouter API客户端
 */
export class OpenRouterClient {
  private apiKey: string;
  private baseUrl: string = "https://openrouter.ai/api/v1";

  constructor(apiKey?: string) {
    // 使用环境变量中的API密钥或传入的API密钥
    this.apiKey = apiKey || process.env.OPENROUTER_DEEPSEEK_V3_API_KEY || "";

    if (!this.apiKey) {
      throw new Error("OpenRouter API密钥未提供");
    }
  }

  /**
   * 发送聊天请求到OpenRouter API
   */
  async chat(
    messages: { role: "user" | "assistant" | "system"; content: string }[],
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    } = {}
  ) {
    const {
      model = "deepseek/deepseek-chat-v3-0324:free",
      temperature = 0.7,
      maxTokens,
    } = options;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_APP_URL ||
          "https://tiny-chat-studio.vercel.app",
        "X-Title": "Tiny Chat Studio",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "未知错误" }));
      throw new Error(
        `OpenRouter API错误: ${error.error || response.statusText}`
      );
    }

    const data = await response.json();

    return {
      content: data.choices[0]?.message?.content || "",
      model: data.model,
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
    };
  }
}
