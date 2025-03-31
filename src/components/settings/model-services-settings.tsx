"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ModelServicesSettings() {
  // 状态管理：当前选中的提供商
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  // 模拟的提供商列表
  const providers = [
    { id: "openai", name: "OpenAI" },
    { id: "gemini", name: "Gemini" },
  ];

  return (
    <div className="flex h-full">
      {/* 左侧提供商列表 */}
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
                {provider.name}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* 右侧提供商详情 */}
      <div className="flex-1 p-6">
        {selectedProvider ? (
          <div>
            <h3 className="text-lg font-medium mb-4">
              {providers.find((p) => p.id === selectedProvider)?.name} 配置
            </h3>
            <p className="text-muted-foreground">
              此功能正在开发中，敬请期待...
            </p>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">请从左侧选择一个提供商以配置</p>
          </div>
        )}
      </div>
    </div>
  );
}
