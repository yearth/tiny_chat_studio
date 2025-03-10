import OpenAI from 'openai';
import { Message } from '@/types/chat';

// Initialize OpenAI client
const getOpenAIClient = (apiKey: string) => {
  return new OpenAI({
    apiKey: apiKey,
  });
};

// Convert our app's message format to OpenAI's format
const formatMessagesForOpenAI = (messages: Message[]) => {
  return messages.map((message) => ({
    role: message.role,
    content: message.content,
  }));
};

// Function to generate chat completion using OpenAI
export async function generateOpenAICompletion(
  messages: Message[],
  apiKey: string,
  model: string = 'gpt-3.5-turbo'
) {
  const openai = getOpenAIClient(apiKey);
  
  try {
    const formattedMessages = formatMessagesForOpenAI(messages);
    
    const response = await openai.chat.completions.create({
      model: model,
      messages: formattedMessages,
      stream: true,
    });
    
    return response;
  } catch (error) {
    console.error('Error generating OpenAI completion:', error);
    throw error;
  }
}

// Function to handle different AI providers
export async function generateAIResponse(
  messages: Message[],
  provider: string,
  modelId: string,
  apiKey: string
) {
  switch (provider.toLowerCase()) {
    case 'openai':
      return generateOpenAICompletion(messages, apiKey, modelId);
    // Add more providers as needed
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}
