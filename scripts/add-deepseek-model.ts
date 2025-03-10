import { prisma } from '../src/server/db/client';

async function addDeepSeekModel() {
  try {
    const deepseekModel = await prisma.aIModel.create({
      data: {
        name: 'DeepSeek R1',
        provider: 'deepseek',
        modelId: 'deepseek-r1',
        description: 'DeepSeek R1是一个强大的大型语言模型，专为高级推理和对话而设计。',
        iconUrl: 'https://deepseek.com/favicon.ico', // 替换为实际的图标URL
        isActive: true,
      },
    });

    console.log('DeepSeek R1模型已成功添加:', deepseekModel);
  } catch (error) {
    console.error('添加DeepSeek R1模型时出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addDeepSeekModel()
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
