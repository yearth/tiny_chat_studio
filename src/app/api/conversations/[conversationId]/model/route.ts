import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const conversationId = params.conversationId;

    if (!conversationId) {
      return NextResponse.json(
        { error: "缺少对话ID" },
        { status: 400 }
      );
    }

    // 获取对话及其关联的模型信息
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { model: true },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "对话不存在" },
        { status: 404 }
      );
    }

    // 返回模型信息
    return NextResponse.json(conversation.model);
  } catch (error) {
    console.error("获取模型信息错误:", error);
    return NextResponse.json(
      { error: "获取模型信息失败" },
      { status: 500 }
    );
  }
}
