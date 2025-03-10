import { NextRequest, NextResponse } from 'next/server';
import { AIMessage } from '@/lib/ai/types';
import { generateAIResponse } from '@/lib/ai';
import { prisma } from '@/server/db/client';
import { OpenAI } from 'openai';

export async function POST(req: NextRequest) {
  try {
    const { messages, conversationId, modelId } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages are required and must be an array' },
        { status: 400 }
      );
    }

    // In a real application, you would get the user from the session
    // and verify they have access to this conversation
    const userId = 'user-1'; // Placeholder user ID

    // Get the conversation from the database
    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { messages: true },
      });

      if (!conversation || conversation.userId !== userId) {
        return NextResponse.json(
          { error: 'Conversation not found or access denied' },
          { status: 404 }
        );
      }
    } else {
      // Create a new conversation if no conversationId is provided
      conversation = await prisma.conversation.create({
        data: {
          userId,
          modelId: modelId || 'gpt-3.5-turbo', // Default model
          title: messages[0]?.content.substring(0, 30) || 'New Conversation',
        },
      });
    }

    // Get API key for the model
    // In a real application, you would get the API key from a secure storage
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Save the user message to the database
    const userMessage = messages[messages.length - 1];
    await prisma.message.create({
      data: {
        content: userMessage.content,
        role: userMessage.role,
        conversationId: conversation.id,
      },
    });

    // 将消息格式转换为AIMessage格式
    const formattedMessages: AIMessage[] = messages.map((msg: any) => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    }));

    // 获取AI响应
    const provider = 'openai'; // 默认提供商
    let aiResponseText: string;
    try {
      // 使用类型断言确保返回的是字符串
      const response = await generateAIResponse(
        formattedMessages,
        provider,
        modelId || 'gpt-3.5-turbo',
        apiKey
      );
      
      // 确保响应是字符串
      aiResponseText = String(response);
    } catch (error) {
      console.error('Error generating AI response:', error);
      aiResponseText = '抱歉，生成响应时出现错误。请稍后再试。';
    }

    // Save the AI response to the database
    await prisma.message.create({
      data: {
        content: aiResponseText,
        role: 'assistant',
        conversationId: conversation.id,
      },
    });

    return NextResponse.json({
      message: aiResponseText,
      conversationId: conversation.id,
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
