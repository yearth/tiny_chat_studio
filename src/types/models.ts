import { Message, AIModel } from "@prisma/client";

// 扩展 Message 类型，包含可选的 model 关系
export interface MessageWithModel extends Message {
  model?: AIModel | null;
}
