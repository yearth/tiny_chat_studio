import React, { createContext, useContext } from "react";
import { LocalConversation } from "@/data/mockData";

interface ConversationContextProps {
  removeConversation: (conversationId: string) => Promise<boolean>;
  conversations: LocalConversation[];
  selectedConversationId: string | null;
}

const ConversationContext = createContext<ConversationContextProps | undefined>(
  undefined
);

export function ConversationProvider({
  children,
  removeConversation,
  conversations,
  selectedConversationId,
}: ConversationContextProps & { children: React.ReactNode }) {
  return (
    <ConversationContext.Provider
      value={{ removeConversation, conversations, selectedConversationId }}
    >
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversationContext() {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error(
      "useConversationContext must be used within a ConversationProvider"
    );
  }
  return context;
}
