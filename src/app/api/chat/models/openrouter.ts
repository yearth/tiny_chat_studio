import { AIMessage } from "../utils/types";
import { logToConsole } from "../utils/logger";

/**
 * OpenRouter 流式响应生成器函数
 * @param messages 消息列表
 * @param modelId 模型ID
 * @yields 生成的响应文本片段
 */
export async function* generateOpenRouterStreamResponse(
  messages: AIMessage[],
  modelId: string
): AsyncGenerator<string> {
  // 获取OpenRouter API密钥
  const openRouterApiKey = process.env.OPENROUTER_API_KEY;

  if (!openRouterApiKey) {
    logToConsole("OpenRouter API key not configured");
    // 如果没有配置API密钥，返回模拟响应
    yield `[OpenRouter] 这是来自OpenRouter的模拟响应。请在.env文件中配置OPENROUTER_API_KEY以获取真实响应。`;
    return;
  }

  try {
    logToConsole("Calling OpenRouter API with streaming...");

    // 过滤消息，只保留user和assistant角色的消息
    const validMessages = messages
      .filter((msg) => msg.role === "user" || msg.role === "assistant")
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

    // 确保最后一条消息是用户消息
    if (
      validMessages.length > 0 &&
      validMessages[validMessages.length - 1].role !== "user"
    ) {
      logToConsole("Last message is not from user, this may cause an error");
    }

    // 处理API密钥，移除可能的空格和换行符
    const cleanApiKey = openRouterApiKey.trim();

    // OpenRouter API端点
    const apiEndpoint = "https://openrouter.ai/api/v1/chat/completions";
    
    // 准备消息，添加系统消息
    const formattedMessages = [
      { role: "system", content: "You are a helpful assistant." },
      ...validMessages,
    ];

    // 准备请求体，启用流式响应
    const requestBody = {
      model: modelId,
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 1000,
      stream: true, // 启用流式响应
    };

    logToConsole("Stream request body:", requestBody);

    // 发送请求
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cleanApiKey}`,
        "HTTP-Referer": "https://chat.openrouter.ai/",
        "X-Title": "Tiny Chat Studio",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      // 处理错误
      const errorText = await response.text();
      throw new Error(
        `OpenRouter API request failed: ${response.status} ${response.statusText}\n${errorText}`
      );
    }

    // 处理流式响应
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Failed to get response reader");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      // 解码二进制数据
      buffer += decoder.decode(value, { stream: true });
      
      // 处理 SSE 格式的数据
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith(":")) continue; // 忽略空行和注释
        
        if (trimmedLine.startsWith("data: ")) {
          const data = trimmedLine.slice(6);
          if (data === "[DONE]") return;
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch (e) {
            logToConsole("Error parsing SSE data:", e);
          }
        }
      }
    }
    
    // 处理最后的缓冲区
    decoder.decode();
    
  } catch (error: any) {
    logToConsole("Error in OpenRouter streaming:", error);
    yield `[OpenRouter] 流式生成响应时出错: ${error.message}`;
  }
}

/**
 * 使用OpenRouter API生成响应
 * @param messages 消息列表
 * @param modelId 模型ID
 * @returns 生成的响应文本
 */
export async function generateOpenRouterResponse(
  messages: AIMessage[],
  modelId: string
): Promise<string> {
  // 获取OpenRouter API密钥
  const openRouterApiKey = process.env.OPENROUTER_API_KEY;

  if (!openRouterApiKey) {
    logToConsole("OpenRouter API key not configured");
    // 如果没有配置API密钥，返回模拟响应
    return `[OpenRouter] 这是来自OpenRouter的模拟响应。请在.env文件中配置OPENROUTER_API_KEY以获取真实响应。`;
  }

  try {
    logToConsole("Calling OpenRouter API...");

    // 过滤消息，只保留user和assistant角色的消息
    const validMessages = messages
      .filter((msg) => msg.role === "user" || msg.role === "assistant")
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

    // 确保最后一条消息是用户消息
    if (
      validMessages.length > 0 &&
      validMessages[validMessages.length - 1].role !== "user"
    ) {
      logToConsole("Last message is not from user, this may cause an error");
    }

    logToConsole("Sending messages to OpenRouter API:", validMessages);

    // 处理API密钥，移除可能的空格和换行符
    const cleanApiKey = openRouterApiKey.trim();
    logToConsole(
      "Using OpenRouter API key (first 4 chars):",
      cleanApiKey.substring(0, 4)
    );

    // OpenRouter API端点
    const apiEndpoint = "https://openrouter.ai/api/v1/chat/completions";
    logToConsole("Using OpenRouter API endpoint:", apiEndpoint);

    // 准备消息，添加系统消息
    const formattedMessages = [
      { role: "system", content: "You are a helpful assistant." },
      ...validMessages,
    ];

    // 准备请求体
    const requestBody = {
      model: modelId, // 使用传入的modelId
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 1000,
      stream: false, // 非流式请求
    };

    logToConsole("Request body:", requestBody);

    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cleanApiKey}`,
        "HTTP-Referer": "https://chat.openrouter.ai/",
        "X-Title": "Tiny Chat Studio",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      // 尝试获取更详细的错误信息
      try {
        const errorData = await response.json();
        logToConsole("OpenRouter API error details:", errorData);

        if (errorData.error) {
          throw new Error(
            `OpenRouter API error: ${response.status} ${
              response.statusText
            } - ${errorData.error.message || errorData.error}`
          );
        }
      } catch (parseError) {
        // 如果无法解析错误响应，则使用原始状态信息
        logToConsole("Failed to parse error response:", parseError);
      }

      throw new Error(
        `OpenRouter API request failed: ${response.status} ${response.statusText}`
      );
    }

    // 解析响应
    const data = await response.json();
    logToConsole("OpenRouter API response:", data);

    // 验证响应格式
    if (!data.choices || !data.choices[0]) {
      throw new Error(
        `OpenRouter API 响应格式不正确: 缺少choices字段. 完整响应: ${JSON.stringify(
          data
        )}`
      );
    }

    if (!data.choices[0].message || !data.choices[0].message.content) {
      throw new Error(
        `OpenRouter API 响应格式不正确: 缺少message或content字段. 完整响应: ${JSON.stringify(
          data.choices[0]
        )}`
      );
    }

    // 返回生成的内容
    return data.choices[0].message.content;
  } catch (error: any) {
    logToConsole("Error generating OpenRouter response:", error);
    return `[OpenRouter] 生成响应时出错: ${error.message}`;
  }
}
