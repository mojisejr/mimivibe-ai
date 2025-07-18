# LLM Factory Pattern Guide

> **🎯 Purpose**: คู่มือการใช้งาน Multi-LLM Architecture สำหรับ MiMiVibes  
> **👤 Target**: Personal Reference & Quick Implementation  
> **📅 Updated**: January 2025

## 🚀 Quick Start - การสลับ LLM

### 1. สลับ Provider ผ่าน Environment Variables

#### Development (.env.local)

```bash
# สลับเป็น OpenAI (Default)
DEFAULT_AI_PROVIDER=openai
AI_PROVIDER_FALLBACK=gemini

# สลับเป็น Gemini
DEFAULT_AI_PROVIDER=gemini
AI_PROVIDER_FALLBACK=openai

# ปิด Fallback (ไม่แนะนำ)
# AI_PROVIDER_FALLBACK=
```

#### Production (Vercel)

```bash
# Vercel Dashboard → Settings → Environment Variables
DEFAULT_AI_PROVIDER=openai
AI_PROVIDER_FALLBACK=gemini
OPENAI_API_KEY=sk-...
GOOGLE_AI_API_KEY=AIza...
```

### 2. ทดสอบการสลับ

```typescript
// ใช้ default provider
const reading = await createProviderWithPrompt(prompt).invoke(messages);

// ระบุ provider เฉพาะ
const openaiReading = await llmManager
  .createWithPrompt(prompt, "openai")
  .invoke(messages);
const geminiReading = await llmManager
  .createWithPrompt(prompt, "gemini")
  .invoke(messages);
```

---

## 📖 Architecture Overview

### ไฟล์สำคัญ

```
/src/lib/ai/
├── providers/
│   ├── base.ts          # LLMProvider interface
│   ├── openai.ts        # OpenAI implementation
│   ├── gemini.ts        # Gemini implementation
│   └── factory.ts       # Provider factory
├── manager.ts           # LLM manager + fallback logic
├── config.ts            # Configuration & environment
└── index.ts             # Public API
```

### Flow การทำงาน

```
User Request → LLM Manager → Provider Factory → Specific Provider → LangChain → AI API
                     ↓
             Fallback Logic (ถ้า primary ล่ม)
```

---

## 🔧 การเพิ่ม LLM Provider ใหม่

### Step 1: สร้าง Provider Class

#### ตัวอย่าง: Claude Provider

**File**: `/src/lib/ai/providers/claude.ts`

```typescript
import { ChatAnthropic } from "@langchain/anthropic";
import {
  LLMProvider,
  LLMProviderConfig,
  LLMMessage,
  LLMResponse,
} from "./base";

export class ClaudeProvider implements LLMProvider {
  public readonly name = "claude";
  public readonly model: string;
  private client: ChatAnthropic;

  constructor(config: LLMProviderConfig) {
    this.model = config.model;
    this.client = new ChatAnthropic({
      model: config.model,
      apiKey: config.apiKey,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
    });
  }

  async invoke(messages: LLMMessage[]): Promise<LLMResponse> {
    const response = await this.client.invoke(messages);
    return {
      content: response.content as string,
      usage: response.usage_metadata
        ? {
            promptTokens: response.usage_metadata.input_tokens,
            completionTokens: response.usage_metadata.output_tokens,
            totalTokens: response.usage_metadata.total_tokens,
          }
        : undefined,
    };
  }

  createWithPrompt(systemPrompt: string) {
    return {
      invoke: async (messages: LLMMessage[]) => {
        const fullMessages = [
          { role: "system" as const, content: systemPrompt },
          ...messages,
        ];
        return await this.invoke(fullMessages);
      },
    };
  }
}
```

### Step 2: เพิ่มใน Factory

**File**: `/src/lib/ai/providers/factory.ts`

```typescript
import { ClaudeProvider } from "./claude";

export type ProviderType = "openai" | "gemini" | "claude"; // เพิ่ม claude

export class ProviderFactory {
  static create(type: ProviderType, config: LLMProviderConfig): LLMProvider {
    switch (type) {
      case "openai":
        return new OpenAIProvider(config);
      case "gemini":
        return new GeminiProvider(config);
      case "claude":
        return new ClaudeProvider(config); // เพิ่มนี้
      default:
        throw new Error(`Unsupported provider type: ${type}`);
    }
  }

  static getSupportedProviders(): ProviderType[] {
    return ["openai", "gemini", "claude"]; // เพิ่ม claude
  }
}
```

### Step 3: เพิ่ม Configuration

**File**: `/src/lib/ai/config.ts`

```typescript
export function getAIConfig(): AIConfig {
  return {
    defaultProvider,
    fallbackProvider,
    providers: {
      openai: {
        /* existing */
      },
      gemini: {
        /* existing */
      },
      claude: {
        name: "claude",
        model: process.env.CLAUDE_MODEL || "claude-3-sonnet-20240229",
        apiKey: process.env.ANTHROPIC_API_KEY || "",
        temperature: 0.7,
        maxTokens: 4096,
        enabled: !!process.env.ANTHROPIC_API_KEY,
      },
    },
  };
}
```

### Step 4: เพิ่ม Environment Variables

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-3-sonnet-20240229
DEFAULT_AI_PROVIDER=claude
```

### Step 5: Install Dependencies

```bash
npm install @langchain/anthropic
```

---

## 💰 Cost & Performance Comparison

### ราคาประมาณ (สำหรับ Thai Tarot Reading ~1,500 tokens)

| Provider | Model       | Input Cost  | Output Cost | Total/Reading |
| -------- | ----------- | ----------- | ----------- | ------------- |
| OpenAI   | GPT-4-turbo | $0.01/1K    | $0.03/1K    | ~$0.06        |
| Gemini   | 2.0 Flash   | $0.00075/1K | $0.003/1K   | ~$0.005       |
| Claude   | 3.5 Sonnet  | $0.003/1K   | $0.015/1K   | ~$0.027       |

### Performance Characteristics

#### OpenAI GPT-4-turbo

- ✅ **ดี**: Quality สูง, จัดการภาษาไทยได้ดี, JSON format consistency
- ⚠️ **ระวัง**: ราคาแพงสุด, rate limit 5,000 RPM
- 🎯 **เหมาะสำหรับ**: Production, quality-first scenarios

#### Gemini 2.0 Flash

- ✅ **ดี**: ราคาถูกสุด, เร็ว, ฟรี tier ใหญ่
- ⚠️ **ระวัง**: Quality ต่ำกว่า GPT-4, บางครั้งจัดการ JSON ไม่ดี
- 🎯 **เหมาะสำหรับ**: Development, cost-sensitive scenarios, fallback

#### Claude 3.5 Sonnet

- ✅ **ดี**: Quality ดี, safety filters ดี, จัดการ context ยาวได้
- ⚠️ **ระวัง**: ราคาปานกลาง, rate limit เข้มกว่า
- 🎯 **เหมาะสำหรับ**: Alternative to GPT-4, content moderation

---

## ⚠️ ข้อควรระวัง & Best Practices

### 1. Rate Limiting

```typescript
// ตรวจสอบ rate limit ของแต่ละ provider
const RATE_LIMITS = {
  openai: { rpm: 5000, tpm: 800000 },
  gemini: { rpm: 1500, tpm: 32000 }, // Free tier
  claude: { rpm: 1000, tpm: 40000 },
};
```

### 2. Error Handling

```typescript
// ตัวอย่าง fallback logic
try {
  return await primaryProvider.invoke(messages);
} catch (error) {
  console.warn(`Primary provider failed: ${error.message}`);
  if (fallbackProvider) {
    return await fallbackProvider.invoke(messages);
  }
  throw error;
}
```

### 3. Response Format Differences

#### OpenAI Response

```json
{
  "content": "...",
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 1200,
    "total_tokens": 1350
  }
}
```

#### Gemini Response

```json
{
  "content": "...",
  "usage_metadata": {
    "input_tokens": 150,
    "output_tokens": 1200,
    "total_tokens": 1350
  }
}
```

### 4. JSON Parsing Considerations

```typescript
// Provider-specific JSON handling
const PROVIDER_QUIRKS = {
  gemini: {
    // มักจะใส่ markdown code blocks
    needsMarkdownStripping: true,
    // บางครั้ง JSON ไม่ complete
    needsTruncationFix: true,
  },
  openai: {
    // JSON format ค่อนข้าง consistent
    needsMarkdownStripping: false,
    needsTruncationFix: false,
  },
};
```

### 5. Environment Security

```bash
# ⚠️ อย่าใส่ API keys ใน git
# ✅ ใช้ .env.local สำหรับ development
# ✅ ใช้ Vercel dashboard สำหรับ production

# Example .env.local
OPENAI_API_KEY=sk-...
GOOGLE_AI_API_KEY=AIza...
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 🛠️ Debugging & Monitoring

### 1. Provider Status Check

```typescript
// ตรวจสอบ providers ที่ใช้ได้
const availableProviders = llmManager.getAvailableProviders();
console.log("Available providers:", availableProviders);

// ตรวจสอบ default provider
const defaultProvider = llmManager.getProvider();
console.log("Current default:", defaultProvider.name);
```

### 2. Token Usage Monitoring

```typescript
// ติดตาม token usage
const response = await provider.invoke(messages);
if (response.usage) {
  console.log(`Tokens used: ${response.usage.totalTokens}`);
  console.log(`Cost estimate: $${response.usage.totalTokens * 0.00003}`);
}
```

### 3. Performance Testing

```typescript
// ทดสอบ response time
const start = Date.now();
const response = await provider.invoke(messages);
const duration = Date.now() - start;
console.log(`Response time: ${duration}ms`);
```

---

## 🚀 Use Cases & Scenarios

### Scenario 1: Development Testing

```bash
# ใช้ Gemini สำหรับ development (ราคาถูก)
DEFAULT_AI_PROVIDER=gemini
AI_PROVIDER_FALLBACK=openai
```

### Scenario 2: Production Quality

```bash
# ใช้ OpenAI สำหรับ production (quality สูง)
DEFAULT_AI_PROVIDER=openai
AI_PROVIDER_FALLBACK=gemini
```

### Scenario 3: Cost Optimization

```bash
# ใช้ Gemini หลัก, OpenAI fallback
DEFAULT_AI_PROVIDER=gemini
AI_PROVIDER_FALLBACK=openai
```

### Scenario 4: A/B Testing

```typescript
// สุ่มเลือก provider สำหรับ A/B test
const provider = Math.random() > 0.5 ? "openai" : "gemini";
const response = await llmManager
  .createWithPrompt(prompt, provider)
  .invoke(messages);
```

---

## 📚 Quick Reference

### Environment Variables

```bash
# Provider Selection
DEFAULT_AI_PROVIDER=openai|gemini|claude
AI_PROVIDER_FALLBACK=openai|gemini|claude

# API Keys
OPENAI_API_KEY=sk-...
GOOGLE_AI_API_KEY=AIza...
ANTHROPIC_API_KEY=sk-ant-...

# Model Selection (Optional)
OPENAI_MODEL=gpt-4-turbo
GEMINI_MODEL=gemini-2.0-flash-exp
CLAUDE_MODEL=claude-3-sonnet-20240229
```

### Code Snippets

```typescript
// Import
import { llmManager, createProviderWithPrompt } from "@/lib/ai";

// Use default provider
const defaultResponse = await createProviderWithPrompt(prompt).invoke(messages);

// Use specific provider
const openaiResponse = await llmManager
  .createWithPrompt(prompt, "openai")
  .invoke(messages);

// Check available providers
const providers = llmManager.getAvailableProviders();
```

---

**💡 Tips**:

- เริ่มด้วย Gemini สำหรับ development
- เปลี่ยนเป็น OpenAI สำหรับ production
- ใช้ fallback เสมอเพื่อความน่าเชื่อถือ
- Monitor token usage เพื่อควบคุมค่าใช้จ่าย

**⚠️ Warning**:

- อย่าใส่ API keys ใน code
- ตรวจสอบ rate limits ก่อนใช้ในการผลิต
- Test providers ใหม่ก่อนใช้ใน production
