import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Pin, Edit, Trash2 } from "lucide-react";
import { Button } from "./button";
import { useConversationContext } from "@/contexts/ConversationContext";

interface ConversationMenuProps {
  conversationId: string;
}

export function ConversationMenu({ conversationId }: ConversationMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { removeConversation } = useConversationContext();

  // 点击菜单按钮时切换菜单显示状态
  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发对话选择
    setIsMenuOpen(!isMenuOpen);
  };

  // 点击菜单外部时关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // 处理菜单项点击
  const handleMenuItemClick = async (action: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    console.log(`执行操作: ${action}，对话ID: ${conversationId}`);
    
    if (action === "delete") {
      try {
        const success = await removeConversation(conversationId);
        if (success) {
          console.log(`成功删除对话: ${conversationId}`);
        } else {
          console.error(`删除对话失败: ${conversationId}`);
        }
      } catch (error) {
        console.error("删除对话时出错:", error);
      }
    }
    
    setIsMenuOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* 扩展按钮 */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={toggleMenu}
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      {/* 扩展菜单 */}
      {isMenuOpen && (
        <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-background border border-muted z-50">
          <div className="py-1">
            <Button
              variant="ghost"
              className="flex items-center w-full justify-start px-4 py-2 text-sm text-foreground hover:bg-muted h-auto font-normal"
              onClick={(e) => handleMenuItemClick("pin", e)}
            >
              <Pin className="h-4 w-4 mr-2" />
              固定
            </Button>
            <Button
              variant="ghost"
              className="flex items-center w-full justify-start px-4 py-2 text-sm text-foreground hover:bg-muted h-auto font-normal"
              onClick={(e) => handleMenuItemClick("rename", e)}
            >
              <Edit className="h-4 w-4 mr-2" />
              重命名
            </Button>
            <Button
              variant="ghost"
              className="flex items-center w-full justify-start px-4 py-2 text-sm text-destructive hover:bg-muted hover:text-destructive/90 h-auto font-normal"
              onClick={(e) => handleMenuItemClick("delete", e)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              删除
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
