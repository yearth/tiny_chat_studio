import { useState } from "react";
import { Send, Paperclip, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { availableModels } from "@/data/models";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { LoginDialog } from "@/components/auth/login-dialog";
import { useSession } from "next-auth/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface EnhancedChatInputProps {
  onSendMessage: (
    message: string,
    modelId: string,
    files?: File[]
  ) => Promise<void>;
  disabled?: boolean;
  onModelChange?: (modelId: string) => void;
  initialModelId?: string;
  className?: string;
}

/**
 * 增强版聊天输入组件
 * 包含输入框、发送按钮、文件上传和模型选择器
 */
export function EnhancedChatInput({
  onSendMessage,
  disabled = false,
  onModelChange,
  initialModelId = availableModels[0].id,
  className = "",
}: EnhancedChatInputProps) {
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState(initialModelId);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
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

      await onSendMessage(
        input,
        selectedModel,
        files.length > 0 ? files : undefined
      );
      setInput("");
      setFiles([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  // 获取当前选中的模型信息
  const currentModel =
    availableModels.find((model) => model.id === selectedModel) ||
    availableModels[0];

  return (
    <div className={`flex justify-center ${className}`}>
      <div className="w-full max-w-3xl">
        <div className="relative rounded-xl border border-input bg-background shadow-sm">
          {/* 文件上传预览区域 */}
          {files.length > 0 && (
            <div className="px-4 pt-3 pb-1 border-b border-input">
              <div className="flex flex-wrap gap-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-muted rounded-md px-2 py-1 text-xs"
                  >
                    <span className="truncate max-w-[150px]">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1"
                      onClick={() =>
                        setFiles(files.filter((_, i) => i !== index))
                      }
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="px-3 pt-2">
            <Textarea
              value={input}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setInput(e.target.value)
              }
              onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Hi, 想聊点什么？"
              className="min-h-24 border-none bg-white dark:bg-[#0A0A0A] text-black dark:text-white resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
              disabled={disabled}
            />
          </div>

          {/* 底部控制栏 */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-border">
            <div className="flex items-center gap-2">
              {/* 文件上传按钮 */}
              <label className="cursor-pointer p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent">
                <Paperclip className="h-5 w-5" />
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={disabled}
                />
              </label>

              {/* 模型选择器 */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 text-xs text-muted-foreground rounded-md hover:bg-accent"
                    disabled={disabled}
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
                        variant={
                          model.id === selectedModel ? "secondary" : "ghost"
                        }
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
            </div>

            {/* 发送按钮 */}
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground rounded-full hover:bg-accent"
              onClick={handleSend}
              disabled={disabled || !input.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* 使用量显示 */}
        <div className="mt-2 flex justify-between items-center">
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
        </div>

        {/* 登录对话框 */}
        <LoginDialog
          open={showLoginDialog}
          onOpenChange={setShowLoginDialog}
          reason="usage_limit"
        />
      </div>
    </div>
  );
}
