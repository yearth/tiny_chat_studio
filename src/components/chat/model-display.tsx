import { useState, useEffect } from "react";
import { getModelById } from "@/data/models";

interface ModelDisplayProps {
  modelId?: string;
  defaultText?: string;
  conversationId?: string; // 对话 ID（已不再使用）
  messageId?: string; // 添加消息 ID
}

interface AIModel {
  id: string;
  name: string;
  provider: string;
  modelId: string;
  description?: string;
  iconUrl?: string;
  isActive?: boolean;
}

/**
 * 模型显示组件
 * 根据模型ID或消息ID显示对应的模型名称
 */
export function ModelDisplay({
  modelId,
  defaultText = "AI",
  conversationId, // 保留为了兼容性
  messageId,
}: ModelDisplayProps) {
  const [modelInfo, setModelInfo] = useState<AIModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 如果有消息ID，则从消息中获取模型信息
    if (messageId) {
      fetchModelInfoByMessageId(messageId);
    } else if (modelId) {
      // 如果有模型ID，则使用客户端数据
      const model = getModelById(modelId);
      if (model) {
        setModelInfo({
          id: model.id,
          name: model.name,
          provider: model.provider || "",
          modelId: model.modelId || model.id,
        });
      }
    }
  }, [messageId, modelId]);

  // 根据消息ID获取模型信息
  const fetchModelInfoByMessageId = async (messageId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/messages/${messageId}/model`
      );

      if (!response.ok) {
        throw new Error(`获取模型信息失败: ${response.statusText}`);
      }

      const data = await response.json();
      // 如果没有模型信息（可能是用户消息），使用默认文本
      if (!data) {
        setModelInfo(null);
        return;
      }
      
      setModelInfo(data);
    } catch (err) {
      console.error("获取模型信息错误:", err);
      setError(err instanceof Error ? err.message : "获取模型信息失败");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <span className="animate-pulse">{defaultText}</span>;
  }

  if (error || !modelInfo) {
    return <span>{defaultText}</span>;
  }

  return <span>{modelInfo.name}</span>;
}
