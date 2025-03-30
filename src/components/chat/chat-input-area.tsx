import { Textarea } from "@/components/ui/textarea";
import React from "react";

interface ChatInputAreaProps {
  input: string;
  setInput: (value: string) => void;
  onSendMessage: () => void;
  isDisabled: boolean;
}

/**
 * 聊天输入区域组件
 * 管理文本输入框，处理用户输入和按键事件
 */
export function ChatInputArea({
  input,
  setInput,
  onSendMessage,
  isDisabled,
}: ChatInputAreaProps) {
  return (
    <div className="px-3 pt-2">
      <Textarea
        value={input}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          setInput(e.target.value)
        }
        onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
          if (e.key === "Enter" && !e.shiftKey && !isDisabled) {
            e.preventDefault();
            onSendMessage();
          }
        }}
        placeholder="Hi, 想聊点什么？"
        className="min-h-24 border-none bg-transparent text-black dark:bg-transparent dark:text-white resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
        disabled={isDisabled}
      />
    </div>
  );
}
