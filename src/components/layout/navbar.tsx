"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Settings, MessageSquare } from "lucide-react";
import { ChatHistoryDialog } from "@/components/chat/chat-history-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <nav className="w-full bg-background">
      <div className="w-full flex h-16 items-center px-4 md:px-6">
        {/* 左侧 Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-foreground">TinyChat</span>
        </Link>

        {/* 右侧功能按钮和头像 */}
        <div className="flex items-center space-x-4 ml-auto">
          <ChatHistoryDialog />
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>

          {session ? (
            <Avatar>
              <AvatarImage
                src={session.user?.image || ""}
                alt={session.user?.name || "用户"}
              />
              <AvatarFallback>
                {session.user?.name
                  ? session.user.name.charAt(0).toUpperCase()
                  : "U"}
              </AvatarFallback>
            </Avatar>
          ) : (
            <Button
              variant="outline"
              onClick={() => router.push("/api/auth/signin")}
            >
              登录
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
