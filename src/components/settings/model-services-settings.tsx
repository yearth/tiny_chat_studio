"use client";

import { useState } from "react";
import { Plus, Eye, EyeOff, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CustomDialogContent } from "@/components/ui/custom-dialog";

// 提供商配置类型定义
interface ProviderConfig {
  enabled: boolean;
  apiKey: string;
  apiAddress: string;
  models: string[];
}

type ProviderConfigs = {
  [key: string]: ProviderConfig;
};

export function ModelServicesSettings() {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
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

  // 处理启用/禁用提供商
  const handleToggleProvider = (enabled: boolean) => {
    if (!selectedProvider) return;

    setProviderConfigs((prev) => ({
      ...prev,
      [selectedProvider]: {
        ...prev[selectedProvider],
        enabled,
      },
    }));
  };

  // 处理 API 密钥变更
  const handleApiKeyChange = (value: string) => {
    if (!selectedProvider) return;

    setProviderConfigs((prev) => ({
      ...prev,
      [selectedProvider]: {
        ...prev[selectedProvider],
        apiKey: value,
      },
    }));
  };

  // 处理 API 地址变更
  const handleApiAddressChange = (value: string) => {
    if (!selectedProvider) return;

    setProviderConfigs((prev) => ({
      ...prev,
      [selectedProvider]: {
        ...prev[selectedProvider],
        apiAddress: value,
      },
    }));
  };

  // 处理删除模型
  const handleDeleteModel = (modelName: string) => {
    if (!selectedProvider) return;

    setProviderConfigs((prev) => ({
      ...prev,
      [selectedProvider]: {
        ...prev[selectedProvider],
        models: prev[selectedProvider].models.filter(
          (model) => model !== modelName
        ),
      },
    }));
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

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API 密钥</Label>
                <div className="flex space-x-2">
                  <Input
                    id="api-key"
                    type={showApiKey ? "text" : "password"}
                    value={providerConfigs[selectedProvider]?.apiKey || ""}
                    onChange={(e) => handleApiKeyChange(e.target.value)}
                    placeholder="输入 API 密钥"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button>检测</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-address">API 地址 (可选)</Label>
                <Input
                  id="api-address"
                  value={providerConfigs[selectedProvider]?.apiAddress || ""}
                  onChange={(e) => handleApiAddressChange(e.target.value)}
                  placeholder="输入 API 地址"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">模型列表</h4>
                <Dialog
                  open={isAddModelDialogOpen}
                  onOpenChange={setIsAddModelDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      添加模型
                    </Button>
                  </DialogTrigger>
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

              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {providerConfigs[selectedProvider]?.models.length ? (
                  providerConfigs[selectedProvider].models.map((model) => (
                    <div
                      key={model}
                      className="flex justify-between items-center p-2 bg-accent/30 rounded-md"
                    >
                      <span>{model}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteModel(model)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    暂无模型
                  </p>
                )}
              </div>
            </div>
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
