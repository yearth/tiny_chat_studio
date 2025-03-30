import { cn } from "@/lib/utils";
import { Loader2, Send, Square } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";

interface SendButtonProps {
  isSendingUserMessage: boolean;
  isFetchingAIResponse: boolean;
  onSendMessage: () => void;
  onAbortFetchAIResponse: () => void;
  input: string;
}

/**
 * 发送/停止按钮组件
 * 根据当前状态显示发送、加载或停止按钮，并处理点击事件
 */
export function SendButton({
  isSendingUserMessage,
  isFetchingAIResponse,
  onSendMessage,
  onAbortFetchAIResponse,
  input,
}: SendButtonProps) {
  return (
    <div className="w-10 h-10 relative">
      <AnimatePresence mode="popLayout" initial={false}>
        {isFetchingAIResponse ? (
          // 停止按钮 - 当 AI 正在响应时显示
          <motion.button
            key="stop"
            type="button"
            className={cn(
              "absolute inset-0 flex items-center justify-center",
              "text-muted-foreground hover:text-foreground rounded-full hover:bg-accent"
            )}
            onClick={onAbortFetchAIResponse}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <Square className="h-5 w-5" />
          </motion.button>
        ) : isSendingUserMessage ? (
          // 加载按钮 - 当用户消息正在发送时显示
          <motion.button
            key="loader"
            type="button"
            className={cn(
              "absolute inset-0 flex items-center justify-center",
              "text-primary rounded-full"
            )}
            disabled={true}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <Loader2 className="h-5 w-5 animate-spin" />
          </motion.button>
        ) : (
          // 发送按钮 - 默认状态
          <motion.button
            key="send"
            type="button"
            className={cn(
              "absolute inset-0 flex items-center justify-center",
              "text-muted-foreground hover:text-foreground rounded-full hover:bg-accent"
            )}
            onClick={onSendMessage}
            disabled={!input.trim()}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <Send className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
