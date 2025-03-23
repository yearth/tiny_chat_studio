import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Mail, Github, User, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: "usage_limit" | "user_action";
}

type LoginMethod = "oauth" | "credentials";

export function LoginDialog({ open, onOpenChange, reason }: LoginDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {reason === "usage_limit" 
              ? "您已达到每日使用限制" 
              : "登录到您的账户"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <p className="text-sm text-muted-foreground">
            {reason === "usage_limit" 
              ? "登录后可获得更多的使用次数。" 
              : "使用以下方式登录以获得更多功能和更高的使用限制。"}
          </p>
          <Button 
            onClick={() => signIn("google", { callbackUrl: window.location.href })}
            className="flex items-center gap-2"
            variant="outline"
          >
            <Mail className="h-4 w-4" />
            使用 Google 账号登录
          </Button>
          <Button 
            onClick={() => signIn("github", { callbackUrl: window.location.href })}
            className="flex items-center gap-2"
            variant="outline"
          >
            <Github className="h-4 w-4" />
            使用 GitHub 账号登录
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
