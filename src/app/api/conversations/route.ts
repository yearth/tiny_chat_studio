import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 获取所有对话
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: '缺少用户ID参数' },
        { status: 400 }
      );
    }
    
    // 从数据库获取用户的所有对话
    const conversations = await prisma.conversation.findMany({ 
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 1 // 只获取最新的一条消息，用于预览
        }
      }
    });
    
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('获取对话列表错误:', error);
    return NextResponse.json(
      { error: '获取对话列表失败' },
      { status: 500 }
    );
  }
}

// 创建新对话
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, modelId = 'gpt-3.5-turbo' } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: '缺少用户ID参数' },
        { status: 400 }
      );
    }
    
    // 创建新对话
    const newConversation = await prisma.conversation.create({ 
      data: { 
        userId, 
        title: title || '新对话', // 如果没有提供标题，使用默认标题
        modelId, // 使用提供的模型或默认模型
      }
    });
    
    return NextResponse.json({ conversation: newConversation });
  } catch (error) {
    console.error('创建对话错误:', error);
    return NextResponse.json(
      { error: '创建对话失败' },
      { status: 500 }
    );
  }
}
