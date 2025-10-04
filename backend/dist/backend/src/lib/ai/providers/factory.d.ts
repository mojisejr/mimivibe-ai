import { LLMProvider, LLMProviderConfig } from './base';
export type ProviderType = 'openai' | 'gemini';
export declare class ProviderFactory {
    static create(type: ProviderType, config: LLMProviderConfig): LLMProvider;
    static getSupportedProviders(): ProviderType[];
}
//# sourceMappingURL=factory.d.ts.map