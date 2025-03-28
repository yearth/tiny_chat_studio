"use client";

import { EnhancedChatInput } from "@/components/chat/enhanced-chat-input";
import { MessageList } from "@/components/chat/message-list";
import { useMessage, saveMessage } from "@/hooks/useMessage";
import { useWelcomeStorage } from "@/hooks/useWelcomeStorage";
import { useState, useEffect } from "react";
import { use } from "react";
import { Message } from "@prisma/client";
import { useMount, useUpdateEffect } from "react-use";

export default function ChatPage({ params }: { params: any }) {
  console.log("[Parent Component Render] params:", params);

  const resolvedParams =
    typeof params === "object" && !("then" in params) ? params : use(params);
  const chatId = resolvedParams.chatId;

  const {
    getIsFromWelcome,
    getMessage,
    getModelId,
    clearAll: clearWelcomeStorage,
  } = useWelcomeStorage();

  const [welcomeData, setWelcomeData] = useState<{
    fromWelcome: boolean;
    welcomeMessage: string;
    welcomeModelId: string;
  }>({ fromWelcome: false, welcomeMessage: "", welcomeModelId: "" });

  const [currentModelId, setCurrentModelId] = useState<string>(
    "deepseek/deepseek-chat-v3-0324:free"
  );

  // 记录 AI 响应请求开始的时间戳
  const [aiFetchStartTime, setAiFetchStartTime] = useState<number | null>(null);

  const {
    messages,
    sendUserMessage,
    fetchAIResponse,
    abortFetchAIResponse,
    isSendingUserMessage,
    isFetchingAIResponse,
    streamingMessageId,
    streamingContent,
  } = useMessage(chatId);

  // 当 isFetchingAIResponse 变为 false 时，重置 aiFetchStartTime
  useEffect(() => {
    if (!isFetchingAIResponse) {
      setAiFetchStartTime(null);
    }
  }, [isFetchingAIResponse]);

  useMount(() => {
    const fromWelcome = getIsFromWelcome();
    let welcomeMessage = "";
    let welcomeModelId = "deepseek/deepseek-chat-v3-0324:free";

    if (fromWelcome) {
      welcomeMessage = getMessage();
      const storedModelId = getModelId();

      if (storedModelId) {
        welcomeModelId = storedModelId;
        setCurrentModelId(welcomeModelId);
      }

      setWelcomeData({
        fromWelcome,
        welcomeMessage,
        welcomeModelId,
      });

      clearWelcomeStorage();
    }
  });

  useUpdateEffect(() => {
    const sendWelcomeMessage = async () => {
      // 只有当满足以下条件时才发送消息：
      // 1. 来自欢迎页面
      // 2. 有消息内容
      if (welcomeData.fromWelcome && welcomeData.welcomeMessage) {
        try {
          console.log("正在发送欢迎消息:", welcomeData.welcomeMessage);

          // 先发送用户消息
          await sendUserMessage({
            content: welcomeData.welcomeMessage,
            modelId: welcomeData.welcomeModelId,
          });

          // 然后获取 AI 响应
          await fetchAIResponse({
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
            messages={messages}
            streamingMessageId={streamingMessageId}
            currentModelId={currentModelId}
            conversationId={chatId || undefined}
            isFetchingAIResponse={isFetchingAIResponse}
            aiFetchStartTime={aiFetchStartTime}
          />
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 w-full bg-background/80 backdrop-blur-sm py-4">
        <div className="max-w-3xl mx-auto px-8">
          <EnhancedChatInput
            onSendMessage={async (message, modelId, files) => {
              try {
                setCurrentModelId(modelId);

                // 先发送用户消息
                await sendUserMessage({
                  content: message,
                  modelId: modelId,
                });

                // 记录开始时间并获取 AI 响应
                setAiFetchStartTime(Date.now());
                await fetchAIResponse({
                  modelId: modelId,
                });
              } catch (error) {
                console.error("发送消息失败:", error);
              }
            }}
            isSendingUserMessage={isSendingUserMessage}
            isFetchingAIResponse={isFetchingAIResponse}
            onAbortFetchAIResponse={abortFetchAIResponse}
            onModelChange={setCurrentModelId}
            initialModelId={currentModelId}
          />
        </div>
      </div>
    </div>
  );
}
