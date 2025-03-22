import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
    });

    if (!message) {
      return NextResponse.json(
        { error: "消息不存在" },
        { status: 404 }
      );
    }

    // 如果消息没有关联模型，返回空
    if (!message.model) {
      return NextResponse.json(null);
    }

    // 返回模型信息
    return NextResponse.json(message.model);
  } catch (error) {
    console.error("获取模型信息错误:", error);
    return NextResponse.json(
      { error: "获取模型信息失败" },
      { status: 500 }
    );
  }
}
