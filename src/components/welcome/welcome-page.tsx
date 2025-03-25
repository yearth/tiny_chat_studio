"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { EnhancedChatInput } from "@/components/chat/enhanced-chat-input";
import { DEV_USER_ID } from "@/constants/mockId";
import { useChat } from "@/hooks/useChat";
import { useMessage, saveMessage } from "@/hooks/useMessage";

export function WelcomePage() {
  const router = useRouter();
  const { data: session } = useSession();
  
  // 获取用户 ID
  const userId = process.env.NODE_ENV === "production" && session?.user?.id
    ? session.user.id
    : DEV_USER_ID;
  
  // 使用 useChat 钩子获取创建聊天的功能
  const { addChat, isAddingChat } = useChat(userId);

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
      // 1. 将用户输入的文本存入 sessionStorage
      // 对消息进行编码，防止特殊字符引起问题
      sessionStorage.setItem('welcomeMessage', encodeURIComponent(message));
      
      // 2. 将模型 ID 存入 sessionStorage
      sessionStorage.setItem('welcomeModelId', modelId);
      
      // 3. 将是否来自 welcome 的 flag 存入 sessionStorage
      sessionStorage.setItem('fromWelcome', 'true');
      
      // 4. 使用 addChat 创建新聊天
      const newChat = await addChat('新对话');
      
      if (!newChat) {
        throw new Error('创建聊天失败');
      }
      
      // 5. 跳转到新聊天页面，不再使用 URL 参数
      router.push(`/chat/${newChat.id}`);
    } catch (error) {
      console.error('创建聊天失败:', error);
      alert('创建聊天失败，请重试');
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
            <EnhancedChatInput onSendMessage={handleSendMessage} />
          </div>
        </div>
      </div>
    </div>
  );
}
