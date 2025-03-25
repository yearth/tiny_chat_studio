"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Text, Search, MessageSquare, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
import { ErrorMessage } from "@/components/ui/error-message";
import { cn, formatDate, formatTime } from "@/lib/utils";
import { MessagePreview } from "./message-preview";
import { useChat } from "@/hooks/useChat";
import { useMessage } from "@/hooks/useMessage";
import { DEV_USER_ID } from "@/constants/mockId";

export function ChatHistoryDialog() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const userId =
    process.env.NODE_ENV === "production" && session?.user?.id
      ? session.user.id
      : DEV_USER_ID; // 开发环境使用测试用户ID

  const {
    chats,
    isLoading: chatsLoading,
    error: chatsError,
    refetch: refetchChats,
  } = useChat(userId);

  const {
    messages,
    isLoading: isMessagesLoading,
    error: messagesError,
    fetchMessages,
    refetch: refetchMessages,
  } = useMessage(selectedChatId || undefined);

  // 过滤聊天记录的函数
  const filteredChats = useMemo(() => {
    if (!chats || chats.length === 0) return [];

    if (!searchQuery) return chats;

    const lowerCaseQuery = searchQuery.toLowerCase();
    return chats.filter((chat) =>
      chat.title?.toLowerCase().includes(lowerCaseQuery)
    );
  }, [chats, searchQuery]);

  // 选择聊天的函数
  const selectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    fetchMessages(chatId);
  };

  // 当对话框打开时，聊天记录会自动获取（由于使用了 React Query）
  // 不再需要手动调用 fetchChats

  // 当获取到聊天记录后，自动选择第一个聊天
  useEffect(() => {
    if (chats && chats.length > 0 && !selectedChatId) {
      setSelectedChatId(chats[0].id);
      // fetchMessages 不再需要手动调用，由 React Query 自动处理
    }
  }, [chats, selectedChatId]);

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
            <ScrollArea className="h-full w-full">
              {chatsError ? (
                <div className="p-4">
                  <ErrorMessage
                    message={`获取聊天列表失败: ${
                      chatsError.message || "未知错误"
                    }`}
                    onRetry={() => refetchChats()}
                    className="mb-4"
                  />
                </div>
              ) : chatsLoading ? (
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
                <div className="space-y-1 p-2">
                  <div className="px-4 py-2 text-sm font-medium text-muted-foreground sticky top-0 bg-background z-10">
                    最近对话
                  </div>
                  {filteredChats.map((chat) => (
                    <button
                      key={chat.id}
                      className={cn(
                        "w-full px-4 py-2 text-left flex items-center justify-between mb-1",
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
                messagesError ? (
                  <div className="p-4">
                    <ErrorMessage
                      message={`获取消息失败: ${
                        messagesError.message || "未知错误"
                      }`}
                      onRetry={() => refetchMessages()}
                      className="mb-4"
                    />
                  </div>
                ) : isMessagesLoading ? (
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
                        {filteredChats.find(
                          (chat) => chat.id === selectedChatId
                        )?.title || "对话详情"}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        {selectedChatId &&
                          filteredChats.find(
                            (chat) => chat.id === selectedChatId
                          )?.updatedAt && (
                            <>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>
                                  {formatDate(
                                    String(
                                      filteredChats.find(
                                        (chat) => chat.id === selectedChatId
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
                                        (chat) => chat.id === selectedChatId
                                      )?.updatedAt
                                    )
                                  )}
                                </span>
                              </div>
                            </>
                          )}
                      </div>
                    </div>

                    <MessagePreview
                      messages={messages}
                      onViewFullConversation={() => {
                        router.push(`/chat/${selectedChatId}`);
                        setIsOpen(false);
                      }}
                    />
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
