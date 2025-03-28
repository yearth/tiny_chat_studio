import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { prisma } from "@/server/db/client";
import { logToConsole } from "./utils/logger";
import { openRouterProvider } from "@/lib/ai/providers";
import { AIMessage } from "./utils/types";

/**
 * 聊天 API 路由处理程序
 * 使用 Vercel AI SDK 实现真正的流式传输
 */
export async function POST(req: NextRequest) {
  logToConsole("API route called");

  // 默认模型 ID
  let selectedModelId = "deepseek/deepseek-chat-v3-0324:free";

  try {
    // 记录请求信息
    logToConsole("Request headers:", Object.fromEntries(req.headers));

    // 解析请求体
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

    const userId = user.id;

    // 从数据库获取对话或创建新对话
    let chat;
    if (chatId) {
      try {
        chat = await prisma.chat.findUnique({
          where: { id: chatId },
          include: { messages: true },
        });

        if (!chat) {
          return NextResponse.json(
            { error: "Chat not found or access denied" },
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
      // 如果没有提供 chatId，则创建一个新对话
      try {
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

    // 检查 OpenRouter API 密钥是否配置
    const openrouterApiKey = process.env.OPENROUTER_API_KEY;
    if (
      !openrouterApiKey ||
      openrouterApiKey === "your-openrouter-api-key-here"
    ) {
      logToConsole("OpenRouter API key not configured");
      const mockResponse = `这是对"${
        messages[messages.length - 1].content
      }"的模拟回复。请配置 OpenRouter API 密钥以获取真实响应。`;

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

        // 保存模拟 AI 响应到数据库
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

    // 使用用户选择的模型 ID 或默认模型
    const modelToUse = modelId || selectedModelId;
    logToConsole(`Generating response using model: ${modelToUse}`);

    // 保存用户消息到数据库
    try {
      const userMessage = messages[messages.length - 1];
      await prisma.message.create({
        data: {
          content: userMessage.content,
          role: userMessage.role,
          chatId: chat.id,
        },
      });
    } catch (dbError) {
      logToConsole("Error saving user message:", dbError);
      // 继续处理，不中断流程
    }

    // 格式化消息，确保符合 AI SDK 要求
    const formattedMessages = messages.map((msg: AIMessage) => ({
      role: msg.role,
      content: msg.content,
    }));

    try {
      // 使用 Vercel AI SDK 的 streamText 函数创建流式响应
      const result = await streamText({
        model: openRouterProvider(modelToUse),
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          ...formattedMessages,
        ],
        temperature: 0.7,
        maxTokens: 1000,
        onFinish: async ({ text }) => {
          // 在此回调中保存完整的 AI 响应到数据库
          try {
            await prisma.message.create({
              data: {
                content: text,
                role: "assistant",
                chatId: chat.id,
                modelId: modelToUse,
              },
            });
            logToConsole("Saved AI response to database");
          } catch (dbError) {
            logToConsole("Error saving AI response to database:", dbError);
          }
        },
      });

      // 将 AI SDK 的流转换为标准的 Next.js Response 对象
      logToConsole("Sending stream response");
      return result.toDataStreamResponse();
    } catch (aiError) {
      logToConsole("Error in AI stream generation:", aiError);
      return NextResponse.json(
        { error: "Failed to generate AI response", details: String(aiError) },
        { status: 500 }
      );
    }
  } catch (error) {
    logToConsole("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process chat request", details: String(error) },
      { status: 500 }
    );
  }
}
