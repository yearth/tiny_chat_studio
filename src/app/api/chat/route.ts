import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { prisma } from "@/server/db/client";
import { logToConsole } from "./utils/logger";
import { openRouterProvider } from "@/lib/ai/providers";
import { AIMessage } from "./utils/types";
import { Message } from "@prisma/client";

/**
 * 聊天 API 路由处理程序
 * 使用 Vercel AI SDK 实现真正的流式传输
 */
export async function POST(req: NextRequest) {
  logToConsole("API route called");

  // 默认模型 ID
  let selectedModelId = "deepseek/deepseek-chat-v3-0324:free";

  // 用于存储最终保存的 AI 消息
  let finalSavedMessage: Message | null = null;

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

    const { messages, chatId, modelId, tempId } = body;

    // 验证 tempId 是否存在
    if (!tempId) {
      logToConsole("Warning: No tempId provided in request");
    } else {
      logToConsole("Received tempId:", tempId);
    }

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
      // 创建一个 Promise 来同步 onFinish 回调的完成
      let onFinishResolve: () => void;
      const onFinishPromise = new Promise<void>(resolve => {
        onFinishResolve = resolve;
      });

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
            // 保存 AI 消息到数据库并获取完整的保存消息（包含 ID）
            const savedAIMessage = await prisma.message.create({
              data: {
                content: text,
                role: "assistant",
                chatId: chat.id,
                modelId: modelToUse,
              },
            });

            // 将保存的消息赋值给外部变量，以便在流结束时发送
            finalSavedMessage = savedAIMessage;
            logToConsole(
              "Saved AI response to database with ID:",
              savedAIMessage.id
            );
          } catch (dbError) {
            logToConsole("Error saving AI response to database:", dbError);
          } finally {
            // 通知我们 onFinish 已经完成
            onFinishResolve();
          }
        },
      });

      // 手动构造 SSE 响应流，以便在流结束时发送 message_complete 事件
      logToConsole("Sending custom stream response");

      // 确保 textStream 存在
      if (!result.textStream) {
        throw new Error("无法获取原始文本流");
      }

      // 创建一个新的 ReadableStream 来包装原始流并添加自定义事件
      const encoder = new TextEncoder();
      const customStream = new ReadableStream({
        async start(controller) {
          try {
            // 直接使用 for await...of 循环遍历 textStream
            // 这将给我们提供原始的文本块，而不是格式化的 SSE 数据
            for await (const textChunk of result.textStream) {
              // textChunk 已经是字符串，不需要解码
              // 将文本转义为 JSON 字符串，处理特殊字符
              const escapedText = JSON.stringify(textChunk).slice(1, -1);
              
              // 构造模拟 Vercel AI SDK 的 SSE 格式，包装在 data: 字段中
              const formattedSSE = `data: 0:"${escapedText}"\n\n`;
              
              // 编码并发送格式化的 SSE 消息
              controller.enqueue(encoder.encode(formattedSSE));
              
              // 记录日志，便于调试
              if (textChunk.length < 100) {
                // 只记录短文本，避免日志过大
                logToConsole(`Sent stream chunk: ${textChunk}`);
              }
            }
            
            // 文本流已结束，等待 onFinish 回调完成
            logToConsole("Text stream ended, waiting for onFinish to complete...");
            await onFinishPromise;
            logToConsole("onFinish completed, sending message_complete event");
            
            // 现在发送 message_complete 事件
            if (finalSavedMessage) {
              // 构造包含最终消息数据的对象
              const finalData = {
                id: finalSavedMessage.id,
                content: finalSavedMessage.content,
                role: finalSavedMessage.role,
                modelId: finalSavedMessage.modelId,
                createdAt: finalSavedMessage.createdAt,
                tempId: tempId, // 包含前端发送的临时 ID
              };

              // 构造 SSE 事件字符串
              const completeEvent = `event: message_complete\ndata: ${JSON.stringify(
                finalData
              )}\n\n`;

              // 发送 message_complete 事件
              controller.enqueue(encoder.encode(completeEvent));
              logToConsole(
                "Sent message_complete event with data:",
                finalData
              );
            } else {
              logToConsole(
                "Warning: No finalSavedMessage available for message_complete event"
              );
            }

            // 关闭流
            controller.close();
          } catch (error) {
            logToConsole("Error in custom stream:", error);
            controller.error(error);
          }
        },
      });

      // 返回自定义流作为响应
      return new Response(customStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
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
