import { AIMessage } from "../utils/types";
import { logToConsole } from "../utils/logger";

/**
 * 调用DeepSeek API生成响应
 * @param messages 消息列表
 * @param modelId 模型ID
 * @returns 生成的响应文本
 */
export async function generateDeepSeekResponse(
  messages: AIMessage[],
  modelId: string
): Promise<string> {
  // 获取DeepSeek API密钥
  const deepseekApiKey = process.env.DEEPSEEK_API_KEY;

  if (!deepseekApiKey || deepseekApiKey === "your-deepseek-api-key-here") {
    logToConsole("DeepSeek API key not configured");
    // 如果没有配置API密钥，返回模拟响应
    return `[DeepSeek R1] 这是来自DeepSeek R1模型的模拟响应。请在.env文件中配置DEEPSEEK_API_KEY以获取真实响应。`;
  }

  try {
    logToConsole("Calling DeepSeek API...");

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

    logToConsole("Sending messages to DeepSeek API:", validMessages);

    // 处理API密钥，移除可能的空格和换行符
    const cleanApiKey = deepseekApiKey.trim();
    logToConsole(
      "Using DeepSeek API key (first 4 chars):",
      cleanApiKey.substring(0, 4)
    );

    // 根据DeepSeek官方文档使用正确的API端点
    const apiEndpoint = "https://api.deepseek.com/v1/chat/completions";
    logToConsole("Using DeepSeek API endpoint:", apiEndpoint);

    // 处理消息，确保没有包含reasoning_content字段
    // 过滤掉之前可能包含的错误消息
    const cleanedMessages = validMessages.map((msg) => {
      // 检查消息内容中是否包含思考过程和答案的格式
      let content = msg.content;
      
      // 移除可能的错误消息
      if (content.includes("[DeepSeek R1]")) {
        content = content.replace(/\[DeepSeek R1\].*/, "").trim() || "你好！";
      }
      
      // 移除思考过程格式，防止导致400错误
      if (content.includes("**思考过程**:") && content.includes("**答案**:")) {
        // 只保留答案部分
        const answerMatch = content.match(/\*\*答案\*\*:\s*([\s\S]*)/i);
        if (answerMatch && answerMatch[1]) {
          content = answerMatch[1].trim();
        }
      }
      
      return {
        role: msg.role,
        content: content
      };
    });

    // 准备消息，添加系统消息
    const formattedMessages = [
      { role: "system", content: "You are a helpful assistant." },
      ...cleanedMessages,
    ];

    // 根据模型类型准备不同的请求体
    let requestBody;
    
    // 根据模型ID选择不同的API调用方式
    if (modelId === "deepseek-r1") {
      // 使用deepseek-reasoner模型，这是DeepSeek-R1的推理模型
      // 注意：根据API文档，deepseek-reasoner模型不支持temperature等参数
      // 如果在输入消息序列中包含reasoning_content字段，API会返回400错误
      
      // 特别处理formattedMessages，确保不包含可能导致400错误的内容
      const sanitizedMessages = formattedMessages.map(msg => {
        // 深度清理消息内容，移除任何可能导致400错误的内容
        let cleanContent = msg.content;
        
        // 移除可能包含reasoning_content的内容
        if (typeof cleanContent === 'string') {
          // 移除任何包含思考过程、reasoning_content或Chain of Thought的内容
          if (cleanContent.includes("**思考过程**:") || 
              cleanContent.includes("reasoning_content") || 
              cleanContent.includes("Chain of Thought")) {
            
            // 如果包含答案部分，只保留答案
            if (cleanContent.includes("**答案**:")) {
              const answerMatch = cleanContent.match(/\*\*答案\*\*:\s*([\s\S]*)/i);
              if (answerMatch && answerMatch[1]) {
                cleanContent = answerMatch[1].trim();
              } else {
                // 如果无法提取答案，则移除所有可能的标记
                cleanContent = cleanContent
                  .replace(/\*\*思考过程\*\*:[\s\S]*?(?=\*\*答案\*\*:|$)/gi, "")
                  .replace(/\*\*答案\*\*:/gi, "")
                  .replace(/reasoning_content/gi, "")
                  .replace(/Chain of Thought/gi, "")
                  .trim();
              }
            } else {
              // 如果没有明确的答案部分，移除所有可能的标记
              cleanContent = cleanContent
                .replace(/\*\*思考过程\*\*:/gi, "")
                .replace(/reasoning_content/gi, "")
                .replace(/Chain of Thought/gi, "")
                .trim();
            }
          }
        }
        
        return {
          role: msg.role,
          content: cleanContent
        };
      });
      
      requestBody = {
        model: "deepseek-reasoner", 
        messages: sanitizedMessages,
        max_tokens: 1000,
        stream: false
        // 确保不包含任何不支持的参数
      };
      
      logToConsole("Using DeepSeek-R1 reasoning model (deepseek-reasoner)");
      logToConsole("Sanitized messages to prevent 400 error");
    } else {
      // 默认使用deepseek-chat模型
      requestBody = {
        model: "deepseek-chat", 
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      };
      logToConsole("Using DeepSeek standard chat model (deepseek-chat)");
    }

    logToConsole("Request body:", requestBody);

    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cleanApiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      // 尝试获取更详细的错误信息
      try {
        const errorData = await response.json();
        logToConsole("DeepSeek API error details:", errorData);
        
        if (errorData.error) {
          throw new Error(
            `DeepSeek API error: ${response.status} ${response.statusText} - ${errorData.error.message || errorData.error}`
          );
        }
      } catch (parseError) {
        // 如果无法解析JSON，则使用原始错误信息
      }
      
      // 如果是400错误，且使用的是deepseek-reasoner模型，提供更具体的错误信息
      if (response.status === 400 && modelId === "deepseek-r1") {
        throw new Error(
          `DeepSeek API error: 400 Bad Request - 可能是消息格式不正确或包含不支持的参数。请确保消息中不包含reasoning_content字段，并且没有使用不支持的参数如temperature等。`
        );
      } else {
        throw new Error(
          `DeepSeek API error: ${response.status} ${response.statusText}`
        );
      }
    }

    const data = await response.json();
    logToConsole("DeepSeek API response:", data);

    // 检查响应中是否有错误信息
    if (data.code === 401 || data.message === "Invalid API key") {
      throw new Error(
        `DeepSeek API 验证失败: ${data.message}. 请确认您的API密钥格式正确并已激活。`
      );
    }

    // 检查是否有choices字段
    if (
      !data.choices ||
      !Array.isArray(data.choices) ||
      data.choices.length === 0
    ) {
      throw new Error(
        `DeepSeek API 响应格式不正确: 缺少choices字段. 完整响应: ${JSON.stringify(
          data
        )}`
      );
    }
    
    // 处理deepseek-reasoner模型的特殊响应格式
    if (modelId === "deepseek-r1" && requestBody.model === "deepseek-reasoner") {
      // 检查是否有reasoning_content字段
      if (data.choices[0].message.reasoning_content) {
        const reasoningContent = data.choices[0].message.reasoning_content;
        const finalContent = data.choices[0].message.content;
        
        logToConsole("DeepSeek Reasoning Content (excerpt):", 
          reasoningContent.length > 100 ? reasoningContent.substring(0, 100) + "..." : reasoningContent);
        
        // 返回格式化的响应，包含推理过程和最终答案
        return `**思考过程**:
${reasoningContent}

**答案**:
${finalContent}`;
      }
    }

    // 对于标准聊天模型的处理
    if (!data.choices[0].message || !data.choices[0].message.content) {
      throw new Error(
        `DeepSeek API 响应格式不正确: 缺少message或content字段. 完整响应: ${JSON.stringify(
          data.choices[0]
        )}`
      );
    }

    return data.choices[0].message.content;
  } catch (error) {
    logToConsole("Error calling DeepSeek API:", error);
    // 如果调用API失败，返回错误消息
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    return `[DeepSeek R1] 调用DeepSeek API时出错。错误信息: ${errorMessage}`;
  }
}
