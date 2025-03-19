import { useState } from "react";
import { Send, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { availableModels } from "@/data/models";

interface ChatInputProps {
  onSendMessage: (message: string, modelId: string) => Promise<void>;
  disabled?: boolean;
}

/**
 * 聊天输入组件
 * 包含输入框、发送按钮和模型选择器
 */
export function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState(availableModels[0].id);

  const handleSend = async () => {
    if (input.trim() && !disabled) {
      await onSendMessage(input, selectedModel);
      setInput("");
    }
  };

  return (
    <div className="p-4 border-t border-muted">
      <div className="max-w-3xl mx-auto">
        {/* 模型选择器 */}
        <div className="mb-2 flex justify-end">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-muted text-foreground text-sm border border-input rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
            disabled={disabled}
          >
            {availableModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>
        <div className="relative rounded-xl bg-muted focus-within:ring-1 focus-within:ring-primary">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="向 AI 提问"
            className="border-none bg-transparent py-3 px-4 focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={disabled}
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              disabled={disabled}
            >
              <Mic className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              onClick={handleSend}
              disabled={disabled || !input.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
