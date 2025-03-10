import React from 'react';
import Link from 'next/link';
import { Conversation } from '@/types/chat';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId?: string;
}

export default function Sidebar({
  conversations,
  activeConversationId,
}: SidebarProps) {
  return (
    <div className="w-64 bg-gray-100 dark:bg-gray-800 h-full flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">AI Chat Platform</h1>
      </div>
      
      <div className="p-4">
        <Link 
          href="/chat/new" 
          className="w-full bg-blue-500 text-white rounded-lg px-4 py-2 flex items-center justify-center hover:bg-blue-600"
        >
          <span>New Chat</span>
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 px-2 mb-2">
          Recent Conversations
        </h2>
        <ul className="space-y-1">
          {conversations.map((conversation) => (
            <li key={conversation.id}>
              <Link 
                href={`/chat/${conversation.id}`}
                className={`block px-3 py-2 rounded-lg ${
                  activeConversationId === conversation.id
                    ? 'bg-blue-100 dark:bg-blue-900'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <div className="truncate">{conversation.title}</div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="p-4 border-t">
        <Link 
          href="/settings" 
          className="block px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          Settings
        </Link>
      </div>
    </div>
  );
}
