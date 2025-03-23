import { useState } from "react";
import { Send, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { availableModels } from "@/data/models";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { LoginDialog } from "@/components/auth/login-dialog";
import { useSession } from "next-auth/react";

interface ChatInputProps {
  onSendMessage: (message: string, modelId: string) => Promise<void>;
  disabled?: boolean;
  onModelChange?: (modelId: string) => void; // 添加模型变化回调
  initialModelId?: string; // 初始模型ID
}

/**
 * 聊天输入组件
 * 包含输入框、发送按钮和模型选择器
 */
export function ChatInput({ 
  onSendMessage, 
  disabled = false, 
  onModelChange,
  initialModelId = availableModels[0].id
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState(initialModelId);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const { data: session } = useSession();
  const { usageCount, isLimitReached, incrementUsage, limit } = useUsageLimit();

  const handleSend = async () => {
    if (input.trim() && !disabled) {
      // 检查使用限制
      const canSend = await incrementUsage();
      if (!canSend) {
        setShowLoginDialog(true);
        return;
      }
      
      await onSendMessage(input, selectedModel);
      setInput("");
    }
  };

  return (
    <div className="p-4 flex justify-center">
      <div className="max-w-3xl w-full">
        {/* 使用量显示 */}
        <div className="mb-2 flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            今日使用: {usageCount}/{limit} 次
            {!session && (
              <Button 
                variant="link" 
                className="text-xs p-0 h-auto ml-2" 
                onClick={() => setShowLoginDialog(true)}
              >
                登录获取更多次数
              </Button>
            )}
          </div>
          
          {/* 模型选择器 */}
          <div className="flex justify-end">
          <select
            value={selectedModel}
            onChange={(e) => {
              const newModelId = e.target.value;
              setSelectedModel(newModelId);
              if (onModelChange) {
                onModelChange(newModelId);
              }
            }}
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
      
      {/* 登录对话框 */}
      <LoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        reason="usage_limit"
      />
    </div>
  );
}
