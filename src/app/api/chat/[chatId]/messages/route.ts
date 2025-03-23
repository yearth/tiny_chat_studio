import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type tParams = Promise<{ chatId: string }>;

export async function GET(request: NextRequest, context: { params: tParams }) {
  try {
    const { chatId } = await context.params;

    if (!chatId) {
      return NextResponse.json({ error: "缺少聊天ID参数" }, { status: 400 });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: chatId },
      orderBy: { createdAt: "asc" },
      include: {
        model: true, // 包含关联的模型信息
      },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("获取消息列表错误:", error);
    return NextResponse.json({ error: "获取消息列表失败" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: { params: tParams }) {
  try {
    const { chatId } = await context.params;
    const body = await request.json();
    const { message } = body;

    if (!chatId || !message) {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
    }

    const savedMessage = await prisma.message.create({
      data: {
        conversationId: chatId,
        content: message.content,
        role: message.role,
        modelId: message.modelId, // 添加模型ID支持
      },
    });

    await prisma.conversation.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ message: savedMessage });
  } catch (error) {
    console.error("保存消息错误:", error);
    return NextResponse.json({ error: "保存消息失败" }, { status: 500 });
  }
}
