import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("开始数据库种子初始化...");

    // 清空数据库中的所有数据（按照依赖关系顺序）
    console.log("清空现有数据...");
    await prisma.providerInstanceModel.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.chat.deleteMany({});
    await prisma.providerInstance.deleteMany({});
    await prisma.aIModel.deleteMany({});
    await prisma.providerDefinition.deleteMany({});
    await prisma.user.deleteMany({});
    console.log("数据库已清空");

    // 创建提供商定义
    console.log("创建提供商定义...");
    const providerDefinitions = [
      {
        type: "openai",
        name: "OpenAI",
        requiresApiKey: true,
        requiresApiAddress: true,
        iconUrl: "/icons/openai.svg",
        description: "OpenAI API提供的模型",
        isSystemDefined: true,
      },
      {
        type: "gemini",
        name: "Google Gemini",
        requiresApiKey: true,
        requiresApiAddress: false,
        iconUrl: "/icons/gemini.svg",
        description: "Google提供的Gemini模型",
        isSystemDefined: true,
      },
      {
        type: "deepseek",
        name: "DeepSeek",
        requiresApiKey: true,
        requiresApiAddress: false,
        iconUrl: "/icons/deepseek.svg",
        description: "DeepSeek提供的模型",
        isSystemDefined: true,
      },
      {
        type: "alibaba",
        name: "阿里通义千问",
        requiresApiKey: true,
        requiresApiAddress: false,
        iconUrl: "/icons/qwen.svg",
        description: "阿里巴巴提供的通义千问模型",
        isSystemDefined: true,
      },
      {
        type: "openrouter",
        name: "OpenRouter",
        requiresApiKey: true,
        requiresApiAddress: false,
        iconUrl: "/icons/openrouter.svg",
        description: "OpenRouter提供的多种模型",
        isSystemDefined: true,
      },
    ];

    // 创建提供商定义并保存ID映射
    const providerDefinitionMap: Record<string, string> = {};

    for (const def of providerDefinitions) {
      const createdDef = await prisma.providerDefinition.create({
        data: def,
      });
      providerDefinitionMap[def.type] = createdDef.id;
      console.log(`创建提供商定义: ${createdDef.name} (${createdDef.id})`);
    }

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
        providerType: "openrouter",
        modelId: "deepseek/deepseek-chat-v3-0324:free",
        description: "OpenRouter提供的Deepseek V3模型",
        iconUrl: "/icons/deepseek.svg",
      },
      {
        name: "DeepSeek R1",
        providerType: "deepseek",
        modelId: "deepseek-r1",
        description: "DeepSeek的R1模型",
        iconUrl: "/icons/deepseek.svg",
      },
      {
        name: "通义千问-QwQ-Plus",
        providerType: "alibaba",
        modelId: "qwen-qwq-plus",
        description: "阿里巴巴的通义千问模型",
        iconUrl: "/icons/qwen.svg",
      },
    ];

    // 创建AI模型并保存映射
    console.log("创建AI模型...");
    const aiModelMap: Record<string, any> = {};

    for (const model of defaultModels) {
      // 查找对应的提供商定义ID
      const providerDefinitionId = providerDefinitionMap[model.providerType];

      if (!providerDefinitionId) {
        console.error(`未找到提供商类型 ${model.providerType} 的定义`);
        continue;
      }

      // 创建AI模型
      const createdModel = await prisma.aIModel.create({
        data: {
          name: model.name,
          modelId: model.modelId,
          description: model.description,
          providerDefinitionId: providerDefinitionId,
        },
      });

      // 保存模型ID映射，使用modelId和providerType作为键
      const key = `${model.modelId}:${model.providerType}`;
      aiModelMap[key] = createdModel;
      console.log(`创建AI模型: ${createdModel.name} (${createdModel.id})`);
    }

    // 为测试用户创建提供商实例
    console.log("创建提供商实例...");
    const providerInstances = [
      {
        userId: testUser.id,
        providerDefinitionId: providerDefinitionMap["openrouter"],
        name: "默认 OpenRouter 配置",
        enabled: true,
        apiKey:
          "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",
      },
      {
        userId: testUser.id,
        providerDefinitionId: providerDefinitionMap["deepseek"],
        name: "默认 DeepSeek 配置",
        enabled: true,
        apiKey: "sk-8edee80e49b943128d7dd819197400c7",
      },
      {
        userId: testUser.id,
        providerDefinitionId: providerDefinitionMap["alibaba"],
        name: "默认阿里通义千问配置",
        enabled: true,
        apiKey: "sk-ecf9c138c79748cd8d739bd4f0da8bcc",
      },
    ];

    const createdInstances = [];

    for (const instance of providerInstances) {
      const createdInstance = await prisma.providerInstance.create({
        data: instance,
      });
      createdInstances.push(createdInstance);
      console.log(
        `创建提供商实例: ${createdInstance.name} (${createdInstance.id})`
      );
    }

    // 为每个提供商实例启用相应的模型
    console.log("启用提供商实例的模型...");
    for (const instance of createdInstances) {
      // 获取与该实例相同提供商类型的所有模型
      const matchingModels = Object.values(aiModelMap).filter(
        (model: any) =>
          model.providerDefinitionId === instance.providerDefinitionId
      );

      if (matchingModels.length === 0) {
        console.log(`提供商实例 ${instance.name} 没有匹配的模型可启用`);
        continue;
      }

      // 创建提供商实例模型关联
      const providerInstanceModels = matchingModels.map((model: any) => ({
        providerInstanceId: instance.id,
        aiModelId: model.id,
      }));

      await prisma.providerInstanceModel.createMany({
        data: providerInstanceModels,
      });

      console.log(
        `为提供商实例 ${instance.name} 启用了 ${providerInstanceModels.length} 个模型`
      );
    }

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
          // 随机选择一个模型
          modelInfo:
            defaultModels[Math.floor(Math.random() * defaultModels.length)],
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
          // 获取模型信息
          const modelInfo =
            (msg as any).modelInfo ||
            defaultModels[Math.floor(Math.random() * defaultModels.length)];

          // 查找对应的AI模型ID
          const key = `${modelInfo.modelId}:${modelInfo.providerType}`;
          const aiModel = aiModelMap[key];

          if (aiModel) {
            // 使用AI模型的ID (cuid)，而不是modelId
            messageData.modelId = aiModel.id;
          } else {
            console.warn(`未找到模型: ${key}，消息将不关联模型`);
          }
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
