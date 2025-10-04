"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiProvider = void 0;
const google_genai_1 = require("@langchain/google-genai");
const messages_1 = require("@langchain/core/messages");
class GeminiProvider {
    name = 'gemini';
    model;
    client;
    constructor(config) {
        this.model = config.model;
        this.client = new google_genai_1.ChatGoogleGenerativeAI({
            modelName: config.model,
            apiKey: config.apiKey,
            temperature: config.temperature,
            maxOutputTokens: config.maxTokens,
        });
    }
    async invoke(messages) {
        // Convert our LLMMessage format to LangChain format
        const langChainMessages = messages.map(msg => {
            switch (msg.role) {
                case 'system':
                    return new messages_1.SystemMessage(msg.content);
                case 'user':
                    return new messages_1.HumanMessage(msg.content);
                case 'assistant':
                    return new messages_1.AIMessage(msg.content);
                default:
                    return new messages_1.HumanMessage(msg.content);
            }
        });
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