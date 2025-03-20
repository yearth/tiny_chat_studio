import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * 获取单个对话详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const { conversationId } = params;

    // 获取对话详情
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "对话不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("获取对话详情错误:", error);
    return NextResponse.json(
      { error: "获取对话详情失败" },
      { status: 500 }
    );
  }
}

/**
 * 删除对话
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const { conversationId } = params;

    // 首先删除所有关联的消息
    await prisma.message.deleteMany({
      where: {
        conversationId: conversationId,
      },
    });

    // 然后删除对话
    await prisma.conversation.delete({
      where: {
        id: conversationId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除对话错误:", error);
    return NextResponse.json(
      { error: "删除对话失败" },
      { status: 500 }
    );
  }
}
