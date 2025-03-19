"use client";

import { useState, useEffect } from "react";
import { MobileLayout } from "@/components/layouts/MobileLayout";
import { TabletLayout } from "@/components/layouts/TabletLayout";
import { DesktopLayout } from "@/components/layouts/DesktopLayout";
import {
  LocalConversation,
  mockMessages,
  mockConversations,
} from "@/data/mockData";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { useScreenSize } from "@/hooks/useScreenSize";
import { useChat } from "@/hooks/useChat";
import { ScreenSize } from "@/types/layout";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState<LocalConversation[]>([]);

  const screenSize = useScreenSize();
  const { messages, sendMessage, isLoading, setMessages } = useChat();

  useEffect(() => {
    setConversations(mockConversations);
    setMessages(mockMessages);
  }, [setMessages]);

  const handleSendMessage = async (message: string, modelId: string) => {
    await sendMessage(message, modelId);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderChatContent = () => (
    <>
      <MessageList messages={messages} />
      <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </>
  );

  return screenSize === ScreenSize.MOBILE ? (
    <MobileLayout
      isSidebarOpen={isSidebarOpen}
      toggleSidebar={toggleSidebar}
      conversations={conversations}
    >
      {renderChatContent()}
    </MobileLayout>
  ) : screenSize === ScreenSize.TABLET ? (
    <TabletLayout
      isSidebarOpen={isSidebarOpen}
      toggleSidebar={toggleSidebar}
      conversations={conversations}
    >
      {renderChatContent()}
    </TabletLayout>
  ) : (
    <DesktopLayout
      isSidebarOpen={isSidebarOpen}
      toggleSidebar={toggleSidebar}
      conversations={conversations}
    >
      {renderChatContent()}
    </DesktopLayout>
  );
}
