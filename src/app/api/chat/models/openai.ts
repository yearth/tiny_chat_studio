import { AIMessage } from "../utils/types";
import { logToConsole } from "../utils/logger";

/**
 * 调用OpenAI API生成响应
 * @param messages 消息列表
 * @param modelId 模型ID
 * @returns 生成的响应文本
 */
export async function generateOpenAIResponse(
  messages: AIMessage[],
  modelId: string
): Promise<string> {
  // 获取OpenAI API密钥
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const lastUserMessage = messages[messages.length - 1];

  if (!openaiApiKey || openaiApiKey === "your-api-key-here") {
    logToConsole("OpenAI API key not configured");
    // 如果没有配置API密钥，返回模拟响应
    return `这是对"${lastUserMessage.content}"的模拟响应。请在.env文件中配置OPENAI_API_KEY以获取真实响应。`;
  }

  try {
    logToConsole("Calling OpenAI API...");

    // 调用OpenAI API
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: modelId,
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          temperature: 0.7,
          max_tokens: 1000,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `OpenAI API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    logToConsole("Error calling OpenAI API:", error);
    // 如果调用API失败，返回错误消息
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    return `调用OpenAI API时出错。错误信息: ${errorMessage}`;
  }
}
