import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('开始数据库种子初始化...');

    // 创建测试用户
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        name: '测试用户',
        email: 'test@example.com',
        password: 'hashed_password', // 实际应用中应该使用哈希密码
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
      },
    });

    console.log(`创建测试用户: ${testUser.id}`);

    // 创建默认AI模型
    const defaultModels = [
      {
        name: 'GPT-3.5 Turbo',
        provider: 'openai',
        modelId: 'gpt-3.5-turbo',
        description: '快速、经济实惠的模型，适合大多数任务',
        iconUrl: '/icons/openai.svg',
      },
      {
        name: 'GPT-4',
        provider: 'openai',
        modelId: 'gpt-4',
        description: '更强大的模型，适合复杂任务',
        iconUrl: '/icons/openai.svg',
      },
    ];

    for (const model of defaultModels) {
      // 使用 modelId 作为 id
      const modelWithId = {
        ...model,
        id: model.modelId, // 使用 modelId 作为 id
      };
      
      await prisma.aIModel.upsert({
        where: { id: modelWithId.id },
        update: modelWithId,
        create: modelWithId,
      });
    }

    console.log('创建默认AI模型');

    // 创建示例对话
    const sampleConversations = [
      { title: "计算机视觉分析器开发" },
      { title: "Gemini Impact 如何写好写作提示词" },
      { title: "对比自然语言处理技术" },
      { title: "Web+生成式AI的应用场景" },
      { title: "PowerPoint制作工作汇报" },
    ];

    for (const conv of sampleConversations) {
      const conversation = await prisma.conversation.create({
        data: {
          title: conv.title,
          userId: testUser.id,
          modelId: 'gpt-3.5-turbo',
        },
      });

      console.log(`创建对话: ${conversation.id}`);

      // 为每个对话创建示例消息
      const sampleMessages = [
        {
          content: `你好，我想了解一下关于${conv.title}的内容。`,
          role: "user",
        },
        {
          content: `您好！我很乐意为您提供关于${conv.title}的信息。请问您有什么具体问题吗？`,
          role: "assistant",
        },
      ];

      for (const msg of sampleMessages) {
        await prisma.message.create({
          data: {
            content: msg.content,
            role: msg.role,
            conversationId: conversation.id,
          },
        });
      }

      console.log(`为对话 ${conversation.id} 创建了 ${sampleMessages.length} 条消息`);
    }

    console.log('数据库种子初始化完成!');
  } catch (error) {
    console.error('数据库种子初始化失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
