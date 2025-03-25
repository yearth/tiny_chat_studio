"use client";

import { EnhancedChatInput } from "@/components/chat/enhanced-chat-input";
import { MessageList } from "@/components/chat/message-list";
import { useMessage, saveMessage } from "@/hooks/useMessage";
import { useState, useEffect } from "react";
import { use } from "react";
import { Message } from "@prisma/client";

export default function ChatPage({ params }: { params: any }) {
  const resolvedParams =
    typeof params === "object" && !("then" in params) ? params : use(params);
  const chatId = resolvedParams.chatId;

  // 初始化状态
  const [hasInitialized, setHasInitialized] = useState(false);
  const [welcomeData, setWelcomeData] = useState<{
    fromWelcome: boolean;
    welcomeMessage: string;
    welcomeModelId: string;
  }>({ fromWelcome: false, welcomeMessage: "", welcomeModelId: "" });

  // 使用 useState 来跟踪当前选择的模型
  const [currentModelId, setCurrentModelId] = useState<string>(
    "deepseek/deepseek-chat:free"
  );

  // 使用 useMessage 钩子获取消息列表和发送消息的功能
  const {
    messages,
    sendMessage,
    isSending,
    streamingMessageId,
    streamingContent,
  } = useMessage(chatId);

  // 初始化并从 sessionStorage 获取数据
  useEffect(() => {
    // 只在客户端运行这段代码
    if (typeof window !== "undefined" && !hasInitialized) {
      // 1. 从 sessionStorage 获取 fromWelcome flag
      const fromWelcome = sessionStorage.getItem("fromWelcome") === "true";

      let welcomeMessage = "";
      let welcomeModelId = "deepseek/deepseek-chat:free";

      // 2. 如果 fromWelcome 为 true，才获取其他数据
      if (fromWelcome) {
        // 获取并解码用户消息
        const storedMessage = sessionStorage.getItem("welcomeMessage");
        if (storedMessage) {
          welcomeMessage = decodeURIComponent(storedMessage);
        }

        // 获取模型 ID
        const storedModelId = sessionStorage.getItem("welcomeModelId");
        if (storedModelId) {
          welcomeModelId = storedModelId;
          // 3. 设置当前模型 ID
          setCurrentModelId(welcomeModelId);
        }

        // 存储获取到的数据
        setWelcomeData({
          fromWelcome,
          welcomeMessage,
          welcomeModelId,
        });

        // 清除 sessionStorage 中的数据，防止页面刷新后重复发送
        sessionStorage.removeItem("fromWelcome");
        sessionStorage.removeItem("welcomeMessage");
        sessionStorage.removeItem("welcomeModelId");
      }

      setHasInitialized(true);
    }
  }, [hasInitialized]);

  // 当初始化完成且有欢迎消息时，发送消息给 AI
  useEffect(() => {
    const sendWelcomeMessage = async () => {
      // 只有当满足以下条件时才发送消息：
      // 1. 已经初始化完成
      // 2. 来自欢迎页面
      // 3. 有消息内容
      if (
        hasInitialized &&
        welcomeData.fromWelcome &&
        welcomeData.welcomeMessage
      ) {
        try {
          console.log("正在发送欢迎消息:", welcomeData.welcomeMessage);

          // 先保存用户消息到数据库
          await saveMessage(chatId, {
            content: welcomeData.welcomeMessage,
            role: "user",
            modelId: welcomeData.welcomeModelId,
          });

          // 然后发送消息给 AI
          await sendMessage({
            content: welcomeData.welcomeMessage,
            modelId: welcomeData.welcomeModelId,
          });

          // 清除欢迎数据，防止重复发送
          setWelcomeData({
            fromWelcome: false,
            welcomeMessage: "",
            welcomeModelId: "",
          });
        } catch (error) {
          console.error("发送欢迎消息失败:", error);
        }
      }
    };

    sendWelcomeMessage();
  }, [welcomeData]);

  return (
    <div className="flex-1 flex flex-col h-full bg-background text-foreground">
      <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
        <div className="max-w-3xl mx-auto pt-4 pb-4">
          <MessageList
            messages={
              streamingMessageId
                ? [
                    ...messages,
                    {
                      id: streamingMessageId,
                      role: "assistant",
                      content: streamingContent,
                      chatId: chatId,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      modelId: currentModelId,
                    } as Message,
                  ]
                : messages
            }
            streamingMessageId={streamingMessageId}
            currentModelId={currentModelId}
            conversationId={chatId || undefined}
          />
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 w-full bg-background/80 backdrop-blur-sm py-4">
        <div className="max-w-3xl mx-auto px-8">
          <EnhancedChatInput
            onSendMessage={async (message, modelId, files) => {
              try {
                // 更新当前使用的模型 ID
                setCurrentModelId(modelId);

                // 发送消息给 AI 并获取响应
                await sendMessage({
                  content: message,
                  modelId: modelId,
                });
              } catch (error) {
                console.error("发送消息失败:", error);
              }
            }}
            disabled={isSending}
            onModelChange={setCurrentModelId}
            initialModelId={currentModelId}
          />
        </div>
      </div>
    </div>
  );
}
