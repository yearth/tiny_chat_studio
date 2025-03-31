"use client";

import { ApiKeyInput } from "../common/api-key-input";
import { ApiAddressInput } from "../common/api-address-input";
import { ModelListEditor } from "../common/model-list-editor";
import { ProviderConfig, ProviderConfigProps } from "@/types/settings";

export function OpenAIConfig({
  config,
  onConfigChange,
}: ProviderConfigProps<ProviderConfig>) {
  const handleApiKeyChange = (apiKey: string) => {
    onConfigChange({ apiKey });
  };

  const handleApiAddressChange = (apiAddress: string) => {
    onConfigChange({ apiAddress });
  };

  const handleModelsChange = (models: string[]) => {
    onConfigChange({ models });
  };

  const handleTestApiKey = () => {
    // 这里可以实现测试 OpenAI API 密钥的逻辑
    console.log("测试 OpenAI API 密钥");
  };

  return (
    <div className="space-y-6">
      <ApiKeyInput
        label="OpenAI API 密钥"
        value={config.apiKey}
        onChange={handleApiKeyChange}
        onTest={handleTestApiKey}
      />

      <ApiAddressInput
        label="API 地址 (可选)"
        value={config.apiAddress}
        onChange={handleApiAddressChange}
        placeholder="例如：https://api.openai.com/v1"
      />

      <ModelListEditor
        title="OpenAI 模型列表"
        models={config.models}
        onModelsChange={handleModelsChange}
        onAddModel={() => {
          // 这里可以实现添加 OpenAI 模型的逻辑，或者传递回调函数
        }}
      />
    </div>
  );
}
