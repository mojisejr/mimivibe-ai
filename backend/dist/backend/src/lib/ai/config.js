"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAIConfig = getAIConfig;
function getAIConfig() {
    const defaultProvider = process.env.DEFAULT_AI_PROVIDER || "openai";
    const fallbackProvider = process.env.AI_PROVIDER_FALLBACK || "gemini";
    return {
        defaultProvider,
        fallbackProvider,
        providers: {
            openai: {
                name: "openai",
                model: process.env.OPENAI_MODEL || "gpt-4-turbo",
                apiKey: process.env.OPENAI_API_KEY || "",
                temperature: 0.7,
                maxTokens: 4096, // Increased for complex tarot reading responses
                enabled: !!process.env.OPENAI_API_KEY,
            },
            gemini: {
                name: "gemini",
                model: process.env.GEMINI_MODEL || "gemini-2.0-flash-exp",
                apiKey: process.env.GOOGLE_AI_API_KEY || "",
                temperature: 0.7,
                maxTokens: 4096, // Increased for complex tarot reading responses
                enabled: !!process.env.GOOGLE_AI_API_KEY,
            },
        },
    };
}
//# sourceMappingURL=config.js.map