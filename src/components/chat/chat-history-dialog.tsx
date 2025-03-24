"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Text, Search, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { CustomDialogContent } from "@/components/ui/custom-dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { cn } from "@/lib/utils";

interface Chat {
  id: string;
  title: string;
  updatedAt: string;
}

export function ChatHistoryDialog() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 加载聊天历史记录
  useEffect(() => {
    if (isOpen) {
      fetchChatHistory();
    }
  }, [isOpen]);

  const fetchChatHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/chats");
      if (response.ok) {
        const data = await response.json();
        setChats(data);
      }
    } catch (error) {
      console.error("获取聊天历史失败", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 过滤聊天记录
  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative cursor-pointer"
        >
          <Text className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <CustomDialogContent className="w-[70vw] max-h-[70vh] flex flex-col">
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
        
        <div className="flex-1 overflow-y-auto py-4">
          {isLoading ? (
            <div className="space-y-4 px-4">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-5 w-[60%]" />
                  <Skeleton className="h-4 w-[15%]" />
                </div>
              ))}
            </div>
          ) : filteredChats.length > 0 ? (
            <div className="space-y-2">
              <div className="px-4 py-2 text-sm font-medium text-muted-foreground">最近</div>
              {filteredChats.map((chat) => (
                <button
                  key={chat.id}
                  className="w-full px-4 py-3 text-left hover:bg-accent flex items-center justify-between group"
                  onClick={() => {
                    router.push(`/chat/${chat.id}`);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{chat.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(chat.updatedAt)}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
              <Text className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-lg font-medium">暂无聊天记录</p>
              <p className="text-sm mt-1">
                {searchQuery ? "没有找到匹配的聊天记录" : "开始新的对话，探索 AI 的无限可能"}
              </p>
            </div>
          )}
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
