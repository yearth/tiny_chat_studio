import OpenAI from "openai";
import { logToConsole } from "../utils/logger";
import { AIMessage } from "../utils/types";

/**
 * 调用通义千问-QwQ-Plus API生成响应
 * @param messages 消息列表
 * @param modelId 模型ID
 * @returns 生成的响应文本
 */
export async function generateQwenResponse(
  messages: AIMessage[],
  modelId: string
): Promise<string> {
  // 获取通义千问API密钥
  const qwenApiKey = process.env.DASHSCOPE_API_KEY;

  if (!qwenApiKey || qwenApiKey === "your-dashscope-api-key-here") {
    logToConsole("通义千问 API key not configured");
    // 如果没有配置API密钥，返回模拟响应
    return `[通义千问] 这是来自通义千问-QwQ-Plus模型的模拟响应。请在.env文件中配置DASHSCOPE_API_KEY以获取真实响应。`;
  }

  try {
    logToConsole("Calling 通义千问-QwQ-Plus API...");

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

    logToConsole("Sending messages to 通义千问-QwQ-Plus API:", validMessages);

    // 处理API密钥，移除可能的空格和换行符
    const cleanApiKey = qwenApiKey.trim();
    logToConsole(
      "Using 通义千问 API key (first 4 chars):",
      cleanApiKey.substring(0, 4)
    );

    // 初始化 OpenAI 客户端（通义千问使用兼容OpenAI的接口）
    const openai = new OpenAI({
      apiKey: cleanApiKey,
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    });

    logToConsole("Using 通义千问-QwQ-Plus model");

    // 准备请求参数
    const requestParams = {
      model: "qwq-32b", // 通义千问-QwQ-Plus模型ID
      messages: validMessages,
      stream: true, // 必须使用流式模式，根据错误信息显示该模型只支持流式模式
      // 注意：根据文档，不支持temperature等参数
    };

    logToConsole("Request params:", requestParams);

    try {
      // 调用API，处理流式响应
      const response = await openai.chat.completions.create(requestParams);
      logToConsole("通义千问 API stream started");

      // 收集所有流式响应片段
      let fullContent = "";
      let reasoningContent = "";
      let hasReasoningContent = false;

      // 确保我们有一个可迭代的流
      // 使用类型断言来处理流式响应
      const stream = response as any;
      for await (const chunk of stream) {
        // 检查是否有内容
        if (chunk.choices && chunk.choices.length > 0) {
          const choice = chunk.choices[0];
          
          // 检查是否有delta字段
          if (choice.delta) {
            // 检查是否有reasoning_content字段
            if ("reasoning_content" in choice.delta) {
              hasReasoningContent = true;
              reasoningContent += choice.delta.reasoning_content || "";
            }
            
            // 收集内容
            if (choice.delta.content) {
              fullContent += choice.delta.content;
            }
          }
        }
      }

      logToConsole("通义千问 API stream completed");
      
      // 检查是否有推理内容
      if (hasReasoningContent && reasoningContent) {
        logToConsole(
          "通义千问 Reasoning Content (excerpt):",
          reasoningContent.length > 100
            ? reasoningContent.substring(0, 100) + "..."
            : reasoningContent
        );

        // 返回格式化的响应，包含推理过程和最终答案
        return `**思考过程**:
${reasoningContent}

**答案**:
${fullContent}`;
      }

      // 如果没有reasoning_content字段，直接返回内容
      return fullContent || "通义千问未返回有效回复";
    } catch (error) {
      logToConsole("Error in stream processing:", error);
      throw error; // 重新抛出错误，让外层catch捕获
    }
  } catch (error) {
    logToConsole("Error calling 通义千问 API:", error);
    // 如果调用API失败，返回错误消息
    const errorMessage = error instanceof Error ? error.message : String(error);
    return `[通义千问] 调用通义千问-QwQ-Plus API时出错。错误信息: ${errorMessage}`;
  }
}
