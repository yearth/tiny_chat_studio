import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { prisma } from "@/server/db/client";
import { logToConsole } from "../utils/logger";
import { openRouterProvider } from "@/lib/ai/providers";
import { AIMessage } from "../utils/types";
import { Message } from "@prisma/client";

/**
 * 流式聊天 API 路由处理程序
 * 使用 Vercel AI SDK 实现真正的流式传输
 * 处理完整的聊天回合：保存用户消息、调用 AI、保存 AI 消息、返回流
 */
export async function POST(req: NextRequest) {
  logToConsole("流式聊天 API 路由被调用");

  // 默认模型 ID
  let selectedModelId = "deepseek/deepseek-chat-v3-0324:free";

  // 用于存储最终保存的 AI 消息
  let finalSavedMessage: Message | null = null;

  try {
    // 记录请求信息
    logToConsole("请求头:", Object.fromEntries(req.headers));

    // 解析请求体
    let body;
    try {
      body = await req.json();
      logToConsole("请求体:", body);
    } catch (jsonError) {
      logToConsole("解析 JSON 错误:", jsonError);
      return NextResponse.json(
        { error: "请求体中的 JSON 无效" },
        { status: 400 }
      );
    }

    const { messages, chatId, modelId, tempId } = body;

    // 验证 tempId 是否存在
    if (!tempId) {
      logToConsole("警告: 请求中未提供 tempId");
    } else {
      logToConsole("收到 tempId:", tempId);
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      logToConsole("消息格式无效");
      return NextResponse.json(
        { error: "消息是必需的，且必须是数组" },
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
        logToConsole("创建默认用户");
        user = await prisma.user.create({
          data: {
            email: "default@example.com",
            name: "默认用户",
          },
        });
      }
    } catch (userError) {
      logToConsole("查找/创建用户时出错:", userError);
      return NextResponse.json(
        { error: "用户管理数据库错误" },
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
            { error: "未找到聊天或拒绝访问" },
            { status: 404 }
          );
        }
      } catch (dbError) {
        logToConsole("查找聊天数据库错误:", dbError);
        return NextResponse.json(
          { error: "查找聊天数据库错误" },
          { status: 500 }
        );
      }
    } else {
      // 如果没有提供 chatId，则创建一个新对话
      try {
        chat = await prisma.chat.create({
          data: {
            userId,
            title: messages[0]?.content.substring(0, 30) || "新聊天",
          },
        });
        logToConsole("创建新聊天:", chat.id);
      } catch (dbError) {
        logToConsole("创建聊天数据库错误:", dbError);
        return NextResponse.json(
          { error: "创建聊天数据库错误" },
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
      logToConsole("未配置 OpenRouter API 密钥");
      const mockResponse = `这是对"${
        messages[messages.length - 1].content
      }"的模拟回复。请配置 OpenRouter API 密钥以获取真实响应。`;

      try {
        // 保存模拟 AI 响应到数据库
        await prisma.message.create({
          data: {
            content: mockResponse,
            role: "assistant",
            chatId: chat.id,
          },
        });
      } catch (dbError) {
        logToConsole("保存消息数据库错误:", dbError);
      }

      return NextResponse.json({
        message: mockResponse,
        chatId: chat.id,
      });
    }

    // 使用用户选择的模型 ID 或默认模型
    const modelToUse = modelId || selectedModelId;
    logToConsole(`使用模型生成响应: ${modelToUse}`);

    // 格式化消息，确保符合 AI SDK 要求
    const formattedMessages = messages.map((msg: AIMessage) => ({
      role: msg.role,
      content: msg.content,
    }));

    try {
      // 创建一个 Promise 来同步 onFinish 回调的完成
      let onFinishResolve: () => void;
      const onFinishPromise = new Promise<void>((resolve) => {
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
          // 初始化模型记录ID
          let modelRecordId: string | null = null;

          try {
            // 根据模型字符串标识符查找对应的 AIModel 记录
            if (modelToUse) {
              try {
                logToConsole("查找模型记录，模型标识符:", modelToUse);

                const aiModel = await prisma.aIModel.findFirst({
                  where: {
                    modelId: modelToUse, // 使用模型字符串标识符查询
                  },
                  select: {
                    id: true, // 只选择 CUID
                  },
                });

                if (aiModel) {
                  modelRecordId = aiModel.id;
                  logToConsole(
                    `找到模型记录ID: ${modelRecordId} (对应模型: ${modelToUse})`
                  );
                } else {
                  logToConsole(
                    `警告：未找到模型记录: ${modelToUse}，将使用null作为modelId`
                  );
                }
              } catch (modelError) {
                logToConsole("查询模型记录时出错:", modelError);
                // 继续处理，使用null作为modelId
              }
            }

            // 保存 AI 消息到数据库并获取完整的保存消息（包含 ID）
            const savedAIMessage = await prisma.message.create({
              data: {
                content: text,
                role: "assistant",
                chatId: chat.id,
                modelId: modelRecordId, // 使用查找到的 CUID 或 null
              },
              include: {
                model: true, // 包含关联的模型信息
              },
            });

            // 将保存的消息赋值给外部变量，以便在流结束时发送
            finalSavedMessage = savedAIMessage;
            logToConsole(
              "成功保存AI响应到数据库，ID:",
              savedAIMessage.id,
              "关联模型ID:",
              savedAIMessage.modelId
            );
          } catch (dbError) {
            logToConsole("保存AI响应到数据库时出错:", dbError);

            // 检查是否为 Prisma 外键约束错误
            if (
              dbError &&
              typeof dbError === "object" &&
              "code" in dbError &&
              dbError.code === "P2003"
            ) {
              logToConsole("外键约束错误，可能是chatId或modelId无效");
            }
          } finally {
            // 通知我们 onFinish 已经完成
            onFinishResolve();
          }
        },
      });

      // 手动构造 SSE 响应流，以便在流结束时发送 message_complete 事件
      logToConsole("发送自定义流响应");

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
                logToConsole(`发送流块: ${textChunk}`);
              }
            }

            // 文本流已结束，等待 onFinish 回调完成
            logToConsole("文本流已结束，等待 onFinish 完成...");
            await onFinishPromise;
            logToConsole("onFinish 已完成，发送 message_complete 事件");

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
                "已发送带有数据的 message_complete 事件:",
                finalData
              );
            } else {
              logToConsole(
                "警告: message_complete 事件没有可用的 finalSavedMessage"
              );
            }

            // 关闭流
            controller.close();
          } catch (error) {
            logToConsole("自定义流错误:", error);
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
      logToConsole("AI 流生成错误:", aiError);
      return NextResponse.json(
        { error: "生成 AI 响应失败", details: String(aiError) },
        { status: 500 }
      );
    }
  } catch (error) {
    logToConsole("聊天 API 错误:", error);
    return NextResponse.json(
      { error: "处理聊天请求失败", details: String(error) },
      { status: 500 }
    );
  }
}
