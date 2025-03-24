import React from "react";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  content: string;
  isUser: boolean;
  timestamp?: string;
  className?: string;
}

export function MessageBubble({
  content,
  isUser,
  timestamp,
  className,
}: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "flex",
        isUser ? "justify-end" : "justify-start",
        className
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-accent/50 text-accent-foreground"
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
        {timestamp && (
          <div className="text-xs opacity-70 mt-1 text-right">{timestamp}</div>
        )}
      </div>
    </div>
  );
}
