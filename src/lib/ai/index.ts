export { llmManager } from './manager';
export type { LLMProvider, LLMProviderInstance, LLMMessage, LLMResponse } from './providers/base';
export type { ProviderType } from './providers/factory';
export { getAIConfig } from './config';

// System prompts
export { SYSTEM_PROMPTS } from './prompts';

// Updated helper function for LangGraph integration
import type { ProviderType } from './providers/factory';
import { llmManager } from './manager';

export function createProviderWithPrompt(systemPrompt: string, providerType?: ProviderType) {
  return llmManager.createWithPrompt(systemPrompt, providerType);
}