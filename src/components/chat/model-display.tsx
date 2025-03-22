import { AIModel } from "@prisma/client";

interface ModelDisplayProps {
  modelInfo?: AIModel;
}

/**
 * 模型显示组件
 * 根据模型ID或消息ID显示对应的模型名称
 */
export function ModelDisplay({ modelInfo }: ModelDisplayProps) {
  return <span>{modelInfo?.name || "AI"}</span>;
}
