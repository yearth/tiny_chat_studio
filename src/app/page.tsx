"use client";

import { useState, useRef, useEffect } from "react";
import {
  Menu,
  Plus,
  ChevronDown,
  MessageSquare,
  Settings,
  History,
  Sparkles,
  User,
  Bot,
  Send,
  Mic,
  Cpu,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  createdAt: Date;
}

interface Conversation {
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
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
      const newMessage: Message = {
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
        const aiResponse: Message = {
          id: `assistant-${Date.now()}`,
          content: data.message,
          role: "assistant",
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, aiResponse]);
      } catch (error) {
        console.error("Error sending message:", error);

        // Show error message to user
        const errorResponse: Message = {
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

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <div
        className={`fixed md:relative z-10 h-full bg-background border-r border-gray-700 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "w-64" : "w-0 md:w-16 overflow-hidden"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center p-4 h-16 border-b border-muted">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2"
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div
              className={`font-medium transition-opacity duration-200 ${
                isSidebarOpen ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="flex items-center">
                <span className="font-semibold">Gemini</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </div>
              <div className="text-xs text-muted-foreground">2.0 Beta</div>
            </div>
          </div>

          {/* New Chat Button */}
          <div className="p-3">
            {isSidebarOpen ? (
              <Button className="w-full bg-transparent border border-gray-700 hover:bg-gray-800 transition-all justify-start px-4">
                <Plus className="h-5 w-5 mr-2" />
                <span>开启新对话</span>
              </Button>
            ) : (
              <div className="flex justify-center">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors">
                  <Plus className="h-5 w-5 text-muted-foreground stroke-[2.5]" />
                </div>
              </div>
            )}
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              <h3
                className={`text-xs text-muted-foreground px-2 mb-2 ${
                  isSidebarOpen ? "block" : "hidden"
                }`}
              >
                近期对话
              </h3>
              <ul className="space-y-1">
                {conversations.map((conversation) => (
                  <li key={conversation.id}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50 ${
                        isSidebarOpen ? "px-3" : "px-2"
                      }`}
                    >
                      <MessageSquare className="h-5 w-5 mr-3" />
                      {isSidebarOpen && (
                        <span className="truncate text-sm">
                          {conversation.title}
                        </span>
                      )}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="mt-auto border-t border-muted">
            <div className="p-2">
              <ul className="space-y-1">
                <li>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800 ${
                      isSidebarOpen ? "px-3" : "px-2"
                    }`}
                  >
                    <History className="h-5 w-5 mr-3" />
                    {isSidebarOpen && <span className="text-sm">历史记录</span>}
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800 ${
                      isSidebarOpen ? "px-3" : "px-2"
                    }`}
                  >
                    <Sparkles className="h-5 w-5 mr-3" />
                    {isSidebarOpen && <span className="text-sm">小应用</span>}
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800 ${
                      isSidebarOpen ? "px-3" : "px-2"
                    }`}
                  >
                    <Settings className="h-5 w-5 mr-3" />
                    {isSidebarOpen && <span className="text-sm">设置</span>}
                  </Button>
                </li>
                <li>
                  <div className={`flex items-center ${isSidebarOpen ? "px-3 py-2" : "justify-center py-2"}`}>
                    {isSidebarOpen && <span className="text-sm text-muted-foreground mr-auto">主题切换</span>}
                    <ThemeToggle />
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Overlay for mobile when sidebar is open */}
        {isSidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-foreground/20 backdrop-blur-sm z-0"
            onClick={toggleSidebar}
          ></div>
        )}

        {/* Chat Area */}
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

        {/* Input Area */}
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
      </div>
    </div>
  );
}
