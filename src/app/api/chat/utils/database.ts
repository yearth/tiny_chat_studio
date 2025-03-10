import { prisma } from "@/server/db/client";
import { logToConsole } from "./logger";

/**
 * 获取或创建默认用户
 * @returns 用户对象
 */
export async function getOrCreateDefaultUser() {
  try {
    let user = await prisma.user.findUnique({
      where: { email: "default@example.com" },
    });

    if (!user) {
      logToConsole("Creating default user");
      user = await prisma.user.create({
        data: {
          email: "default@example.com",
          name: "Default User",
        },
      });
    }

    return user;
  } catch (error) {
    logToConsole("Error finding/creating user:", error);
    throw new Error("Database error with user management");
  }
}

/**
 * 获取对话
 * @param conversationId 对话ID
 * @param userId 用户ID
 * @returns 对话对象
 */
export async function getConversation(conversationId: string, userId: string) {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: true },
    });

    if (!conversation || conversation.userId !== userId) {
      throw new Error("Conversation not found or access denied");
    }

    return conversation;
  } catch (error) {
    logToConsole("Database error finding conversation:", error);
    throw new Error("Database error finding conversation");
  }
}

/**
 * 创建新对话
 * @param userId 用户ID
 * @param modelId 模型ID
 * @param title 对话标题
 * @returns 新创建的对话对象
 */
export async function createConversation(
  userId: string,
  modelId: string = "gpt-3.5-turbo",
  title: string = "New Conversation"
) {
  try {
    // 如果提供了modelId，先检查数据库中是否存在该模型
    let selectedModelId = "gpt-3.5-turbo"; // 默认模型

    if (modelId) {
      const modelExists = await prisma.aIModel.findFirst({
        where: { modelId: modelId },
      });

      if (modelExists) {
        selectedModelId = modelId;
        logToConsole(`Using model: ${modelId}`);
      } else {
        logToConsole(`Model ${modelId} not found, using default model`);
      }
    }

    const conversation = await prisma.conversation.create({
      data: {
        userId,
        modelId: selectedModelId,
        title,
      },
    });
    
    logToConsole("Created new conversation:", conversation.id);
    return conversation;
  } catch (error) {
    logToConsole("Database error creating conversation:", error);
    throw new Error("Database error creating conversation");
  }
}

/**
 * 保存消息到数据库
 * @param content 消息内容
 * @param role 消息角色
 * @param conversationId 对话ID
 * @returns 创建的消息对象
 */
export async function saveMessage(
  content: string,
  role: "user" | "assistant" | "system",
  conversationId: string
) {
  try {
    const message = await prisma.message.create({
      data: {
        content,
        role,
        conversationId,
      },
    });
    return message;
  } catch (error) {
    logToConsole("Database error saving message:", error);
    throw new Error("Database error saving message");
  }
}

/**
 * 检查模型API密钥是否配置
 * @param modelId 模型ID
 * @returns 是否配置了API密钥
 */
export function isApiKeyConfigured(modelId: string): boolean {
  if (modelId === "deepseek-r1") {
    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    return !(!deepseekApiKey || deepseekApiKey === "your-deepseek-api-key-here");
  } else if (modelId === "gpt-3.5-turbo" || modelId === "gpt-4") {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    return !(!openaiApiKey || openaiApiKey === "your-api-key-here");
  }
  return false;
}
