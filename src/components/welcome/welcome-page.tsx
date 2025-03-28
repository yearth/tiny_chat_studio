"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { EnhancedChatInput } from "@/components/chat/enhanced-chat-input";
import { useChat } from "@/hooks/useChat";
import { useWelcomeStorage } from "@/hooks/useWelcomeStorage";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserId } from "@/hooks/useUserId";

export function WelcomePage() {
  const router = useRouter();
  const userId = useUserId();

  const { data: session } = useSession();
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
    try {
      await createChat(message, modelId);
    } catch (err) {
      console.error("创建聊天失败:", err);
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

          <div className="mt-8 relative">
            {/* 跳动的小点加载指示器 */}
            {/* <AnimatePresence>
              {(isCreating || isAddingChat) && (
                <motion.div
                  className="absolute -top-8 left-1/2 -translate-x-1/2 flex space-x-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-primary rounded-full"
                      animate={{ y: [0, -6, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        repeatType: "loop",
                        ease: "easeInOut",
                        delay: i * 0.1, // 错开动画时间，形成波浪效果
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence> */}

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
