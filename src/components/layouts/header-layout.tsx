"use client";

import React, { useState } from "react";
import { Menu, LogIn, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import { LoginDialog } from "@/components/auth/login-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HeaderProps {
  toggleSidebar: () => void;
  title?: string;
  variant: "desktop" | "tablet" | "mobile";
}

export function Header({ toggleSidebar, title = "Gemini Chat", variant }: HeaderProps) {
  const isMobile = variant === "mobile";
  const { data: session } = useSession();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  
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
        {session ? (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={session.user.image || undefined} alt={session.user.name || "用户"} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <span className="text-sm hidden md:inline">{session.user.name}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => signOut()}
              className="text-xs"
            >
              <LogOut className="h-4 w-4 mr-1" />
              退出
            </Button>
          </div>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowLoginDialog(true)}
            className="text-xs"
          >
            <LogIn className="h-4 w-4 mr-1" />
            登录
          </Button>
        )}
      </div>
      
      {/* 登录对话框 */}
      <LoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        reason="user_action"
      />
    </div>
  );
}
