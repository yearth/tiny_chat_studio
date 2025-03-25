// 定义通用类型和接口

// 定义AIMessage类型
export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// API响应类型
export interface ApiResponse {
  message: string;
  conversationId: string;
}

// 请求体类型
export interface ChatRequestBody {
  messages: AIMessage[];
  conversationId?: string;
  modelId?: string;
}

// DeepSeek API响应类型
export interface DeepSeekResponse {
  choices: {
    message: {
      content: string;
      reasoning_content?: string;
      role: string;
    };
  }[];
  code?: number;
  message?: string;
}

// OpenAI API响应类型
export interface OpenAIResponse {
  choices: {
    message: {
      content: string;
      role: string;
    };
  }[];
}
