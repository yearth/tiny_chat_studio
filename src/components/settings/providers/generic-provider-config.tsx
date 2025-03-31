"use client";

import { ApiKeyInput } from "../common/api-key-input";
import { ApiAddressInput } from "../common/api-address-input";
import { ModelListEditor } from "../common/model-list-editor";
import { ProviderConfig, ProviderConfigProps } from "@/types/settings";

export function GenericProviderConfig({
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

  return (
    <div className="space-y-6">
      <ApiKeyInput
        label="API 密钥"
        value={config.apiKey}
        onChange={handleApiKeyChange}
      />

      <ApiAddressInput
        label="API 地址 (可选)"
        value={config.apiAddress}
        onChange={handleApiAddressChange}
      />

      <ModelListEditor
        title="模型列表"
        models={config.models}
        onModelsChange={handleModelsChange}
        onAddModel={() => {
          // 这里可以实现添加模型的逻辑，或者传递回调函数
        }}
      />
    </div>
  );
}
