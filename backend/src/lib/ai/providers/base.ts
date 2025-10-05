// Base interfaces for multi-provider LLM architecture
export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LLMProviderConfig {
  name: string;
  model: string;
  apiKey: string;
  temperature: number;
  maxTokens: number;
  enabled: boolean;
}

export interface LLMProviderInstance {
  invoke(messages: LLMMessage[]): Promise<LLMResponse>;
}

export interface LLMProvider {
  name: string;
  model: string;
  invoke(messages: LLMMessage[]): Promise<LLMResponse>;
  createWithPrompt(systemPrompt: string): LLMProviderInstance;
}