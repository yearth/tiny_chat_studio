import { NextResponse } from "next/server";
import { prisma } from "@/server/db/client";
import { MessageWithModel } from "@/types/models";

export async function GET(
  request: Request,
  { params }: { params: { messageId: string } }
) {
  try {
    const messageId = params.messageId;

    if (!messageId) {
      return NextResponse.json(
        { error: "缺少消息ID" },
        { status: 400 }
      );
    }

    // 获取消息及其关联的模型信息
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { model: true },
    }) as MessageWithModel | null;

    if (!message) {
      return NextResponse.json(
        { error: "消息不存在" },
        { status: 404 }
      );
    }

    // 返回模型信息（如果存在）
    return NextResponse.json(message.model || null);
  } catch (error) {
    console.error("获取模型信息错误:", error);
    return NextResponse.json(
      { error: "获取模型信息失败" },
      { status: 500 }
    );
  }
}
