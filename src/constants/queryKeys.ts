/**
 * React Query 查询键常量
 * 集中管理所有查询键，方便维护和引用
 */

export const QueryKeys = {
  // 聊天相关查询键
  CHATS: "chats",
  ADD_CHAT: "add-chat",

  // 消息相关查询键
  MESSAGES: "messages",

  // 用户相关查询键
  USERS: "users",

  // 模型相关查询键
  MODELS: "models",
} as const;
