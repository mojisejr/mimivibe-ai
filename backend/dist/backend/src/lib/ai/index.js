"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAIConfig = exports.llmManager = void 0;
exports.createProviderWithPrompt = createProviderWithPrompt;
var manager_1 = require("./manager");
Object.defineProperty(exports, "llmManager", { enumerable: true, get: function () { return manager_1.llmManager; } });
var config_1 = require("./config");
Object.defineProperty(exports, "getAIConfig", { enumerable: true, get: function () { return config_1.getAIConfig; } });
const manager_2 = require("./manager");
function createProviderWithPrompt(systemPrompt, providerType) {
    return manager_2.llmManager.createWithPrompt(systemPrompt, providerType);
}
//# sourceMappingURL=index.js.map