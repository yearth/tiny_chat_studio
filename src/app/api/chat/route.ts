import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/client";
import { generateResponse } from "./models";

// 添加一个简单的日志函数，确保日志能够正确输出
function logToConsole(...args: any[]) {
  console.log("[API ROUTE LOG]", new Date().toISOString(), ...args);
}

export async function POST(req: NextRequest) {
  logToConsole("API route called");

  // 初始化选择的模型ID变量，确保在整个函数中可用
  let selectedModelId = "qwen-qwq-plus"; // 默认模型

  try {
    // 尝试记录请求信息
    logToConsole("Request headers:", Object.fromEntries(req.headers));

    // 尝试解析请求体
    let body;
    try {
      body = await req.json();
      logToConsole("Request body:", body);
    } catch (jsonError) {
      logToConsole("Error parsing JSON:", jsonError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { messages, conversationId, modelId } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      logToConsole("Invalid messages format");
      return NextResponse.json(
        { error: "Messages are required and must be an array" },
        { status: 400 }
      );
    }

    // 在实际应用中，您应该从会话中获取用户ID
    // 并验证他们是否有权访问此对话

    // 检查默认用户是否存在，如果不存在则创建
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email: "default@example.com" },
      });

      if (!user) {
        logToConsole("Creating default user");
        user = await prisma.user.create({
          data: {
            email: "default@example.com",
            name: "Default User",
          },
        });
      }
    } catch (userError) {
      logToConsole("Error finding/creating user:", userError);
      return NextResponse.json(
        { error: "Database error with user management" },
        { status: 500 }
      );
    }

    const userId = user.id; // 使用实际的用户ID

    // 从数据库获取对话
    let conversation;
    if (conversationId) {
      try {
        conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
          include: { messages: true },
        });

        if (!conversation || conversation.userId !== userId) {
          return NextResponse.json(
            { error: "Conversation not found or access denied" },
            { status: 404 }
          );
        }
      } catch (dbError) {
        logToConsole("Database error finding conversation:", dbError);
        return NextResponse.json(
          { error: "Database error finding conversation" },
          { status: 500 }
        );
      }
    } else {
      // 如果没有提供conversationId，则创建一个新对话
      try {
        // 如果提供了modelId，先检查数据库中是否存在该模型
        if (modelId) {
          const modelExists = await prisma.aIModel.findFirst({
            where: { modelId: modelId },
          });

          if (modelExists) {
            selectedModelId = modelId;
            logToConsole(`Using model: ${modelId}`);
          } else {
            logToConsole(`Model ${modelId} not found, using default model`);
            // 保持默认模型
            selectedModelId = "qwen-qwq-plus";
          }
        }

        conversation = await prisma.conversation.create({
          data: {
            userId,
            modelId: selectedModelId,
            title: messages[0]?.content.substring(0, 30) || "New Conversation",
          },
        });
        logToConsole("Created new conversation:", conversation.id);
      } catch (dbError) {
        logToConsole("Database error creating conversation:", dbError);
        return NextResponse.json(
          { error: "Database error creating conversation" },
          { status: 500 }
        );
      }
    }

    // 检查所选模型的API密钥是否配置
    let apiKeyConfigured = false;

    // 使用用户选择的模型ID（如果有），否则使用对话中的模型ID
    const modelToUse = modelId ? modelId : conversation.modelId;
    logToConsole(`Model to use for API key check: ${modelToUse}`);

    // 根据不同的模型检查相应的API密钥
    if (modelToUse === "deepseek-r1") {
      const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
      if (deepseekApiKey && deepseekApiKey !== "your-deepseek-api-key-here") {
        apiKeyConfigured = true;
        logToConsole("DeepSeek API key is configured");
      } else {
        logToConsole("DeepSeek API key not configured");
      }
    } else if (modelToUse === "gpt-3.5-turbo" || modelToUse === "gpt-4") {
      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (openaiApiKey && openaiApiKey !== "your-api-key-here") {
        apiKeyConfigured = true;
        logToConsole("OpenAI API key is configured");
      } else {
        logToConsole("OpenAI API key not configured");
      }
    } else if (modelToUse === "qwen-qwq-plus") {
      // 检查通义千问API密钥
      const dashscopeApiKey = process.env.DASHSCOPE_API_KEY;
      if (
        dashscopeApiKey &&
        dashscopeApiKey !== "your-dashscope-api-key-here"
      ) {
        apiKeyConfigured = true;
        logToConsole("通义千问 API key is configured");
      } else {
        logToConsole("通义千问 API key not configured");
      }
    } else if (modelToUse === "deepseek/deepseek-chat:free") {
      // 检查 OpenRouter Deepseek 模型 API 密钥
      const openrouterApiKey = process.env.OPENROUTER_API_KEY;
      logToConsole("OpenRouter API key:", openrouterApiKey);
      if (
        openrouterApiKey &&
        openrouterApiKey !== "your-openrouter-api-key-here"
      ) {
        apiKeyConfigured = true;
        logToConsole("OpenRouter Deepseek API key is configured");
      } else {
        logToConsole("OpenRouter Deepseek API key not configured");
      }
    }

    logToConsole("API key configured:", apiKeyConfigured);
    // 如果没有配置相应的API密钥，返回模拟响应
    if (!apiKeyConfigured) {
      const mockResponse = `这是对"${
        messages[messages.length - 1].content
      }"的模拟回复。请为 ${modelToUse} 模型配置相应的API密钥以获取真实响应。`;

      try {
        // 保存用户消息到数据库
        const userMessage = messages[messages.length - 1];
        await prisma.message.create({
          data: {
            content: userMessage.content,
            role: userMessage.role,
            conversationId: conversation.id,
          },
        });

        // 保存模拟 AI响应到数据库
        await prisma.message.create({
          data: {
            content: mockResponse,
            role: "assistant",
            conversationId: conversation.id,
          },
        });
      } catch (dbError) {
        logToConsole("Database error saving messages:", dbError);
      }

      return NextResponse.json({
        message: mockResponse,
        conversationId: conversation.id,
      });
    }

    // 保存用户消息到数据库
    const userMessage = messages[messages.length - 1];
    try {
      await prisma.message.create({
        data: {
          content: userMessage.content,
          role: userMessage.role,
          conversationId: conversation.id,
        },
      });
    } catch (dbError) {
      logToConsole("Database error saving user message:", dbError);
    }

    // 使用我们的generateResponse函数生成响应
    // 使用用户选择的模型ID（modelToUse）而不是对话中存储的模型ID（conversation.modelId）
    logToConsole(`Generating response using model: ${modelToUse}`);

    // 生成响应
    const aiResponse = await generateResponse(messages, modelToUse);

    // 保存AI响应到数据库
    try {
      await prisma.message.create({
        data: {
          content: aiResponse,
          role: "assistant",
          conversationId: conversation.id,
        },
      });
    } catch (dbError) {
      logToConsole("Database error saving AI response:", dbError);
    }

    logToConsole("Sending response");
    return NextResponse.json({
      message: aiResponse,
      conversationId: conversation.id,
    });
  } catch (error) {
    logToConsole("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process chat request", details: String(error) },
      { status: 500 }
    );
  }
}
