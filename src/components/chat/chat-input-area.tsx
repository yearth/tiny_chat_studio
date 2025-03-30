import { cn } from "@/lib/utils";
import React, { forwardRef } from "react";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  input: string;
  setInput: (value: string) => void;
  onSendMessage: () => void;
  isDisabled: boolean;
  isExpanded?: boolean;
}

/**
 * 聊天输入区域组件
 * 管理文本输入框，处理用户输入
 */
export const ChatInputArea = forwardRef<HTMLTextAreaElement, ChatInputAreaProps>(
  ({ input, setInput, isDisabled, isExpanded = false, className, ...props }, ref) => {
    return (
      <div className={cn("px-3 pt-2", className)}>
        <Textarea
          ref={ref}
          value={input}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setInput(e.target.value)
          }
          placeholder="Hi, 想聊点什么？"
          className={cn(
            "min-h-24 border-none bg-transparent text-black dark:bg-transparent dark:text-white resize-none focus-visible:ring-0 focus-visible:ring-offset-0",
            isExpanded ? "overflow-y-auto h-full" : "overflow-hidden"
          )}
          disabled={isDisabled}
          style={{
            height: isExpanded ? "auto" : "40px",
            maxHeight: isExpanded ? "calc(50vh - 100px)" : "200px"
          }}
        />
      </div>
    );
  }
);

ChatInputArea.displayName = "ChatInputArea";
