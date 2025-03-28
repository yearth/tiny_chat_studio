import { useState } from "react";
import { Send, Paperclip, ChevronDown, Loader2, Square } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
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

// 定义全局 CSS 样式，用于霓虹灯边框动画
// const neonBorderStyles = {
//   "--angle": "0deg",
//   "--border-width": "2px",
//   "--primary-rgb": "var(--primary-rgb, 24, 144, 255)",
// };

interface EnhancedChatInputProps {
  onSendMessage: (
    message: string,
    modelId: string,
    files?: File[]
  ) => Promise<void>;
  isSendingUserMessage: boolean;
  isFetchingAIResponse: boolean;
  onAbortFetchAIResponse: () => void;
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
  isSendingUserMessage = false,
  isFetchingAIResponse = false,
  onAbortFetchAIResponse,
  onModelChange,
  initialModelId = availableModels[0].id,
  className = "",
}: EnhancedChatInputProps) {
  // 计算总的禁用状态
  const isDisabled = isSendingUserMessage || isFetchingAIResponse;
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState(initialModelId);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const { data: session } = useSession();
  const { usageCount, isLimitReached, incrementUsage, limit } = useUsageLimit();

  const handleSend = async () => {
    if (input.trim() && !isDisabled) {
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
        {/* 外层容器 - 保持相对定位和圆角 */}
        <div className="relative rounded-xl border border-input bg-background shadow-sm overflow-hidden">
          {/* 霓虹灯边框动画层 */}
          <AnimatePresence>
            {
              <motion.div
                className="absolute inset-0 z-0 rounded-xl pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  "--angle": "360deg",
                }}
                exit={{ opacity: 0 }}
                transition={{
                  opacity: { duration: 0.3 },
                  "--angle": { duration: 3, repeat: Infinity, ease: "linear" },
                }}
                style={{
                  // ...neonBorderStyles,
                  background:
                    "conic-gradient(from 0deg, transparent 0%, red 10%, red, 0.6) 20%, red, 0.3) 30%, transparent 40%)",
                  // 使用遮罩技术，只显示边框部分
                  // WebkitMask:
                  //   "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
                  // WebkitMaskComposite: "xor",
                  maskComposite: "exclude",
                  padding: "2px",
                }}
              />
            }
          </AnimatePresence>

          {/* 内容层 - 确保在动画层之上 */}
          <div className="relative z-10">
            {/* 文件上传预览区域 */}
            {files.length > 0 && (
              <div className="px-4 pt-3 pb-1 border-b border-input">
                <div className="flex flex-wrap gap-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-muted rounded-md px-2 py-1 text-xs"
                    >
                      <span className="truncate max-w-[150px]">
                        {file.name}
                      </span>
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
                  if (e.key === "Enter" && !e.shiftKey && !isDisabled) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Hi, 想聊点什么？"
                className="min-h-24 border-none bg-transparent text-black dark:bg-transparent dark:text-white resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
                disabled={isDisabled}
              />
            </div>

            {/* 底部控制栏 */}
            <div className="flex items-center justify-between px-3 py-2 border-t border-border">
              <div className="flex items-center gap-2">
                {/* 文件上传按钮 */}
                <label
                  className={`p-1 text-muted-foreground rounded-md ${
                    !isDisabled
                      ? "cursor-pointer hover:text-foreground hover:bg-accent"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <Paperclip className="h-5 w-5" />
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isDisabled}
                  />
                </label>

                {/* 模型选择器 */}
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

              {/* 发送/停止按钮 - 使用固定尺寸容器和相对定位 */}
              <div className="w-10 h-10 relative">
                <AnimatePresence mode="popLayout" initial={false}>
                  {isFetchingAIResponse ? (
                    // 停止按钮 - 当 AI 正在响应时显示
                    <motion.button
                      key="stop"
                      type="button"
                      className={cn(
                        "absolute inset-0 flex items-center justify-center",
                        "text-muted-foreground hover:text-foreground rounded-full hover:bg-accent"
                      )}
                      onClick={onAbortFetchAIResponse}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Square className="h-5 w-5" />
                    </motion.button>
                  ) : isSendingUserMessage ? (
                    // 加载按钮 - 当用户消息正在发送时显示
                    <motion.button
                      key="loader"
                      type="button"
                      className={cn(
                        "absolute inset-0 flex items-center justify-center",
                        "text-primary rounded-full"
                      )}
                      disabled={true}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </motion.button>
                  ) : (
                    // 发送按钮 - 默认状态
                    <motion.button
                      key="send"
                      type="button"
                      className={cn(
                        "absolute inset-0 flex items-center justify-center",
                        "text-muted-foreground hover:text-foreground rounded-full hover:bg-accent"
                      )}
                      onClick={handleSend}
                      disabled={!input.trim()}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Send className="h-5 w-5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
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
