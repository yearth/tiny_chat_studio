import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type tParams = Promise<{ conversationId: string }>;

export async function GET(request: NextRequest, context: { params: tParams }) {
  try {
    const { conversationId } = await context.params;

    if (!conversationId) {
      return NextResponse.json({ error: "缺少对话ID参数" }, { status: 400 });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
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
    const { conversationId } = await context.params;
    const body = await request.json();
    const { message } = body;

    if (!conversationId || !message) {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
    }

    const savedMessage = await prisma.message.create({
      data: {
        conversationId,
        content: message.content,
        role: message.role,
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ message: savedMessage });
  } catch (error) {
    console.error("保存消息错误:", error);
    return NextResponse.json({ error: "保存消息失败" }, { status: 500 });
  }
}
