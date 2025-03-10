import { NextRequest, NextResponse } from 'next/server';
import { Message } from '@/types/chat';
import { generateAIResponse } from '@/lib/ai';
import { prisma } from '@/server/db/client';

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

    // Get AI response
    const provider = 'openai'; // Default provider
    const response = await generateAIResponse(
      messages,
      provider,
      modelId || 'gpt-3.5-turbo',
      apiKey
    );

    // For simplicity, we're assuming the response is not streamed
    // In a real application, you would handle streaming responses
    const aiResponse = 'This is a placeholder AI response';

    // Save the AI response to the database
    await prisma.message.create({
      data: {
        content: aiResponse,
        role: 'assistant',
        conversationId: conversation.id,
      },
    });

    return NextResponse.json({
      message: aiResponse,
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
