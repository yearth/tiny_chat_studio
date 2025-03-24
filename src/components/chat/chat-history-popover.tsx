"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Text, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface Chat {
  id: string;
  title: string;
  updatedAt: string;
}

export function ChatHistoryPopover() {
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
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative cursor-pointer"
        >
          <Text className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索聊天记录"
              className="h-8 flex-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : filteredChats.length > 0 ? (
            <div className="py-2">
              <div className="px-4 py-2 text-sm font-medium text-muted-foreground">最近</div>
              {filteredChats.map((chat) => (
                <button
                  key={chat.id}
                  className="w-full px-4 py-2 text-left hover:bg-accent flex justify-between items-center"
                  onClick={() => {
                    router.push(`/chat/${chat.id}`);
                    setIsOpen(false);
                  }}
                >
                  <span className="text-sm truncate max-w-[180px]">{chat.title}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(chat.updatedAt)}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              {searchQuery ? "没有找到匹配的聊天记录" : "暂无聊天记录"}
            </div>
          )}
        </div>
        
        <div className="p-2 border-t flex justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              router.push("/chat/new");
              setIsOpen(false);
            }}
          >
            开始新对话
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
