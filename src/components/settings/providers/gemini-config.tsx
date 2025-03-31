"use client";

import { ApiKeyInput } from "../common/api-key-input";
import { ModelListEditor } from "../common/model-list-editor";
import { ProviderConfig, ProviderConfigProps } from "@/types/settings";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export function GeminiConfig({
  config,
  onConfigChange,
}: ProviderConfigProps<ProviderConfig>) {
  const handleApiKeyChange = (apiKey: string) => {
    onConfigChange({ apiKey });
  };

  const handleModelsChange = (models: string[]) => {
    onConfigChange({ models });
  };

  const handleTestApiKey = () => {
    // 这里可以实现测试 Gemini API 密钥的逻辑
    console.log("测试 Gemini API 密钥");
  };

  // Gemini API Key 获取链接
  const geminiApiKeyLink = (
    <Button
      variant="link"
      className="px-2"
      onClick={() => window.open("https://ai.google.dev/", "_blank")}
    >
      <ExternalLink className="h-4 w-4 mr-1" />
      获取 API Key
    </Button>
  );

  return (
    <div className="space-y-6">
      <ApiKeyInput
        label="Gemini API 密钥"
        value={config.apiKey}
        onChange={handleApiKeyChange}
        onTest={handleTestApiKey}
        extraAction={geminiApiKeyLink}
      />

      <ModelListEditor
        title="Gemini 模型列表"
        models={config.models}
        onModelsChange={handleModelsChange}
        onAddModel={() => {
          // 这里可以实现添加 Gemini 模型的逻辑，或者传递回调函数
        }}
      />
    </div>
  );
}
