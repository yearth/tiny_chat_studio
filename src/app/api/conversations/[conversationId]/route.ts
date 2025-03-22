import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type tParams = Promise<{ conversationId: string }>;

/**
 * 获取单个对话详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: tParams }
) {
  try {
    const { conversationId } = await params;

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
      return NextResponse.json({ error: "对话不存在" }, { status: 404 });
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("获取对话详情错误:", error);
    return NextResponse.json({ error: "获取对话详情失败" }, { status: 500 });
  }
}

/**
 * 删除对话（伪删除）
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: tParams }
) {
  try {
    const { conversationId } = await params;
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';

    if (permanent) {
      // 永久删除 - 首先删除所有关联的消息
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
    } else {
      // 伪删除 - 仅设置 deletedAt 字段
      await prisma.conversation.update({
        where: {
          id: conversationId,
        },
        data: {
          deletedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除对话错误:", error);
    return NextResponse.json({ error: "删除对话失败" }, { status: 500 });
  }
}

/**
 * 恢复已删除的对话
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: tParams }
) {
  try {
    const { conversationId } = await params;
    const body = await request.json();
    const { action } = body;

    if (action === 'restore') {
      // 恢复已删除的对话
      await prisma.conversation.update({
        where: {
          id: conversationId,
        },
        data: {
          deletedAt: null,
        },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "无效的操作" }, { status: 400 });
  } catch (error) {
    console.error("恢复对话错误:", error);
    return NextResponse.json({ error: "恢复对话失败" }, { status: 500 });
  }
}
