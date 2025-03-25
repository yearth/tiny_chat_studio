import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/client";
import { generateResponse, generateStreamResponse } from "./models";
import { logToConsole } from "./utils/logger";

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

    const { messages, chatId, modelId } = body;

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
    let chat;
    if (chatId) {
      try {
        chat = await prisma.chat.findUnique({
          where: { id: chatId },
          include: { messages: true },
        });

        if (!chat) {
          return NextResponse.json(
            { error: "chat not found or access denied" },
            { status: 404 }
          );
        }
      } catch (dbError) {
        logToConsole("Database error finding chat:", dbError);
        return NextResponse.json(
          { error: "Database error finding chat" },
          { status: 500 }
        );
      }
    } else {
      // 如果没有提供chatId，则创建一个新对话
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

        chat = await prisma.chat.create({
          data: {
            userId,
            title: messages[0]?.content.substring(0, 30) || "New chat",
          },
        });
        logToConsole("Created new chat:", chat.id);
      } catch (dbError) {
        logToConsole("Database error creating chat:", dbError);
        return NextResponse.json(
          { error: "Database error creating chat" },
          { status: 500 }
        );
      }
    }

    // 检查所选模型的API密钥是否配置
    let apiKeyConfigured = false;

    // 使用用户选择的模型ID
    const modelToUse = modelId || selectedModelId;
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
            chatId: chat.id,
          },
        });

        // 保存模拟 AI响应到数据库
        await prisma.message.create({
          data: {
            content: mockResponse,
            role: "assistant",
            chatId: chat.id,
          },
        });
      } catch (dbError) {
        logToConsole("Database error saving messages:", dbError);
      }

      return NextResponse.json({
        message: mockResponse,
        chatId: chat.id,
      });
    }

    // 保存用户消息到数据库
    const userMessage = messages[messages.length - 1];
    try {
      await prisma.message.create({
        data: {
          content: userMessage.content,
          role: userMessage.role,
          chatId: chat.id,
        },
      });
    } catch (dbError) {
      logToConsole("Database error saving user message:", dbError);
    }

    // 使用我们的generateResponse函数生成响应
    // 使用用户选择的模型ID（modelToUse）而不是对话中存储的模型ID（chat.modelId）
    logToConsole(`Generating response using model: ${modelToUse}`);

    // 创建流式响应
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = "";

        try {
          // 使用生成器函数获取流式响应
          for await (const chunk of generateStreamResponse(
            messages,
            modelToUse
          )) {
            fullResponse += chunk;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  chunk,
                  chatId: chat.id,
                })}\n\n`
              )
            );
          }

          // 保存完整响应到数据库，并关联使用的模型
          await prisma.message.create({
            data: {
              content: fullResponse,
              role: "assistant",
              chatId: chat.id,
              modelId: modelToUse, // 保存使用的模型ID
            },
          });

          // 发送结束信号
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        } catch (error) {
          logToConsole("Error in stream generation:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: String(error) })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    logToConsole("Sending stream response");
    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    logToConsole("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process chat request", details: String(error) },
      { status: 500 }
    );
  }
}
