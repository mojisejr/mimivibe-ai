import { LLMProvider, LLMProviderConfig, LLMMessage, LLMResponse } from './base';
export declare class OpenAIProvider implements LLMProvider {
    readonly name = "openai";
    readonly model: string;
    private client;
    constructor(config: LLMProviderConfig);
    invoke(messages: LLMMessage[]): Promise<LLMResponse>;
    createWithPrompt(systemPrompt: string): {
        invoke: (messages: LLMMessage[]) => Promise<LLMResponse>;
    };
}
//# sourceMappingURL=openai.d.ts.map