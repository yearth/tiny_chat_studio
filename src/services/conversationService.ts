import { Conversation, Message } from "@prisma/client";
import { ChatMessage, ConversationWithMessages, MessageRole } from "@/types/prisma";

/**
 * 获取用户的所有对话
 * @param userId 用户ID
 * @returns 对话列表
 */
export async function getUserConversations(userId: string): Promise<ConversationWithMessages[]> {
  try {
    // 从API获取对话列表
    const response = await fetch(`/api/conversations?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`获取对话列表失败: ${response.status}`);
    }
    
    const data = await response.json();
    return data.conversations;
  } catch (error) {
    console.error('获取对话列表错误:', error);
    throw error;
  }
}

/**
 * 获取特定对话的所有消息
 * @param conversationId 对话ID
 * @returns 消息列表
 */
export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  try {
    // 从API获取消息列表
    const response = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`获取消息列表失败: ${response.status}`);
    }
    
    const data = await response.json();
    return data.messages;
  } catch (error) {
    console.error('获取消息列表错误:', error);
    throw error;
  }
}

/**
 * 创建新对话
 * @param userId 用户ID
 * @param title 对话标题
 * @param modelId 模型ID
 * @returns 创建的对话
 */
export async function createConversation(
  userId: string, 
  title: string, 
  modelId?: string
): Promise<Conversation> {
  try {
    // 向API发送创建对话请求
    const response = await fetch('/api/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, title, modelId }),
    });
    
    if (!response.ok) {
      throw new Error(`创建对话失败: ${response.status}`);
    }
    
    const data = await response.json();
    return data.conversation;
  } catch (error) {
    console.error('创建对话错误:', error);
    throw error;
  }
}

/**
 * 保存消息到对话
 * @param conversationId 对话ID
 * @param message 消息内容
 * @returns 保存的消息
 */
export async function saveMessageToConversation(
  conversationId: string, 
  message: { content: string; role: string }
): Promise<Message> {
  try {
    // 向API发送保存消息请求
    const response = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
    
    if (!response.ok) {
      throw new Error(`保存消息失败: ${response.status}`);
    }
    
    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error('保存消息错误:', error);
    throw error;
  }
}
