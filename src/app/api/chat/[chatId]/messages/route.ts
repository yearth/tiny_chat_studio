import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type tParams = Promise<{ chatId: string }>;

export async function GET(request: NextRequest, context: { params: tParams }) {
  try {
    const { chatId } = await context.params;

    if (!chatId) {
      return NextResponse.json({ error: "缺少聊天ID参数" }, { status: 400 });
    }

    const messages = await prisma.message.findMany({
      where: { chatId },
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
  // TODO: 这个 POST 端点的功能（单独保存消息）现在很可能已冗余。
  // 核心的聊天流程（包括用户消息的保存）已由 POST /api/chat/stream 处理。
  // 标准的前端聊天流程不应再调用此端点。
  // 在确认 /api/chat/stream 端点完全覆盖所需功能并通过测试后，应考虑移除此 POST 方法。
  try {
    const { chatId } = await context.params;
    const body = await request.json();
    const { message } = body;

    // 增强输入校验
    if (!chatId || !message || !message.content || !message.role) {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
    }

    // 初始化模型记录ID
    let modelRecordId: string | null = null;

    // 记录接收到的原始数据
    console.log("接收到消息请求:", {
      chatId,
      content: message.content,
      role: message.role,
      modelStringId: message.modelStringId,
    });

    // 条件查找 AIModel
    if (message.role === 'assistant' && message.modelStringId) {
      try {
        // 查询数据库获取模型记录ID
        const aiModel = await prisma.aIModel.findFirst({
          where: {
            modelId: message.modelStringId,
          },
          select: {
            id: true, // 只选择主键ID (CUID)
          },
        });

        if (aiModel) {
          modelRecordId = aiModel.id;
          console.log(`找到模型记录ID: ${modelRecordId} (对应模型: ${message.modelStringId})`);
        } else {
          console.warn(`未找到模型记录: ${message.modelStringId}，将使用null作为modelId`);
        }
      } catch (modelError) {
        console.error("查询模型记录时出错:", modelError);
        // 继续处理，使用null作为modelId
      }
    }

    // 创建消息记录
    const savedMessage = await prisma.message.create({
      data: {
        chatId,
        content: message.content,
        role: message.role,
        modelId: modelRecordId, // 使用查找到的CUID或null
      },
      include: {
        model: true, // 在响应中包含模型信息
      },
    });

    console.log("消息保存成功:", {
      id: savedMessage.id,
      role: savedMessage.role,
      modelId: savedMessage.modelId,
    });

    // 更新聊天最后修改时间
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ message: savedMessage });
  } catch (error) {
    console.error("保存消息错误:", error);
    
    // 优化错误处理
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        return NextResponse.json({ 
          error: "外键约束错误，可能是chatId或modelId无效" 
        }, { status: 400 });
      }
    }
    
    return NextResponse.json({ error: "保存消息失败" }, { status: 500 });
  }
}
