"use client";

import { useState, useRef, useEffect } from "react";
import {
  User,
  Bot,
  Send,
  Mic,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MobileLayout } from "@/components/layouts/MobileLayout";
import { TabletLayout } from "@/components/layouts/TabletLayout";
import { DesktopLayout } from "@/components/layouts/DesktopLayout";
import { Message, Conversation } from "@/types/chat";

// 扩展导入的Message类型，确保所有必需字段都有值
interface LocalMessage extends Message {
  id: string;
  createdAt: Date;
}

// 扩展导入的Conversation类型，确保所有必需字段都有值
interface LocalConversation extends Partial<Conversation> {
  id: string;
  title: string;
  updatedAt: Date;
}

// 思考过程组件
function MessageWithThinkingProcess({ content }: { content: string }) {
  const [isThinkingVisible, setIsThinkingVisible] = useState(false);

  // 分离思考过程和答案
  const parts = content.split("**答案**:");
  const thinkingProcess = parts[0].replace("**思考过程**:", "").trim();
  const answer = parts.length > 1 ? parts[1].trim() : "";

  return (
    <div className="space-y-2">
      {/* 折叠面板 - 思考过程 */}
      <div className="border border-muted rounded-md overflow-hidden">
        <button
          onClick={() => setIsThinkingVisible(!isThinkingVisible)}
          className="w-full flex items-center justify-between p-2 bg-muted hover:bg-muted/80 transition-colors"
        >
          <div className="flex items-center">
            <ChevronRight
              className={`h-4 w-4 mr-2 transition-transform ${
                isThinkingVisible ? "rotate-90" : ""
              }`}
            />
            <span className="text-sm font-medium">思考过程</span>
          </div>
        </button>
        {isThinkingVisible && (
          <div className="p-3 text-sm text-muted-foreground whitespace-pre-wrap bg-muted/80">
            {thinkingProcess}
          </div>
        )}
      </div>

      {/* 答案部分 */}
      <div className="text-sm">{answer}</div>
    </div>
  );
}

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState("");
  const [conversations, setConversations] = useState<LocalConversation[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("deepseek-r1");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 可用的AI模型列表
  const availableModels = [
    { id: "deepseek-r1", name: "DeepSeek R1" },
    { id: "qwen-qwq-plus", name: "通义千问-QwQ-Plus" },
    { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
    { id: "gpt-4", name: "GPT-4" },
  ];

  // Sample data for demonstration
  useEffect(() => {
    // Sample conversations
    setConversations([
      { id: "1", title: "计算机视觉分析器开发", updatedAt: new Date() },
      {
        id: "2",
        title: "Gemini Impact 如何写好写作提示词",
        updatedAt: new Date(),
      },
      { id: "3", title: "对比自然语言处理技术", updatedAt: new Date() },
      { id: "4", title: "Web+生成式AI的应用场景", updatedAt: new Date() },
      { id: "5", title: "PowerPoint制作工作汇报", updatedAt: new Date() },
    ]);

    // Sample message
    setMessages([
      {
        id: "system-1",
        content: "Yearth, 你好",
        role: "assistant",
        createdAt: new Date(),
      },
    ]);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim()) {
      const newMessage: LocalMessage = {
        id: `user-${Date.now()}`,
        content: input,
        role: "user",
        createdAt: new Date(),
      };
      setMessages([...messages, newMessage]);
      setInput("");

      try {
        // Send message to API
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messages, newMessage].map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            // You can add conversationId here if continuing an existing conversation
            // conversationId: currentConversationId,
            // 使用选择的模型ID
            // modelId: selectedModel,
            modelId: "qwen-qwq-plus",
          }),
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        // Add AI response to messages
        const aiResponse: LocalMessage = {
          id: `assistant-${Date.now()}`,
          content: data.message,
          role: "assistant",
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, aiResponse]);
      } catch (error) {
        console.error("Error sending message:", error);

        // Show error message to user
        const errorResponse: LocalMessage = {
          id: `error-${Date.now()}`,
          content: "抱歉，发送消息时出现错误。请稍后再试。",
          role: "assistant",
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, errorResponse]);
      }
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // 添加状态来跟踪不同屏幕尺寸
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  // 检测屏幕宽度并设置状态
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
      console.log("当前屏幕宽度:", width, "屏幕类型:", screenSize);
    };

    // 初始检查
    checkScreenSize();

    // 监听窗口大小变化
    window.addEventListener("resize", checkScreenSize);

    // 清理函数
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);  // 这里不需要添加screenSize作为依赖，因为我们只关心窗口大小变化

  // 渲染聊天内容区域
  const renderChatContent = () => (
    <>
      {/* 聊天区域 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          {messages.map((message) => (
            <div key={message.id} className="mb-6">
              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  {message.role === "user" ? (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                      <Bot className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium mb-1">
                    {message.role === "user" ? "You" : "Gemini"}
                  </div>
                  {message.role === "assistant" &&
                  message.content.includes("**思考过程**:") ? (
                    <MessageWithThinkingProcess content={message.content} />
                  ) : (
                    <div className="text-sm">{message.content}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 输入区域 */}
      <div className="p-4 border-t border-muted">
        <div className="max-w-3xl mx-auto">
          {/* 模型选择器 */}
          <div className="mb-2 flex justify-end">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-muted text-foreground text-sm border border-input rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {availableModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
          <div className="relative rounded-xl bg-muted focus-within:ring-1 focus-within:ring-primary">
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="向 AI 提问"
              className="border-none bg-transparent py-3 px-4 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                <Mic className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
                onClick={handleSendMessage}
                disabled={!input.trim()}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // 根据屏幕尺寸渲染不同的布局
  return (
    screenSize === 'mobile' ? (
      <MobileLayout
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        conversations={conversations}
      >
        {renderChatContent()}
      </MobileLayout>
    ) : screenSize === 'tablet' ? (
      <TabletLayout
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        conversations={conversations}
      >
        {renderChatContent()}
      </TabletLayout>
    ) : (
      <DesktopLayout
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        conversations={conversations}
      >
        {renderChatContent()}
      </DesktopLayout>
    )
  );
}
