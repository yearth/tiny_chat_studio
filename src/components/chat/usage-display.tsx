import { Button } from "@/components/ui/button";
import { Session } from "next-auth";
import React from "react";

interface UsageDisplayProps {
  usageCount: number;
  limit: number;
  session: Session | null;
  setShowLoginDialog: (open: boolean) => void;
}

/**
 * 使用量显示组件
 * 显示今日使用次数和限制，并在用户未登录时提供登录按钮
 */
export function UsageDisplay({
  usageCount,
  limit,
  session,
  setShowLoginDialog,
}: UsageDisplayProps) {
  return (
    <div className="mt-2 flex justify-between items-center">
      <div className="text-xs text-muted-foreground">
        今日使用: {usageCount}/{limit} 次
        {!session && (
          <Button
            variant="link"
            className="text-xs p-0 h-auto ml-2"
            onClick={() => setShowLoginDialog(true)}
          >
            登录获取更多次数
          </Button>
        )}
      </div>
    </div>
  );
}
