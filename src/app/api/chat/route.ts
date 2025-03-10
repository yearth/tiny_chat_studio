import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/client";

// 定义AIMessage类型
interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// 添加一个简单的日志函数，确保日志能够正确输出
function logToConsole(...args: any[]) {
  console.log("[API ROUTE LOG]", new Date().toISOString(), ...args);
}

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
        where: { email: "default@example.com" }
      });
      
      if (!user) {
        logToConsole("Creating default user");
        user = await prisma.user.create({
          data: {
            email: "default@example.com",
            name: "Default User"
          }
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
        conversation = await prisma.conversation.create({
          data: {
            userId,
            modelId: modelId || "gpt-3.5-turbo", // 默认模型
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
    
    // 获取API密钥
    // 在实际应用中，您应该从安全存储中获取API密钥
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      logToConsole("API key not configured");
      // 如果没有API密钥，我们可以返回模拟响应
      const mockResponse = `这是对"${messages[messages.length - 1].content}"的模拟回复。请配置API密钥以获取真实响应。`;
      
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
        
        // 保存模拟AI响应到数据库
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
    
    // 在这里，我们应该调用AI服务生成响应
    // 但由于我们可能还没有完全实现AI服务，我们先使用模拟响应
    logToConsole("Generating response");
    
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 生成简单的回复
    const aiResponse = `这是对"${userMessage.content}"的响应。数据库集成工作正常！`;
    
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
