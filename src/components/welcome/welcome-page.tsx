"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { EnhancedChatInput } from "@/components/chat/enhanced-chat-input";
import { DEV_USER_ID } from "@/constants/mockId";
import { useChat } from "@/hooks/useChat";
import { useWelcomeStorage } from "@/hooks/useWelcomeStorage";
import { useState, useCallback } from "react";

export function WelcomePage() {
  const router = useRouter();
  const { data: session } = useSession();

  const userId =
    process.env.NODE_ENV === "production" && session?.user?.id
      ? session.user.id
      : DEV_USER_ID;

  const { addChat, isAddingChat } = useChat(userId);
  const { setMessage, setModelId, setIsFromWelcome } = useWelcomeStorage();

  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 创建聊天的函数
  const createChat = useCallback(
    async (message: string, modelId: string) => {
      setIsCreating(true);
      setError(null);

      try {
        // 将必要信息存入 localStorage，用于在 chat 页面中发起对话
        setMessage(message);
        setModelId(modelId);
        setIsFromWelcome(true);

        const newChat = await addChat("新对话");

        if (!newChat) {
          throw new Error("创建聊天失败");
        }

        router.push(`/chat/${newChat.id}`);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("创建聊天失败"));
        throw err;
      } finally {
        setIsCreating(false);
      }
    },
    [router, addChat, setMessage, setModelId, setIsFromWelcome]
  );

  const handleSendMessage = async (
    message: string,
    modelId: string,
    files?: File[]
  ) => {
    // 暂时注释掉文件相关的逻辑
    /*
    let fileIds = [];
    
    if (files && files.length > 0) {
      try {
        // 先上传文件到服务器临时存储
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        
        const response = await fetch('/api/upload/temp', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error(`文件上传失败: ${response.statusText}`);
        }
        
        const result = await response.json();
        if (result.success && result.fileIds) {
          fileIds = result.fileIds.map((file: any) => file.id);
        }
      } catch (error) {
        console.error('文件上传失败:', error);
        alert('文件上传失败，请重试');
        return;
      }
    }
    */

    try {
      await createChat(message, modelId);
    } catch (err) {
      console.error("创建聊天失败:", err);
      // 错误已在 createChat 函数中设置，这里不需要再显示 alert
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col items-center justify-center flex-1 p-4">
        <div className="w-full max-w-4xl space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight gradient-text">
              欢迎使用 Tiny Chat Studio
            </h1>
            <p className="text-muted-foreground">
              {session
                ? `您好，${session.user?.name || "用户"}`
                : "开始您的AI对话之旅"}
            </p>
          </div>

          <div className="mt-8">
            <EnhancedChatInput
              onSendMessage={handleSendMessage}
              isSendingUserMessage={isCreating || isAddingChat}
              isFetchingAIResponse={false}
              onAbortFetchAIResponse={() => {}}
            />
          </div>
          {error && (
            <div className="text-red-500 text-center mt-2">
              创建聊天失败，请重试
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
