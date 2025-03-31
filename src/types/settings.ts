// 提供商配置基础类型
export interface ProviderConfig {
  enabled: boolean;
  apiKey: string;
  apiAddress: string;
  models: string[];
}

// 提供商配置映射类型
export type ProviderConfigs = {
  [key: string]: ProviderConfig;
};

// 提供商配置组件的 Props 接口
export interface ProviderConfigProps<T extends ProviderConfig> {
  config: T;
  onConfigChange: (newConfig: Partial<T>) => void;
}
