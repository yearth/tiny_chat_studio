import { useState } from "react";
import { ChevronRight } from "lucide-react";

interface MessageWithThinkingProps {
  content: string;
}

/**
 * 显示带有思考过程的消息组件
 * 允许用户展开/折叠思考过程部分
 */
export function MessageWithThinking({ content }: MessageWithThinkingProps) {
  const [isThinkingVisible, setIsThinkingVisible] = useState(false);

  // 分离思考过程和答案
  const parts = content.split("**答案**:");
  const thinkingProcess = parts[0].replace("**思考过程**:", "").trim();
  const answer = parts.length > 1 ? parts[1].trim() : "";

  return (
    <div className="space-y-2">
      {/* 折叠面板 - 思考过程 */}
      <div className="border border-muted rounded-md overflow-hidden">
        <button
          onClick={() => setIsThinkingVisible(!isThinkingVisible)}
          className="w-full flex items-center justify-between p-2 bg-muted hover:bg-muted/80 transition-colors"
        >
          <div className="flex items-center">
            <ChevronRight
              className={`h-4 w-4 mr-2 transition-transform ${
                isThinkingVisible ? "rotate-90" : ""
              }`}
            />
            <span className="text-sm font-medium">思考过程</span>
          </div>
        </button>
        {isThinkingVisible && (
          <div className="p-3 text-sm text-muted-foreground whitespace-pre-wrap bg-muted/80">
            {thinkingProcess}
          </div>
        )}
      </div>

      {/* 答案部分 */}
      <div className="text-sm">{answer}</div>
    </div>
  );
}
