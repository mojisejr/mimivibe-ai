"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiProvider = void 0;
const google_genai_1 = require("@langchain/google-genai");
class GeminiProvider {
    name = 'gemini';
    model;
    client;
    constructor(config) {
        this.model = config.model;
        this.client = new google_genai_1.ChatGoogleGenerativeAI({
            model: config.model,
            apiKey: config.apiKey,
            temperature: config.temperature,
            maxOutputTokens: config.maxTokens,
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
exports.GeminiProvider = GeminiProvider;
//# sourceMappingURL=gemini.js.map