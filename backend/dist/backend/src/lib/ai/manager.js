"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.llmManager = exports.LLMManager = void 0;
const factory_1 = require("./providers/factory");
const config_1 = require("./config");
class LLMManager {
    providers = new Map();
    defaultProvider;
    fallbackProvider;
    constructor() {
        this.initialize();
    }
    initialize() {
        const config = (0, config_1.getAIConfig)();
        this.defaultProvider = config.defaultProvider;
        this.fallbackProvider = config.fallbackProvider;
        // Initialize all available providers
        for (const [type, providerConfig] of Object.entries(config.providers)) {
            if (providerConfig.enabled) {
                try {
                    const provider = factory_1.ProviderFactory.create(type, providerConfig);
                    this.providers.set(type, provider);
                }
                catch (error) {
                }
            }
        }
    }
    getProvider(type) {
        const providerType = type || this.defaultProvider;
        const provider = this.providers.get(providerType);
        if (!provider) {
            if (this.fallbackProvider && providerType !== this.fallbackProvider) {
                ;
                return this.getProvider(this.fallbackProvider);
            }
            throw new Error(`No available provider for type: ${providerType}`);
        }
        return provider;
    }
    createWithPrompt(systemPrompt, providerType) {
        const provider = this.getProvider(providerType);
        return provider.createWithPrompt(systemPrompt);
    }
    getAvailableProviders() {
        return Array.from(this.providers.keys());
    }
}
exports.LLMManager = LLMManager;
// Singleton instance
exports.llmManager = new LLMManager();
//# sourceMappingURL=manager.js.map