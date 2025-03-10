import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/client";
import { generateResponse } from "./models";

// 定义AIMessage类型
interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// 添加一个简单的日志函数，确保日志能够正确输出
function logToConsole(...args: any[]) {
  console.log("[API ROUTE LOG]", new Date().toISOString(), ...args);
}

// 根据模型生成响应
// async function generateResponse(
//   messages: AIMessage[],
//   modelId: string
// ): Promise<string> {
//   // 获取用户最后一条消息
//   const lastUserMessage = messages[messages.length - 1];

//   console.log("Last user message:", messages);
//   console.log("Model ID:", modelId);

//   // 根据不同的模型生成不同的响应
//   if (modelId === "deepseek-r1") {
//     // 获取DeepSeek API密钥
//     const deepseekApiKey = process.env.DEEPSEEK_API_KEY;

//     if (!deepseekApiKey || deepseekApiKey === "your-deepseek-api-key-here") {
//       logToConsole("DeepSeek API key not configured");
//       // 如果没有配置API密钥，返回模拟响应
//       return `[DeepSeek R1] 这是来自DeepSeek R1模型的模拟响应。请在.env文件中配置DEEPSEEK_API_KEY以获取真实响应。`;
//     }

//     try {
//       logToConsole("Calling DeepSeek API...");

//       // 调用DeepSeek API
//       // 根据最新的DeepSeek API文档调整请求

//       // 过滤消息，只保留user和assistant角色的消息
//       const validMessages = messages
//         .filter((msg) => msg.role === "user" || msg.role === "assistant")
//         .map((msg) => ({
//           role: msg.role,
//           content: msg.content,
//         }));

//       // 确保最后一条消息是用户消息
//       if (
//         validMessages.length > 0 &&
//         validMessages[validMessages.length - 1].role !== "user"
//       ) {
//         logToConsole("Last message is not from user, this may cause an error");
//       }

//       logToConsole("Sending messages to DeepSeek API:", validMessages);

//       // 处理API密钥，移除可能的空格和换行符
//       const cleanApiKey = deepseekApiKey.trim();
//       logToConsole(
//         "Using DeepSeek API key (first 4 chars):",
//         cleanApiKey.substring(0, 4)
//       );

//       // 根据DeepSeek官方文档使用正确的API端点
//       const apiEndpoint = "https://api.deepseek.com/v1/chat/completions";
//       logToConsole("Using DeepSeek API endpoint:", apiEndpoint);

//       // 处理消息，确保没有包含reasoning_content字段
//       // 过滤掉之前可能包含的错误消息
//       const cleanedMessages = validMessages.map((msg) => {
//         // 检查消息内容中是否包含思考过程和答案的格式
//         let content = msg.content;

//         // 移除可能的错误消息
//         if (content.includes("[DeepSeek R1]")) {
//           content = content.replace(/\[DeepSeek R1\].*/, "").trim() || "你好！";
//         }

//         // 移除思考过程格式，防止导致400错误
//         if (content.includes("**思考过程**:") && content.includes("**答案**:")) {
//           // 只保留答案部分
//           const answerMatch = content.match(/\*\*答案\*\*:\s*([\s\S]*)/i);
//           if (answerMatch && answerMatch[1]) {
//             content = answerMatch[1].trim();
//           }
//         }

//         return {
//           role: msg.role,
//           content: content
//         };
//       });

//       // 准备消息，添加系统消息
//       const formattedMessages = [
//         { role: "system", content: "You are a helpful assistant." },
//         ...cleanedMessages,
//       ];

//       // 根据模型类型准备不同的请求体
//       let requestBody;

//       // 根据模型ID选择不同的API调用方式
//       if (modelId === "deepseek-r1") {
//         // 使用deepseek-reasoner模型，这是DeepSeek-R1的推理模型
//         // 注意：根据API文档，deepseek-reasoner模型不支持temperature等参数
//         // 如果在输入消息序列中包含reasoning_content字段，API会返回400错误

//         // 特别处理formattedMessages，确保不包含可能导致400错误的内容
//         const sanitizedMessages = formattedMessages.map(msg => {
//           // 深度清理消息内容，移除任何可能导致400错误的内容
//           let cleanContent = msg.content;

//           // 移除可能包含reasoning_content的内容
//           if (typeof cleanContent === 'string') {
//             // 移除任何包含思考过程、reasoning_content或Chain of Thought的内容
//             if (cleanContent.includes("**思考过程**:") ||
//                 cleanContent.includes("reasoning_content") ||
//                 cleanContent.includes("Chain of Thought")) {

//               // 如果包含答案部分，只保留答案
//               if (cleanContent.includes("**答案**:")) {
//                 const answerMatch = cleanContent.match(/\*\*答案\*\*:\s*([\s\S]*)/i);
//                 if (answerMatch && answerMatch[1]) {
//                   cleanContent = answerMatch[1].trim();
//                 } else {
//                   // 如果无法提取答案，则移除所有可能的标记
//                   cleanContent = cleanContent
//                     .replace(/\*\*思考过程\*\*:[\s\S]*?(?=\*\*答案\*\*:|$)/gi, "")
//                     .replace(/\*\*答案\*\*:/gi, "")
//                     .replace(/reasoning_content/gi, "")
//                     .replace(/Chain of Thought/gi, "")
//                     .trim();
//                 }
//               } else {
//                 // 如果没有明确的答案部分，移除所有可能的标记
//                 cleanContent = cleanContent
//                   .replace(/\*\*思考过程\*\*:/gi, "")
//                   .replace(/reasoning_content/gi, "")
//                   .replace(/Chain of Thought/gi, "")
//                   .trim();
//               }
//             }
//           }

//           return {
//             role: msg.role,
//             content: cleanContent
//           };
//         });

//         requestBody = {
//           model: "deepseek-reasoner",
//           messages: sanitizedMessages,
//           max_tokens: 1000,
//           stream: false
//           // 确保不包含任何不支持的参数
//         };

//         logToConsole("Using DeepSeek-R1 reasoning model (deepseek-reasoner)");
//         logToConsole("Sanitized messages to prevent 400 error");
//       } else {
//         // 默认使用deepseek-chat模型
//         requestBody = {
//           model: "deepseek-chat",
//           messages: formattedMessages,
//           temperature: 0.7,
//           max_tokens: 1000,
//           stream: false
//         };
//         logToConsole("Using DeepSeek standard chat model (deepseek-chat)");
//       }

//       logToConsole("Request body:", requestBody);

//       const response = await fetch(apiEndpoint, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${cleanApiKey}`,
//         },
//         body: JSON.stringify(requestBody),
//       });

//       if (!response.ok) {
//         // 尝试获取更详细的错误信息
//         try {
//           const errorData = await response.json();
//           logToConsole("DeepSeek API error details:", errorData);

//           if (errorData.error) {
//             throw new Error(
//               `DeepSeek API error: ${response.status} ${response.statusText} - ${errorData.error.message || errorData.error}`
//             );
//           }
//         } catch (parseError) {
//           // 如果无法解析JSON，则使用原始错误信息
//         }

//         // 如果是400错误，且使用的是deepseek-reasoner模型，提供更具体的错误信息
//         if (response.status === 400 && modelId === "deepseek-r1") {
//           throw new Error(
//             `DeepSeek API error: 400 Bad Request - 可能是消息格式不正确或包含不支持的参数。请确保消息中不包含reasoning_content字段，并且没有使用不支持的参数如temperature等。`
//           );
//         } else {
//           throw new Error(
//             `DeepSeek API error: ${response.status} ${response.statusText}`
//           );
//         }
//       }

//       const data = await response.json();
//       logToConsole("DeepSeek API response:", data);

//       // 检查响应中是否有错误信息
//       if (data.code === 401 || data.message === "Invalid API key") {
//         throw new Error(
//           `DeepSeek API 验证失败: ${data.message}. 请确认您的API密钥格式正确并已激活。`
//         );
//       }

//       // 检查是否有choices字段
//       if (
//         !data.choices ||
//         !Array.isArray(data.choices) ||
//         data.choices.length === 0
//       ) {
//         throw new Error(
//           `DeepSeek API 响应格式不正确: 缺少choices字段. 完整响应: ${JSON.stringify(
//             data
//           )}`
//         );
//       }

//       // 处理deepseek-reasoner模型的特殊响应格式
//       if (modelId === "deepseek-r1" && requestBody.model === "deepseek-reasoner") {
//         // 检查是否有reasoning_content字段
//         if (data.choices[0].message.reasoning_content) {
//           const reasoningContent = data.choices[0].message.reasoning_content;
//           const finalContent = data.choices[0].message.content;

//           logToConsole("DeepSeek Reasoning Content (excerpt):",
//             reasoningContent.length > 100 ? reasoningContent.substring(0, 100) + "..." : reasoningContent);

//           // 返回格式化的响应，包含推理过程和最终答案
//           return `**思考过程**:
// ${reasoningContent}

// **答案**:
// ${finalContent}`;
//         }
//       }

//       // 对于标准聊天模型的处理
//       if (!data.choices[0].message || !data.choices[0].message.content) {
//         throw new Error(
//           `DeepSeek API 响应格式不正确: 缺少message或content字段. 完整响应: ${JSON.stringify(
//             data.choices[0]
//           )}`
//         );
//       }

//       return data.choices[0].message.content;
//     } catch (error) {
//       logToConsole("Error calling DeepSeek API:", error);
//       // 如果调用API失败，返回错误消息
//       const errorMessage =
//         error instanceof Error ? error.message : String(error);
//       return `[DeepSeek R1] 调用DeepSeek API时出错。错误信息: ${errorMessage}`;
//     }
//   } else if (modelId === "gpt-3.5-turbo" || modelId === "gpt-4") {
//     // 获取OpenAI API密钥
//     const openaiApiKey = process.env.OPENAI_API_KEY;

//     if (!openaiApiKey || openaiApiKey === "your-api-key-here") {
//       logToConsole("OpenAI API key not configured");
//       // 如果没有配置API密钥，返回模拟响应
//       return `这是对"${lastUserMessage.content}"的模拟响应。请在.env文件中配置OPENAI_API_KEY以获取真实响应。`;
//     }

//     try {
//       logToConsole("Calling OpenAI API...");

//       // 调用OpenAI API
//       const response = await fetch(
//         "https://api.openai.com/v1/chat/completions",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${openaiApiKey}`,
//           },
//           body: JSON.stringify({
//             model: modelId,
//             messages: messages.map((msg) => ({
//               role: msg.role,
//               content: msg.content,
//             })),
//             temperature: 0.7,
//             max_tokens: 1000,
//           }),
//         }
//       );

//       if (!response.ok) {
//         throw new Error(
//           `OpenAI API error: ${response.status} ${response.statusText}`
//         );
//       }

//       const data = await response.json();
//       return data.choices[0].message.content;
//     } catch (error) {
//       logToConsole("Error calling OpenAI API:", error);
//       // 如果调用API失败，返回错误消息
//       const errorMessage =
//         error instanceof Error ? error.message : String(error);
//       return `调用OpenAI API时出错。错误信息: ${errorMessage}`;
//     }
//   } else {
//     // 默认模拟响应
//     logToConsole(`Using mock response for model: ${modelId}`);
//     await new Promise((resolve) => setTimeout(resolve, 500)); // 模拟延迟
//     return `这是对"${lastUserMessage.content}"的模拟响应。模型 ${modelId} 尚未实现实际API调用。`;
//   }
// }

export async function POST(req: NextRequest) {
  logToConsole("API route called");

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
        let selectedModelId = "qwen-qwq-plus"; // 默认模型

        if (modelId) {
          const modelExists = await prisma.aIModel.findFirst({
            where: { modelId: modelId },
          });

          if (modelExists) {
            selectedModelId = modelId;
            logToConsole(`Using model: ${modelId}`);
          } else {
            logToConsole(`Model ${modelId} not found, using default model`);
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

    // 根据不同的模型检查相应的API密钥
    if (conversation.modelId === "deepseek-r1") {
      const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
      if (deepseekApiKey && deepseekApiKey !== "your-deepseek-api-key-here") {
        apiKeyConfigured = true;
        logToConsole("DeepSeek API key is configured");
      } else {
        logToConsole("DeepSeek API key not configured");
      }
    } else if (
      conversation.modelId === "gpt-3.5-turbo" ||
      conversation.modelId === "gpt-4"
    ) {
      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (openaiApiKey && openaiApiKey !== "your-api-key-here") {
        apiKeyConfigured = true;
        logToConsole("OpenAI API key is configured");
      } else {
        logToConsole("OpenAI API key not configured");
      }
    } else if (conversation.modelId === "qwen-qwq-plus") {
      console.log(
        "🔍 ~ POST ~ app/src/app/api/chat/route.ts:473 ~ conversation:",
        conversation
      );
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
    }

    // 如果没有配置相应的API密钥，返回模拟响应
    if (!apiKeyConfigured) {
      const mockResponse = `这是对"${
        messages[messages.length - 1].content
      }"的模拟回复。请为 ${
        conversation.modelId
      } 模型配置相应的API密钥以获取真实响应。`;

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
    logToConsole(`Generating response using model: ${conversation.modelId}`);

    // 生成响应
    const aiResponse = await generateResponse(messages, conversation.modelId);

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
