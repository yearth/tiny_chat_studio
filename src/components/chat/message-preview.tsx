import React from "react";
import { Button } from "@/components/ui/button";
import { MessageBubble } from "./message-bubble";

interface Message {
  role: string;
  content: string;
  timestamp?: string;
}

interface MessagePreviewProps {
  messages: Message[];
  onViewFullConversation: () => void;
  maxPreviewMessages?: number;
  maxContentLength?: number;
}

export function MessagePreview({
  messages,
  onViewFullConversation,
  maxPreviewMessages = 3,
  maxContentLength = 300,
}: MessagePreviewProps) {
  const previewMessages = messages.slice(0, maxPreviewMessages);
  
  return (
    <div className="space-y-4">
      {previewMessages.map((message, index) => (
        <div key={index} className="space-y-1">
          <div className={`text-sm font-medium text-muted-foreground ${message.role === "user" ? "text-right" : ""}`}>
            {message.role === "user" ? "您" : "AI"}
          </div>
          <MessageBubble
            content={
              message.content.length > maxContentLength
                ? `${message.content.substring(0, maxContentLength)}...`
                : message.content
            }
            isUser={message.role === "user"}
            timestamp={message.timestamp}
          />
        </div>
      ))}
      
      {messages.length > maxPreviewMessages && (
        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={onViewFullConversation}
        >
          查看完整对话 ({messages.length} 条消息)
        </Button>
      )}
    </div>
  );
}
