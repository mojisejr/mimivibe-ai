import { LLMProvider, LLMProviderInstance } from './providers/base';
import { ProviderType } from './providers/factory';
export declare class LLMManager {
    private providers;
    private defaultProvider;
    private fallbackProvider?;
    constructor();
    private initialize;
    getProvider(type?: ProviderType): LLMProvider;
    createWithPrompt(systemPrompt: string, providerType?: ProviderType): LLMProviderInstance;
    getAvailableProviders(): ProviderType[];
}
export declare const llmManager: LLMManager;
//# sourceMappingURL=manager.d.ts.map