import React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  toggleSidebar: () => void;
  title?: string;
  variant: "desktop" | "tablet" | "mobile";
}

export function Header({ toggleSidebar, title = "Gemini Chat", variant }: HeaderProps) {
  const isMobile = variant === "mobile";
  
  return (
    <div className="h-16 px-4 flex items-center justify-between">
      <div className="flex items-center">
        {/* 仅在移动设备上显示菜单按钮 */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={toggleSidebar}
            aria-label="打开菜单"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      
      <div className="flex items-center space-x-2">
        {/* 这里可以添加其他头部元素，如用户头像、设置按钮等 */}
      </div>
    </div>
  );
}
