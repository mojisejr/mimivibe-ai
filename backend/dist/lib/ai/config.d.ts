import { LLMProviderConfig } from "./providers/base";
import { ProviderType } from "./providers/factory";
export interface AIConfig {
    defaultProvider: ProviderType;
    fallbackProvider?: ProviderType;
    providers: Record<ProviderType, LLMProviderConfig>;
}
export declare function getAIConfig(): AIConfig;
//# sourceMappingURL=config.d.ts.map