import { AIModel, AIModelConfig } from './types';
import { OpenAIModel } from './models/openai';
import { OpenRouterDeepseekModel } from './models/openrouter';

/**
 * AI模型工厂类
 * 用于管理和获取不同的AI模型
 */
export class ModelFactory {
  private models: Map<string, AIModel> = new Map();
  
  constructor() {
    // 注册默认模型
    this.registerModel(new OpenAIModel());
    
    // 注册 OpenRouter Deepseek 模型
    this.registerModel(new OpenRouterDeepseekModel());
  }
  
  /**
   * 注册一个AI模型
   */
  registerModel(model: AIModel) {
    this.models.set(model.config.id, model);
  }
  
  /**
   * 获取指定ID的AI模型
   */
  getModel(id: string): AIModel | undefined {
    return this.models.get(id);
  }
  
  /**
   * 获取默认AI模型
   */
  getDefaultModel(): AIModel | undefined {
    for (const model of this.models.values()) {
      if (model.config.isDefault) {
        return model;
      }
    }
    
    // 如果没有默认模型，返回第一个
    if (this.models.size > 0) {
      return this.models.values().next().value;
    }
    
    return undefined;
  }
  
  /**
   * 获取所有可用的AI模型
   */
  getAvailableModels(): AIModel[] {
    return Array.from(this.models.values());
  }
}
