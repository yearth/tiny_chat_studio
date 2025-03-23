import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type tParams = Promise<{ chatId: string }>;

/**
 * 获取单个聊天详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: tParams }
) {
  try {
    const { chatId } = await params;

    // 获取聊天详情
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: chatId,
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
      return NextResponse.json({ error: "聊天不存在" }, { status: 404 });
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("获取聊天详情错误:", error);
    return NextResponse.json({ error: "获取聊天详情失败" }, { status: 500 });
  }
}

/**
 * 删除聊天（伪删除）
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: tParams }
) {
  try {
    const { chatId } = await params;
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';

    if (permanent) {
      // 永久删除 - 首先删除所有关联的消息
      await prisma.message.deleteMany({
        where: {
          conversationId: chatId,
        },
      });

      // 然后删除聊天
      await prisma.conversation.delete({
        where: {
          id: chatId,
        },
      });
    } else {
      // 伪删除 - 仅设置 deletedAt 字段
      await prisma.conversation.update({
        where: {
          id: chatId,
        },
        data: {
          deletedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除聊天错误:", error);
    return NextResponse.json({ error: "删除聊天失败" }, { status: 500 });
  }
}

/**
 * 恢复已删除的聊天
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: tParams }
) {
  try {
    const { chatId } = await params;
    const body = await request.json();
    const { action } = body;

    if (action === 'restore') {
      // 恢复已删除的聊天
      await prisma.conversation.update({
        where: {
          id: chatId,
        },
        data: {
          deletedAt: null,
        },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "无效的操作" }, { status: 400 });
  } catch (error) {
    console.error("恢复聊天错误:", error);
    return NextResponse.json({ error: "恢复聊天失败" }, { status: 500 });
  }
}
