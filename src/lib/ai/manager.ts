import { LLMProvider, LLMProviderInstance } from './providers/base';
import { ProviderFactory, ProviderType } from './providers/factory';
import { getAIConfig } from './config';

export class LLMManager {
  private providers: Map<ProviderType, LLMProvider> = new Map();
  private defaultProvider!: ProviderType;
  private fallbackProvider?: ProviderType;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const config = getAIConfig();
    this.defaultProvider = config.defaultProvider;
    this.fallbackProvider = config.fallbackProvider;

    // Initialize all available providers
    for (const [type, providerConfig] of Object.entries(config.providers)) {
      if (providerConfig.enabled) {
        try {
          const provider = ProviderFactory.create(type as ProviderType, providerConfig);
          this.providers.set(type as ProviderType, provider);
        } catch (error) {
          // ignore init error to allow graceful fallback
        }
      }
    }
  }

  getProvider(type?: ProviderType): LLMProvider {
    const providerType = type || this.defaultProvider;
    const provider = this.providers.get(providerType);
    if (!provider) {
      if (this.fallbackProvider && providerType !== this.fallbackProvider) {
        return this.getProvider(this.fallbackProvider);
      }
      throw new Error(`No available provider for type: ${providerType}`);
    }
    return provider;
  }

  createWithPrompt(systemPrompt: string, providerType?: ProviderType): LLMProviderInstance {
    const provider = this.getProvider(providerType);
    return provider.createWithPrompt(systemPrompt);
  }

  getAvailableProviders(): ProviderType[] {
    return Array.from(this.providers.keys());
  }
}

// Singleton instance
export const llmManager = new LLMManager();