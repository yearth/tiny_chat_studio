import { useState, useRef, useEffect } from "react";
import { availableModels } from "@/data/models";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { LoginDialog } from "@/components/auth/login-dialog";
import { useSession } from "next-auth/react";
import { Expand, Shrink } from "lucide-react";
import { motion } from "framer-motion";
import { ChatInputArea } from "./chat-input-area";
// import { FileUpload } from "./file-upload";
import { ModelSelector } from "./model-selector";
import { SendButton } from "./send-button";
import { UsageDisplay } from "./usage-display";

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
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: session } = useSession();
  const { usageCount, isLimitReached, incrementUsage, limit } = useUsageLimit();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    if (input.trim() && !isDisabled) {
      // 检查使用限制
      const canSend = await incrementUsage();
      if (!canSend) {
        setShowLoginDialog(true);
        return;
      }

      try {
        // 调用外部传入的发送函数
        await onSendMessage(
          input,
          selectedModel,
          files.length > 0 ? files : undefined
        );

        // 清空输入和文件
        setInput("");
        setFiles([]);

        // 发送成功后自动收起
        setIsExpanded(false);
      } catch (error) {
        console.error("Failed to send message:", error);
        // 可以添加错误提示
      }
    }
  };

  // 使用 useEffect 处理键盘事件
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 确保事件源是我们的输入框
      if (document.activeElement === textareaRef.current) {
        // 非展开状态下的 Enter 发送（不带 Shift）
        if (event.key === "Enter" && !event.shiftKey && !isExpanded) {
          event.preventDefault();
          handleSend();
        }

        // 展开状态下的 Cmd/Ctrl + Enter 发送
        if (
          event.key === "Enter" &&
          (event.metaKey || event.ctrlKey) &&
          isExpanded
        ) {
          event.preventDefault();
          handleSend();
        }
      }
    };

    // 添加事件监听器
    document.addEventListener("keydown", handleKeyDown);

    // 清理函数
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isExpanded, handleSend]); // 依赖项包括 isExpanded 和 handleSend

  return (
    <div className={`flex justify-center ${className}`}>
      <div className="w-full max-w-3xl relative">
        {/* 外层容器 - 保持相对定位和圆角 */}
        <div className="rounded-xl border border-input bg-background shadow-sm overflow-hidden">
          {/* 内容层 */}
          <div className="relative z-10">
            {/* 文件上传预览区域 */}
            {/* <FileUpload
              files={files}
              setFiles={setFiles}
              isDisabled={isDisabled}
              showPreview={files.length > 0}
            /> */}

            {/* 聊天输入区域 - 只对这一部分应用动画 */}
            <motion.div
              animate={{ height: isExpanded ? "calc(50vh - 48px)" : "auto" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{ overflow: isExpanded ? "hidden" : "visible" }}
            >
              <ChatInputArea
                ref={textareaRef}
                input={input}
                setInput={setInput}
                onSendMessage={handleSend}
                isDisabled={isDisabled}
                isExpanded={isExpanded}
                className={
                  isExpanded ? "flex-grow overflow-y-auto min-h-[100px]" : ""
                }
              />
            </motion.div>

            {/* 底部控制栏 - 固定高度，不参与动画 */}
            <div className="h-[48px] flex items-center justify-between px-3 py-2 border-t border-border">
              <div className="flex items-center gap-2">
                {/* 文件上传按钮 */}
                {/* <FileUpload
                    files={files}
                    setFiles={setFiles}
                    isDisabled={isDisabled}
                    showPreview={false}
                  /> */}

                {/* 模型选择器 */}
                <ModelSelector
                  selectedModel={selectedModel}
                  setSelectedModel={setSelectedModel}
                  onModelChange={onModelChange}
                  isDisabled={isDisabled}
                />
              </div>

              {/* 右侧操作区域 */}
              <div className="flex items-center gap-2">
                {/* 展开/收起按钮 */}
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-accent"
                  aria-label={isExpanded ? "收起输入框" : "展开输入框"}
                  title={isExpanded ? "收起输入框" : "展开输入框"}
                >
                  {isExpanded ? (
                    <Shrink className="h-5 w-5" />
                  ) : (
                    <Expand className="h-5 w-5" />
                  )}
                </button>

                {/* 发送/停止按钮 */}
                <SendButton
                  isSendingUserMessage={isSendingUserMessage}
                  isFetchingAIResponse={isFetchingAIResponse}
                  onSendMessage={handleSend}
                  onAbortFetchAIResponse={onAbortFetchAIResponse}
                  input={input}
                  isExpanded={isExpanded}
                />
              </div>
            </div>
          </div>
        </div>

        <UsageDisplay
          usageCount={usageCount}
          limit={limit}
          session={session}
          setShowLoginDialog={setShowLoginDialog}
        />

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
