import React from "react";
import { Button } from "@/components/ui/button";
import { MessageList } from "./message-list";

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
      <MessageList 
        messages={previewMessages}
        isPreview={true}
        maxContentLength={maxContentLength}
      />
      
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
