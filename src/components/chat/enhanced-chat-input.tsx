import { useState } from "react";
import { availableModels } from "@/data/models";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { LoginDialog } from "@/components/auth/login-dialog";
import { useSession } from "next-auth/react";
import { ChatInputArea } from "./chat-input-area";
import { FileUpload } from "./file-upload";
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
          {/* 内容层 */}
          <div className="relative z-10">
            {/* 文件上传预览区域 */}
            {/* <FileUpload
              files={files}
              setFiles={setFiles}
              isDisabled={isDisabled}
              showPreview={files.length > 0}
            /> */}

            {/* 聊天输入区域 */}
            <ChatInputArea
              input={input}
              setInput={setInput}
              onSendMessage={handleSend}
              isDisabled={isDisabled}
            />

            {/* 底部控制栏 */}
            <div className="flex items-center justify-between px-3 py-2 border-t border-border">
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

              {/* 发送/停止按钮 */}
              <SendButton
                isSendingUserMessage={isSendingUserMessage}
                isFetchingAIResponse={isFetchingAIResponse}
                onSendMessage={handleSend}
                onAbortFetchAIResponse={onAbortFetchAIResponse}
                input={input}
              />
            </div>
          </div>
        </div>

        {/* 使用量显示 */}
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
