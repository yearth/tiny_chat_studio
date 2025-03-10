export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  id?: string;
  content: string;
  role: Role;
  createdAt?: Date;
}

export interface Conversation {
  id?: string;
  title: string;
  messages: Message[];
  modelId: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  modelId: string;
  description?: string;
  iconUrl?: string;
  isActive: boolean;
}

export interface ApiKey {
  id?: string;
  name: string;
  key: string;
  provider: string;
  userId: string;
  isActive: boolean;
}
