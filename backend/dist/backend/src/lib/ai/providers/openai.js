"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIProvider = void 0;
const openai_1 = require("@langchain/openai");
class OpenAIProvider {
    name = 'openai';
    model;
    client;
    constructor(config) {
        this.model = config.model;
        this.client = new openai_1.ChatOpenAI({
            model: config.model,
            openAIApiKey: config.apiKey,
            temperature: config.temperature,
            maxTokens: config.maxTokens,
        });
    }
    async invoke(messages) {
        // Convert our LLMMessage format to simple message objects
        const langChainMessages = messages.map(msg => ({
            role: msg.role === 'assistant' ? 'assistant' : msg.role === 'system' ? 'system' : 'user',
            content: msg.content
        }));
        const response = await this.client.invoke(langChainMessages);
        return {
            content: response.content,
            usage: response.usage_metadata ? {
                promptTokens: response.usage_metadata.input_tokens,
                completionTokens: response.usage_metadata.output_tokens,
                totalTokens: response.usage_metadata.total_tokens,
            } : undefined,
        };
    }
    createWithPrompt(systemPrompt) {
        return {
            invoke: async (messages) => {
                const fullMessages = [
                    { role: 'system', content: systemPrompt },
                    ...messages,
                ];
                return await this.invoke(fullMessages);
            },
        };
    }
}
exports.OpenAIProvider = OpenAIProvider;
//# sourceMappingURL=openai.js.map