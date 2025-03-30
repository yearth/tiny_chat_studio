import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { availableModels } from "@/data/models";
import { ChevronDown } from "lucide-react";
import React from "react";

interface ModelSelectorProps {
  selectedModel: string;
  setSelectedModel: (modelId: string) => void;
  onModelChange?: (modelId: string) => void;
  isDisabled: boolean;
}

/**
 * 模型选择器组件
 * 显示当前选中的模型，并提供一个下拉菜单来切换模型
 */
export function ModelSelector({
  selectedModel,
  setSelectedModel,
  onModelChange,
  isDisabled,
}: ModelSelectorProps) {
  // 获取当前选中的模型信息
  const currentModel =
    availableModels.find((model) => model.id === selectedModel) ||
    availableModels[0];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 text-xs text-muted-foreground rounded-md hover:bg-accent"
          disabled={isDisabled}
        >
          {currentModel.name}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0" align="start">
        <div className="p-1">
          {availableModels.map((model) => (
            <Button
              key={model.id}
              variant={model.id === selectedModel ? "secondary" : "ghost"}
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => {
                setSelectedModel(model.id);
                if (onModelChange) {
                  onModelChange(model.id);
                }
              }}
            >
              {model.name}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
