export { llmManager } from './manager';
export type { LLMProvider, LLMProviderInstance, LLMMessage, LLMResponse } from './providers/base';
export type { ProviderType } from './providers/factory';
export { getAIConfig } from './config';
import type { ProviderType } from './providers/factory';
export declare function createProviderWithPrompt(systemPrompt: string, providerType?: ProviderType): import("./providers/base").LLMProviderInstance;
//# sourceMappingURL=index.d.ts.map