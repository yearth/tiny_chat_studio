import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("开始数据库种子初始化...");

    // 清空数据库中的所有数据
    console.log("清空现有数据...");
    await prisma.message.deleteMany({});
    await prisma.chat.deleteMany({});
    await prisma.aIModel.deleteMany({});
    await prisma.user.deleteMany({});
    console.log("数据库已清空");

    // 创建测试用户
    const testUser = await prisma.user.upsert({
      where: { email: "test@example.com" },
      update: {},
      create: {
        name: "测试用户",
        email: "test@example.com",
        password: "hashed_password", // 实际应用中应该使用哈希密码
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=test",
      },
    });

    console.log(`创建测试用户: ${testUser.id}`);

    // 创建默认AI模型
    const defaultModels = [
      {
        name: "Deepseek V3 (OpenRouter)",
        provider: "openrouter",
        modelId: "deepseek/deepseek-chat:free",
        description: "OpenRouter提供的Deepseek V3模型",
        iconUrl: "/icons/deepseek.svg",
      },
      {
        name: "DeepSeek R1",
        provider: "deepseek",
        modelId: "deepseek-r1",
        description: "DeepSeek的R1模型",
        iconUrl: "/icons/deepseek.svg",
      },
      {
        name: "通义千问-QwQ-Plus",
        provider: "alibaba",
        modelId: "qwen-qwq-plus",
        description: "阿里巴巴的通义千问模型",
        iconUrl: "/icons/qwen.svg",
      },
    ];

    for (const model of defaultModels) {
      // 使用 modelId 作为 id
      const modelWithId = {
        ...model,
        id: model.modelId, // 使用 modelId 作为 id
      };

      // 使用 AIModel 模型
      await prisma.aIModel.upsert({
        where: { id: modelWithId.id },
        update: modelWithId,
        create: modelWithId,
      });
    }

    console.log("创建默认AI模型");

    // 创建示例对话
    const sampleChats = [
      { title: "计算机视觉分析器开发" },
      { title: "Gemini Impact 如何写好写作提示词" },
      { title: "对比自然语言处理技术" },
      { title: "Web+生成式AI的应用场景" },
      { title: "PowerPoint制作工作汇报" },
    ];

    for (const conv of sampleChats) {
      const chat = await prisma.chat.create({
        data: {
          title: conv.title,
          userId: testUser.id,
        },
      });

      console.log(`创建对话: ${chat.id}`);

      // 为每个对话创建示例消息
      const sampleMessages = [
        {
          content: `你好，我想了解一下关于${conv.title}的内容。`,
          role: "user",
        },
        {
          content: `您好！我很乐意为您提供关于${conv.title}的信息。请问您有什么具体问题吗？`,
          role: "assistant",
          // 随机选择一个模型ID
          modelId:
            defaultModels[Math.floor(Math.random() * defaultModels.length)]
              .modelId,
        },
      ];

      for (const msg of sampleMessages) {
        // 创建消息数据对象
        const messageData: any = {
          content: msg.content,
          role: msg.role,
          chatId: chat.id,
        };

        // 只为 AI 消息添加模型关联
        if (msg.role === "assistant") {
          // 使用消息中的 modelId（如果有）或随机选择一个模型
          messageData.modelId =
            "modelId" in msg
              ? msg.modelId
              : defaultModels[Math.floor(Math.random() * defaultModels.length)]
                  .modelId;
        }

        await prisma.message.create({
          data: messageData,
        });
      }

      console.log(`为对话 ${chat.id} 创建了 ${sampleMessages.length} 条消息`);
    }

    console.log("数据库种子初始化完成!");
  } catch (error) {
    console.error("数据库种子初始化失败:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
