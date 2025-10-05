import { LLMProvider, LLMProviderConfig } from './base';
import { OpenAIProvider } from './openai';
import { GeminiProvider } from './gemini';

export type ProviderType = 'openai' | 'gemini';

export class ProviderFactory {
  static create(type: ProviderType, config: LLMProviderConfig): LLMProvider {
    switch (type) {
      case 'openai':
        return new OpenAIProvider(config);
      case 'gemini':
        return new GeminiProvider(config);
      default:
        throw new Error(`Unsupported provider type: ${type}`);
    }
  }

  static getSupportedProviders(): ProviderType[] {
    return ['openai', 'gemini'];
  }
}