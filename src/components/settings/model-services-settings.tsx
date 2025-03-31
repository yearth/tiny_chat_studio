"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CustomDialogContent } from "@/components/ui/custom-dialog";

// 导入类型
import { ProviderConfig, ProviderConfigs, ProviderConfigProps } from "@/types/settings";

// 导入提供商配置组件
import { OpenAIConfig } from "./providers/openai-config";
import { GeminiConfig } from "./providers/gemini-config";
import { GenericProviderConfig } from "./providers/generic-provider-config";

// 定义提供商配置组件映射
const ProviderConfigComponents: { [key: string]: React.ComponentType<ProviderConfigProps<any>> } = {
  openai: OpenAIConfig,
  gemini: GeminiConfig,
  // 可以在这里添加更多特定提供商的配置组件
};

export function ModelServicesSettings() {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [isAddModelDialogOpen, setIsAddModelDialogOpen] = useState(false);

  // 提供商列表
  const providers = [
    { id: "openai", name: "OpenAI" },
    { id: "gemini", name: "Gemini" },
  ];

  // 提供商配置状态
  const [providerConfigs, setProviderConfigs] = useState<ProviderConfigs>({
    openai: {
      enabled: true,
      apiKey: "",
      apiAddress: "",
      models: ["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo"],
    },
    gemini: {
      enabled: false,
      apiKey: "",
      apiAddress: "",
      models: ["gemini-pro", "gemini-ultra"],
    },
  });

  // 处理特定提供商配置变更的统一回调函数
  const handleSpecificConfigChange = (newConfig: Partial<ProviderConfig>) => {
    if (!selectedProvider) return;

    setProviderConfigs((prev) => ({
      ...prev,
      [selectedProvider]: {
        ...prev[selectedProvider],
        ...newConfig,
      },
    }));
  };

  // 处理启用/禁用提供商
  const handleToggleProvider = (enabled: boolean) => {
    handleSpecificConfigChange({ enabled });
  };

  return (
    <div className="flex h-full">
      {/* 提供商列表 */}
      <div className="w-56 border-r">
        <div className="p-4">
          <Button variant="outline" className="w-full" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            添加提供商
          </Button>
        </div>
        <ScrollArea className="h-[calc(100%-60px)]">
          <div className="space-y-1 p-2">
            {providers.map((provider) => (
              <Button
                key={provider.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  selectedProvider === provider.id
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/50"
                )}
                onClick={() => setSelectedProvider(provider.id)}
              >
                <div
                  className={cn(
                    "h-2 w-2 rounded-full mr-2",
                    providerConfigs[provider.id]?.enabled
                      ? "bg-green-500"
                      : "bg-gray-400"
                  )}
                />
                {provider.name}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* 提供商详情 */}
      <div className="flex-1 p-6">
        {selectedProvider ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">
                {providers.find((p) => p.id === selectedProvider)?.name} 配置
              </h3>
              <div className="flex items-center space-x-2">
                <Label htmlFor="provider-enabled">启用此提供商</Label>
                <Switch
                  id="provider-enabled"
                  checked={providerConfigs[selectedProvider]?.enabled || false}
                  onCheckedChange={handleToggleProvider}
                />
              </div>
            </div>

            {/* 动态渲染提供商配置组件 */}
            {(() => {
              const currentConfig = providerConfigs[selectedProvider];
              const ComponentToRender = ProviderConfigComponents[selectedProvider] || GenericProviderConfig;
              
              return (
                <ComponentToRender 
                  config={currentConfig} 
                  onConfigChange={handleSpecificConfigChange} 
                />
              );
            })()}
            
            {/* 添加模型对话框 */}
            <Dialog
              open={isAddModelDialogOpen}
              onOpenChange={setIsAddModelDialogOpen}
            >
              <CustomDialogContent>
                <DialogHeader>
                  <DialogTitle>添加模型</DialogTitle>
                  <DialogDescription>
                    此功能正在开发中，敬请期待...
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddModelDialogOpen(false)}
                  >
                    取消
                  </Button>
                  <Button onClick={() => setIsAddModelDialogOpen(false)}>
                    确认
                  </Button>
                </DialogFooter>
              </CustomDialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">
              请从左侧选择一个提供商以配置
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
