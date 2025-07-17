# AI Architecture Documentation - Multi-LLM Provider System

> **📋 Round 9.5 Context**: Multi-LLM Architecture Refactor for MiMiVibes  
> **Status**: Implementation Plan Ready  
> **Priority**: High (AI Infrastructure Enhancement)

## 🎯 Overview

This document outlines the implementation plan for **Round 9.5: Multi-LLM Architecture Refactor** to transform MiMiVibes from a single-provider AI system (Gemini-only) to a flexible multi-provider architecture supporting OpenAI GPT-4-turbo as the default provider with Gemini as fallback.

### Business Objectives
1. **Primary**: Add OpenAI GPT-4-turbo support as default provider
2. **Secondary**: Create provider abstraction for easy future AI provider additions
3. **Technical**: Maintain existing LangGraph workflow while enabling provider flexibility
4. **Operational**: Environment-based provider selection for deployment flexibility

---

## 🏗️ Current Architecture Analysis

### Existing AI System (src/lib/ai/gemini.ts)
```typescript
// Current Implementation - Single Provider
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export const geminiAI = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash-exp",
  apiKey: process.env.GOOGLE_AI_API_KEY,
  temperature: 0.7,
  maxOutputTokens: 2048,
});

// Helper function for LangGraph integration
export function createGeminiWithPrompt(systemPrompt: string) {
  return {
    async invoke(messages: any[]) {
      const fullMessages = [
        { role: "system", content: systemPrompt },
        ...messages,
      ];
      return await geminiAI.invoke(fullMessages);
    },
  };
}
```

### Current LangGraph Workflow (src/lib/langgraph/workflow.ts)
```typescript
// Current Usage - Hardcoded Provider
import { createGeminiWithPrompt } from '@/lib/ai/gemini'

// Node implementations use hardcoded Gemini
const filterAI = createGeminiWithPrompt(SYSTEM_PROMPTS.questionFilter)
const analysisAI = createGeminiWithPrompt(SYSTEM_PROMPTS.questionAnalysis)
const readingAI = createGeminiWithPrompt(SYSTEM_PROMPTS.readingAgent)
```

### Identified Limitations
1. **Single Provider Dependency**: Hardcoded to Gemini only
2. **No Provider Abstraction**: Direct integration prevents easy provider switching
3. **Environment Coupling**: No runtime provider selection capability
4. **Limited Flexibility**: Adding new providers requires workflow changes
5. **No Fallback Strategy**: Single point of failure if Gemini is unavailable

---

## 🚀 Target Architecture Design

### Provider Abstraction Layer

#### 1. LLMProvider Interface (src/lib/ai/providers/base.ts)
```typescript
// Universal Provider Interface
export interface LLMProvider {
  name: string;
  model: string;
  invoke(messages: LLMMessage[]): Promise<LLMResponse>;
  createWithPrompt(systemPrompt: string): LLMProviderInstance;
}

export interface LLMProviderInstance {
  invoke(messages: LLMMessage[]): Promise<LLMResponse>;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LLMProviderConfig {
  name: string;
  model: string;
  apiKey: string;
  temperature: number;
  maxTokens: number;
  enabled: boolean;
}
```

#### 2. OpenAI Provider Implementation (src/lib/ai/providers/openai.ts)
```typescript
import { ChatOpenAI } from "@langchain/openai";
import { LLMProvider, LLMProviderConfig, LLMMessage, LLMResponse } from './base';

export class OpenAIProvider implements LLMProvider {
  public readonly name = 'openai';
  public readonly model: string;
  private client: ChatOpenAI;

  constructor(config: LLMProviderConfig) {
    this.model = config.model;
    this.client = new ChatOpenAI({
      modelName: config.model,
      openAIApiKey: config.apiKey,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
    });
  }

  async invoke(messages: LLMMessage[]): Promise<LLMResponse> {
    const response = await this.client.invoke(messages);
    return {
      content: response.content as string,
      usage: response.usage_metadata ? {
        promptTokens: response.usage_metadata.input_tokens,
        completionTokens: response.usage_metadata.output_tokens,
        totalTokens: response.usage_metadata.total_tokens,
      } : undefined,
    };
  }

  createWithPrompt(systemPrompt: string) {
    return {
      invoke: async (messages: LLMMessage[]) => {
        const fullMessages = [
          { role: 'system' as const, content: systemPrompt },
          ...messages,
        ];
        return await this.invoke(fullMessages);
      },
    };
  }
}
```

#### 3. Gemini Provider Implementation (src/lib/ai/providers/gemini.ts)
```typescript
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { LLMProvider, LLMProviderConfig, LLMMessage, LLMResponse } from './base';

export class GeminiProvider implements LLMProvider {
  public readonly name = 'gemini';
  public readonly model: string;
  private client: ChatGoogleGenerativeAI;

  constructor(config: LLMProviderConfig) {
    this.model = config.model;
    this.client = new ChatGoogleGenerativeAI({
      model: config.model,
      apiKey: config.apiKey,
      temperature: config.temperature,
      maxOutputTokens: config.maxTokens,
    });
  }

  async invoke(messages: LLMMessage[]): Promise<LLMResponse> {
    const response = await this.client.invoke(messages);
    return {
      content: response.content as string,
      usage: response.usage_metadata ? {
        promptTokens: response.usage_metadata.input_tokens,
        completionTokens: response.usage_metadata.output_tokens,
        totalTokens: response.usage_metadata.total_tokens,
      } : undefined,
    };
  }

  createWithPrompt(systemPrompt: string) {
    return {
      invoke: async (messages: LLMMessage[]) => {
        const fullMessages = [
          { role: 'system' as const, content: systemPrompt },
          ...messages,
        ];
        return await this.invoke(fullMessages);
      },
    };
  }
}
```

#### 4. Provider Factory (src/lib/ai/providers/factory.ts)
```typescript
import { LLMProvider, LLMProviderConfig } from './base';
import { OpenAIProvider } from './openai';
import { GeminiProvider } from './gemini';

export type ProviderType = 'openai' | 'gemini';

export class ProviderFactory {
  static create(type: ProviderType, config: LLMProviderConfig): LLMProvider {
    switch (type) {
      case 'openai':
        return new OpenAIProvider(config);
      case 'gemini':
        return new GeminiProvider(config);
      default:
        throw new Error(`Unsupported provider type: ${type}`);
    }
  }

  static getSupportedProviders(): ProviderType[] {
    return ['openai', 'gemini'];
  }
}
```

#### 5. Multi-Provider Manager (src/lib/ai/manager.ts)
```typescript
import { LLMProvider, LLMProviderInstance } from './providers/base';
import { ProviderFactory, ProviderType } from './providers/factory';
import { getAIConfig } from './config';

export class LLMManager {
  private providers: Map<ProviderType, LLMProvider> = new Map();
  private defaultProvider: ProviderType;
  private fallbackProvider?: ProviderType;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const config = getAIConfig();
    this.defaultProvider = config.defaultProvider;
    this.fallbackProvider = config.fallbackProvider;

    // Initialize all available providers
    for (const [type, providerConfig] of Object.entries(config.providers)) {
      if (providerConfig.enabled) {
        try {
          const provider = ProviderFactory.create(type as ProviderType, providerConfig);
          this.providers.set(type as ProviderType, provider);
          console.log(`✅ LLM Provider initialized: ${type} (${providerConfig.model})`);
        } catch (error) {
          console.error(`❌ Failed to initialize ${type} provider:`, error);
        }
      }
    }
  }

  getProvider(type?: ProviderType): LLMProvider {
    const providerType = type || this.defaultProvider;
    const provider = this.providers.get(providerType);
    
    if (!provider) {
      if (this.fallbackProvider && providerType !== this.fallbackProvider) {
        console.warn(`⚠️ Provider ${providerType} not available, falling back to ${this.fallbackProvider}`);
        return this.getProvider(this.fallbackProvider);
      }
      throw new Error(`No available provider for type: ${providerType}`);
    }
    
    return provider;
  }

  createWithPrompt(systemPrompt: string, providerType?: ProviderType): LLMProviderInstance {
    const provider = this.getProvider(providerType);
    return provider.createWithPrompt(systemPrompt);
  }

  getAvailableProviders(): ProviderType[] {
    return Array.from(this.providers.keys());
  }
}

// Singleton instance
export const llmManager = new LLMManager();
```

#### 6. Configuration System (src/lib/ai/config.ts)
```typescript
import { LLMProviderConfig } from './providers/base';
import { ProviderType } from './providers/factory';

export interface AIConfig {
  defaultProvider: ProviderType;
  fallbackProvider?: ProviderType;
  providers: Record<ProviderType, LLMProviderConfig>;
}

export function getAIConfig(): AIConfig {
  const defaultProvider = (process.env.DEFAULT_AI_PROVIDER as ProviderType) || 'openai';
  const fallbackProvider = (process.env.AI_PROVIDER_FALLBACK as ProviderType) || 'gemini';

  return {
    defaultProvider,
    fallbackProvider,
    providers: {
      openai: {
        name: 'openai',
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo',
        apiKey: process.env.OPENAI_API_KEY || '',
        temperature: 0.7,
        maxTokens: 2048,
        enabled: !!process.env.OPENAI_API_KEY,
      },
      gemini: {
        name: 'gemini',
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
        apiKey: process.env.GOOGLE_AI_API_KEY || '',
        temperature: 0.7,
        maxTokens: 2048,
        enabled: !!process.env.GOOGLE_AI_API_KEY,
      },
    },
  };
}
```

#### 7. Public API (src/lib/ai/index.ts)
```typescript
export { llmManager } from './manager';
export { LLMProvider, LLMProviderInstance, LLMMessage, LLMResponse } from './providers/base';
export { ProviderType } from './providers/factory';
export { getAIConfig } from './config';

// Backward compatibility helpers
export { SYSTEM_PROMPTS } from './prompts';

// Updated helper function for LangGraph integration
export function createProviderWithPrompt(systemPrompt: string, providerType?: ProviderType) {
  return llmManager.createWithPrompt(systemPrompt, providerType);
}
```

---

## 🔄 Implementation Plan

### Phase 1: Provider Abstraction Foundation
1. **Create base interfaces** (`src/lib/ai/providers/base.ts`)
2. **Implement OpenAI provider** (`src/lib/ai/providers/openai.ts`)
3. **Refactor Gemini provider** (`src/lib/ai/providers/gemini.ts`)
4. **Create provider factory** (`src/lib/ai/providers/factory.ts`)

### Phase 2: Multi-Provider Management
1. **Implement LLM manager** (`src/lib/ai/manager.ts`)
2. **Create configuration system** (`src/lib/ai/config.ts`)
3. **Setup public API** (`src/lib/ai/index.ts`)
4. **Extract system prompts** (`src/lib/ai/prompts.ts`)

### Phase 3: LangGraph Integration
1. **Update workflow imports** (`src/lib/langgraph/workflow.ts`)
2. **Replace `createGeminiWithPrompt`** with `createProviderWithPrompt`
3. **Test provider switching** in all 4 workflow nodes
4. **Verify prompt compatibility** across providers

### Phase 4: Environment Configuration
1. **Add new environment variables** to `.env.local`
2. **Update package.json** with OpenAI dependencies
3. **Test provider selection** and fallback mechanisms
4. **Document deployment configuration**

---

## 📦 Dependencies & Environment

### Required Package Additions
```bash
npm install @langchain/openai
```

### Environment Variables
```bash
# Primary Provider (OpenAI as default)
DEFAULT_AI_PROVIDER=openai
OPENAI_API_KEY=sk-...                    # Already configured
OPENAI_MODEL=gpt-4-turbo                 # Optional, defaults to gpt-4-turbo

# Fallback Provider (Gemini)
AI_PROVIDER_FALLBACK=gemini
GOOGLE_AI_API_KEY=AIza...                # Already configured
GEMINI_MODEL=gemini-2.0-flash-exp        # Optional, defaults to current
```

### Backward Compatibility
- Existing `GOOGLE_AI_API_KEY` continues to work
- Current `SYSTEM_PROMPTS` remain unchanged
- LangGraph workflow structure preserved
- No breaking changes to existing API endpoints

---

## 🧪 Testing Strategy

### Unit Testing
1. **Provider Implementation Tests**
   - OpenAI provider initialization and message handling
   - Gemini provider refactored functionality
   - Factory pattern provider creation

2. **Manager Testing**
   - Provider selection and fallback logic
   - Configuration loading and validation
   - Error handling for unavailable providers

### Integration Testing
1. **LangGraph Workflow Tests**
   - All 4 nodes work with both providers
   - Prompt compatibility across providers
   - Response format consistency

2. **Environment Testing**
   - Provider selection via environment variables
   - Fallback mechanism when primary provider fails
   - API key validation and error handling

### Performance Testing
1. **Response Time Comparison**
   - OpenAI vs Gemini performance benchmarks
   - Provider switching overhead measurement
   - Token usage and cost analysis

---

## 🎯 Success Criteria

### Technical Requirements
- [ ] LLMProvider interface implemented with consistent API
- [ ] OpenAI GPT-4-turbo provider fully functional
- [ ] Gemini provider refactored to use abstraction
- [ ] LangGraph workflow provider-agnostic
- [ ] Environment-based provider selection working
- [ ] OpenAI set as default provider
- [ ] Fallback mechanism operational

### Quality Assurance
- [ ] All existing functionality preserved
- [ ] No breaking changes to API endpoints
- [ ] TypeScript compilation successful
- [ ] Build process works without errors
- [ ] Performance comparable to current implementation

### Documentation
- [ ] Environment configuration documented
- [ ] Provider switching guide created
- [ ] Deployment instructions updated
- [ ] Cost comparison analysis provided

---

## 🔍 Future Enhancements

### Provider Expansion
- **Anthropic Claude**: Easy addition via factory pattern
- **Azure OpenAI**: Enterprise deployment support
- **Local Models**: Ollama/LM Studio integration
- **Custom Providers**: Plugin architecture for specialized models

### Advanced Features
- **Cost-Based Routing**: Automatic provider selection based on cost/performance
- **Load Balancing**: Round-robin or weighted provider selection
- **Monitoring**: Provider performance and error rate tracking
- **Caching**: Response caching across providers

### Operational Improvements
- **Health Checks**: Provider availability monitoring
- **Retry Logic**: Automatic retry with exponential backoff
- **Rate Limiting**: Provider-specific rate limit handling
- **Metrics**: Token usage and cost tracking per provider

---

**Document Version**: 1.0  
**Created**: January 2025  
**Context**: Round 9.5 Multi-LLM Architecture Refactor  
**Status**: Ready for Implementation