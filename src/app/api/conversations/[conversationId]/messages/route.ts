import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 获取特定对话的所有消息
export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const { conversationId } = params;
    
    if (!conversationId) {
      return NextResponse.json(
        { error: '缺少对话ID参数' },
        { status: 400 }
      );
    }
    
    // 从数据库获取特定对话的所有消息
    const messages = await prisma.message.findMany({ 
      where: { conversationId },
      orderBy: { createdAt: 'asc' }
    });
    
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('获取消息列表错误:', error);
    return NextResponse.json(
      { error: '获取消息列表失败' },
      { status: 500 }
    );
  }
}

// 添加消息到对话
export async function POST(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const { conversationId } = params;
    const body = await request.json();
    const { message } = body;
    
    if (!conversationId || !message) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }
    
    // 向数据库添加消息
    const savedMessage = await prisma.message.create({ 
      data: { 
        conversationId, 
        content: message.content,
        role: message.role
      }
    });
    
    // 更新对话的更新时间
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });
    
    return NextResponse.json({ message: savedMessage });
  } catch (error) {
    console.error('保存消息错误:', error);
    return NextResponse.json(
      { error: '保存消息失败' },
      { status: 500 }
    );
  }
}
