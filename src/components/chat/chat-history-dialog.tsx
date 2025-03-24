"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Text, Search, MessageSquare, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { CustomDialogContent } from "@/components/ui/custom-dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { cn } from "@/lib/utils";
import { useConversations } from "@/hooks/useConversations";
import { useChat } from "@/hooks/useChat";

export function ChatHistoryDialog() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const userId =
    process.env.NODE_ENV === "production" && session?.user?.id
      ? session.user.id
      : "cm8ke3nrj0000jsxy4tsfv7gy"; // 开发环境使用测试用户ID

  // 使用 useConversations 钩子获取对话列表
  const {
    conversations: chats,
    isLoading,
    loadConversations,
  } = useConversations({ userId, initialConversations: [] });

  // 使用 useChat 钩子获取选中对话的消息
  const { messages, isLoading: isMessagesLoading } = useChat({
    chatId: selectedChatId || undefined,
  });

  // 加载聊天历史记录
  useEffect(() => {
    if (isOpen && userId) {
      loadConversations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, userId]);

  // 选择聊天
  const selectChat = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  // 过滤聊天记录
  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 格式化日期
  const formatDate = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return `${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
  };

  // 格式化时间
  const formatTime = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return `${dateObj.getHours().toString().padStart(2, "0")}:${dateObj
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative cursor-pointer">
          <Text className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <CustomDialogContent className="w-[70vw] h-[90vh] flex flex-col">
        <DialogHeader className="border-b pb-4">
          <VisuallyHidden>
            <DialogTitle>聊天历史记录</DialogTitle>
          </VisuallyHidden>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索聊天记录"
              className="h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* 左侧对话列表 */}
          <div className="w-1/3 border-r">
            <ScrollArea className="h-full">
              {isLoading ? (
                <div className="space-y-4 p-4">
                  {Array(8)
                    .fill(0)
                    .map((_, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center"
                      >
                        <Skeleton className="h-5 w-[60%]" />
                        <Skeleton className="h-4 w-[15%]" />
                      </div>
                    ))}
                </div>
              ) : filteredChats.length > 0 ? (
                <div className="space-y-1">
                  <div className="px-4 py-2 text-sm font-medium text-muted-foreground sticky top-0 bg-background z-10">
                    最近对话
                  </div>
                  {filteredChats.map((chat) => (
                    <button
                      key={chat.id}
                      className={cn(
                        "w-full px-4 py-3 text-left flex items-center justify-between",
                        selectedChatId === chat.id
                          ? "bg-accent"
                          : "hover:bg-accent/50"
                      )}
                      onClick={() => selectChat(chat.id)}
                    >
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <MessageSquare className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        <span className="text-sm truncate">{chat.title}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                  <Text className="h-10 w-10 mb-4 opacity-20" />
                  <p className="text-base font-medium">暂无聊天记录</p>
                  <p className="text-sm mt-1">
                    {searchQuery
                      ? "没有找到匹配的聊天记录"
                      : "开始新的对话，探索 AI 的无限可能"}
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* 右侧对话详情 */}
          <div className="w-2/3 p-4">
            <ScrollArea className="h-full">
              {selectedChatId ? (
                isMessagesLoading ? (
                  <div className="space-y-6 p-4">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-4 w-[30%]" />
                          <Skeleton className="h-20 w-full" />
                        </div>
                      ))}
                  </div>
                ) : messages.length > 0 ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">
                        {filteredChats.find((c) => c.id === selectedChatId)
                          ?.title || "对话详情"}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        {selectedChatId &&
                          filteredChats.find((c) => c.id === selectedChatId)
                            ?.updatedAt && (
                            <>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>
                                  {formatDate(
                                    String(
                                      filteredChats.find(
                                        (c) => c.id === selectedChatId
                                      )?.updatedAt
                                    )
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>
                                  {formatTime(
                                    String(
                                      filteredChats.find(
                                        (c) => c.id === selectedChatId
                                      )?.updatedAt
                                    )
                                  )}
                                </span>
                              </div>
                            </>
                          )}
                        {selectedChatId &&
                          filteredChats.find(
                            (c) => c.id === selectedChatId
                          ) && (
                            <Badge variant="outline" className="ml-2">
                              {(
                                filteredChats.find(
                                  (c) => c.id === selectedChatId
                                ) as any
                              )?.modelId || "默认模型"}
                            </Badge>
                          )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {messages.slice(0, 3).map((message, index) => (
                        <div key={index} className="space-y-1">
                          <div className="text-sm font-medium">
                            {message.role === "user" ? "您" : "AI"}
                          </div>
                          <div className="p-3 rounded-lg bg-accent/50">
                            <p className="text-sm whitespace-pre-wrap">
                              {message.content.substring(0, 300)}
                              {message.content.length > 300 && "..."}
                            </p>
                          </div>
                        </div>
                      ))}
                      {messages.length > 3 && (
                        <Button
                          variant="outline"
                          className="w-full mt-4"
                          onClick={() => {
                            router.push(`/chat/${selectedChatId}`);
                            setIsOpen(false);
                          }}
                        >
                          查看完整对话 ({messages.length} 条消息)
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <p className="text-base">无法加载对话消息</p>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <p className="text-base">请从左侧选择一个对话</p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="border-t pt-4 flex justify-end">
          <Button
            onClick={() => {
              router.push("/chat/new");
              setIsOpen(false);
            }}
          >
            开始新对话
          </Button>
        </DialogFooter>
      </CustomDialogContent>
    </Dialog>
  );
}
