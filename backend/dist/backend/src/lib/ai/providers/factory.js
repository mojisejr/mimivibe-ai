"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderFactory = void 0;
const openai_1 = require("./openai");
const gemini_1 = require("./gemini");
class ProviderFactory {
    static create(type, config) {
        switch (type) {
            case 'openai':
                return new openai_1.OpenAIProvider(config);
            case 'gemini':
                return new gemini_1.GeminiProvider(config);
            default:
                throw new Error(`Unsupported provider type: ${type}`);
        }
    }
    static getSupportedProviders() {
        return ['openai', 'gemini'];
    }
}
exports.ProviderFactory = ProviderFactory;
//# sourceMappingURL=factory.js.map