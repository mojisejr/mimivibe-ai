import { LLMProviderConfig } from './providers/base';
import { ProviderType } from './providers/factory';

export interface AIConfig {
  defaultProvider: ProviderType;
  fallbackProvider?: ProviderType;
  providers: Record<ProviderType, LLMProviderConfig>;
}

export function getAIConfig(): AIConfig {
  const defaultProvider = (process.env.DEFAULT_AI_PROVIDER as ProviderType) || 'openai';
  const fallbackProvider = (process.env.AI_PROVIDER_FALLBACK as ProviderType) || 'gemini';

  return {
    defaultProvider,
    fallbackProvider,
    providers: {
      openai: {
        name: 'openai',
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo',
        apiKey: process.env.OPENAI_API_KEY || '',
        temperature: 0.7,
        maxTokens: 4096, // Increased for complex tarot reading responses
        enabled: !!process.env.OPENAI_API_KEY,
      },
      gemini: {
        name: 'gemini',
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
        apiKey: process.env.GOOGLE_AI_API_KEY || '',
        temperature: 0.7,
        maxTokens: 4096, // Increased for complex tarot reading responses
        enabled: !!process.env.GOOGLE_AI_API_KEY,
      },
    },
  };
}