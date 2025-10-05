import { LLMProvider, LLMProviderConfig, LLMMessage, LLMResponse } from './base';
export declare class GeminiProvider implements LLMProvider {
    readonly name = "gemini";
    readonly model: string;
    private client;
    constructor(config: LLMProviderConfig);
    invoke(messages: LLMMessage[]): Promise<LLMResponse>;
    createWithPrompt(systemPrompt: string): {
        invoke: (messages: LLMMessage[]) => Promise<LLMResponse>;
    };
}
//# sourceMappingURL=gemini.d.ts.map