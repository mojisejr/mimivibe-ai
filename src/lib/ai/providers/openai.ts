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
    // Convert our LLMMessage format to LangChain format
    const langChainMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    try {
      const response = await this.client.invoke(langChainMessages);
      return {
        content: response.content as string,
        usage: response.usage_metadata ? {
          promptTokens: response.usage_metadata.input_tokens,
          completionTokens: response.usage_metadata.output_tokens,
          totalTokens: response.usage_metadata.total_tokens,
        } : undefined,
      };
    } catch (error) {
      throw error;
    }
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