import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
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
    // Convert our LLMMessage format to simple message objects
    const langChainMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : msg.role === 'system' ? 'system' : 'user',
      content: msg.content
    }));
    
    const response = await this.client.invoke(langChainMessages);
    return {
      content: response.content as string,
      usage: (response as any).usage_metadata ? {
        promptTokens: (response as any).usage_metadata.input_tokens,
        completionTokens: (response as any).usage_metadata.output_tokens,
        totalTokens: (response as any).usage_metadata.total_tokens,
      } : undefined,
    };
  }

  createWithPrompt(systemPrompt: string) {
    return {
      invoke: async (messages: LLMMessage[]) => {
        const fullMessages: LLMMessage[] = [
          { role: 'system' as const, content: systemPrompt },
          ...messages,
        ];
        return await this.invoke(fullMessages);
      },
    };
  }
}