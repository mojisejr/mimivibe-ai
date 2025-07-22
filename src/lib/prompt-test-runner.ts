import { PromptManager } from "./prompt-manager";
import { LLMManager } from "./ai/manager";
import { PrismaClient } from "@prisma/client";

export interface TestStepResult {
  stepName: string;
  promptUsed: string;
  version: number;
  provider: string;
  executionTime: number;
  input: any;
  output: any;
  success: boolean;
  error?: string;
}

export interface FullTestResult {
  question: string;
  totalTime: number;
  totalTokens: number;
  steps: TestStepResult[];
  finalResult: any;
  success: boolean;
  error?: string;
}

/**
 * Enhanced test runner for prompt testing with detailed step tracking
 */
export class PromptTestRunner {
  private manager: PromptManager;
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
    this.manager = new PromptManager(this.prisma);
  }

  /**
   * Run full tarot reading test with step-by-step tracking
   */
  async runFullTest(
    question: string,
    options: {
      versionOverrides?: Record<string, number>;
      saveResults?: boolean;
      debugMode?: boolean;
    } = {}
  ): Promise<FullTestResult> {
    const startTime = Date.now();
    const steps: TestStepResult[] = [];
    let totalTokens = 0;

    try {
      console.log("🔮 Starting Tarot Reading Test...");
      if (options.debugMode) {
        console.log("🔍 Debug Mode - Step by Step Analysis");
      }
      console.log();

      // Step 1: Question Filter
      const filterStep = await this.runStep(
        "questionFilter",
        "Question Filter",
        question,
        options.versionOverrides?.questionFilter,
        options.debugMode
      );
      steps.push(filterStep);
      totalTokens += filterStep.output?.tokenUsage || 0;

      if (!filterStep.success) {
        throw new Error(`Question filter failed: ${filterStep.error}`);
      }

      const filterResult =
        typeof filterStep.output === "string"
          ? JSON.parse(filterStep.output)
          : filterStep.output;

      if (!filterResult.isValid) {
        throw new Error(`Question validation failed: ${filterResult.reason}`);
      }

      console.log("✅ Filter Result:", JSON.stringify(filterResult, null, 2));

      // Step 2: Card Selection (Database operation, no AI)
      const cardStep = await this.runCardSelection(options.debugMode);
      steps.push(cardStep);

      console.log(
        "🎯 Selected Cards:",
        cardStep.output.cardIds,
        `(${cardStep.output.cardNames.join(", ")})`
      );

      // Step 3: Question Analysis
      const analysisStep = await this.runStep(
        "questionAnalysis",
        "Question Analysis",
        { question, context: "tarot_reading" },
        options.versionOverrides?.questionAnalysis,
        options.debugMode
      );
      steps.push(analysisStep);
      totalTokens += analysisStep.output?.tokenUsage || 0;

      if (!analysisStep.success) {
        throw new Error(`Question analysis failed: ${analysisStep.error}`);
      }

      const analysisResult =
        typeof analysisStep.output === "string"
          ? JSON.parse(analysisStep.output)
          : analysisStep.output;

      console.log("📊 Analysis:", JSON.stringify(analysisResult, null, 2));

      // Step 4: Reading Generation
      const readingStep = await this.runStep(
        "readingAgent",
        "Reading Generation",
        {
          question,
          selectedCards: cardStep.output.cards,
          analysis: analysisResult,
        },
        options.versionOverrides?.readingAgent,
        options.debugMode
      );
      steps.push(readingStep);
      totalTokens += readingStep.output?.tokenUsage || 0;

      if (!readingStep.success) {
        throw new Error(`Reading generation failed: ${readingStep.error}`);
      }

      const finalResult =
        typeof readingStep.output === "string"
          ? JSON.parse(readingStep.output)
          : readingStep.output;

      const totalTime = Date.now() - startTime;

      console.log();
      console.log("🌟 Final Reading:");
      console.log(JSON.stringify(finalResult, null, 2));
      console.log();
      console.log(`⏱️  Total Time: ${this.formatDuration(totalTime)}`);
      console.log(`💰 Token Usage: ${totalTokens} tokens`);

      // Save test results if requested
      if (options.saveResults) {
        await this.saveTestResults(question, steps, totalTime, totalTokens);
        console.log("💾 Results saved to database for analysis");
      }

      return {
        question,
        totalTime,
        totalTokens,
        steps,
        finalResult,
        success: true,
      };
    } catch (error) {
      const totalTime = Date.now() - startTime;

      console.error(`❌ Test failed: ${error instanceof Error ? error.message : String(error)}`);

      console.log(error);

      return {
        question,
        totalTime,
        totalTokens,
        steps,
        finalResult: null,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Run individual prompt step
   */
  private async runStep(
    promptName: string,
    stepName: string,
    input: any,
    versionOverride?: number,
    debugMode = false
  ): Promise<TestStepResult> {
    const startTime = Date.now();

    try {
      // Get prompt (specific version or active)
      const prompt = versionOverride
        ? await this.manager.getPromptVersion(promptName, versionOverride)
        : await this.manager.getPrompt(promptName);

      // Get version info for tracking
      const templates = await this.manager.listPrompts(true);
      const template = templates.find((t) => t.name === promptName);
      const version = versionOverride || template?.version || 1;

      if (debugMode) {
        console.log(`Step: ${stepName}`);
        console.log(`📝 Prompt Used: [${promptName} v${version}]`);
        console.log(
          `🤖 Provider: ${process.env.DEFAULT_AI_PROVIDER || "unknown"}`
        );
        console.log(
          `📤 Input:`,
          typeof input === "string" ? input : JSON.stringify(input)
        );
      }

      // Execute LLM call
      const llmManager = new LLMManager();
      const llmInstance = llmManager.createWithPrompt(prompt);

      const inputText =
        typeof input === "string" ? input : JSON.stringify(input);
      const result = await llmInstance.invoke([
        { role: "user", content: inputText },
      ]);
      const executionTime = Date.now() - startTime;

      const outputContent = result.content || result;

      let cleanedOutput = outputContent;
      if (typeof outputContent === "string") {
        // Remove markdown code block fences if present
        cleanedOutput = outputContent
          .replace(/^```json\s*/, "")
          .replace(/\s*```$/, "");
        // Attempt to remove any leading/trailing whitespace that might remain
        cleanedOutput = cleanedOutput.trim();
      }

      if (debugMode) {
        console.log(`⚡ Response Time: ${this.formatDuration(executionTime)}`);
        console.log(`📥 Output:`, outputContent);
        console.log();
      }

      return {
        stepName,
        promptUsed: promptName,
        version,
        provider: process.env.DEFAULT_AI_PROVIDER || "unknown",
        executionTime,
        input,
        // output: outputContent,
        output: cleanedOutput,
        success: true,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      if (debugMode) {
        console.error(`❌ Step failed: ${error instanceof Error ? error.message : String(error)}`);
        console.log();
      }

      return {
        stepName,
        promptUsed: promptName,
        version: versionOverride || 1,
        provider: process.env.DEFAULT_AI_PROVIDER || "unknown",
        executionTime,
        input,
        output: null,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Run card selection (database operation)
   */
  private async runCardSelection(debugMode = false): Promise<TestStepResult> {
    const startTime = Date.now();

    try {
      // Simulate card selection (using same logic as workflow)
      const allCards = await this.prisma.card.findMany();
      const selectedCards = [];
      const usedIndices = new Set<number>();

      // Select 3 random cards
      while (selectedCards.length < 3) {
        const randomIndex = Math.floor(Math.random() * allCards.length);
        if (!usedIndices.has(randomIndex)) {
          usedIndices.add(randomIndex);
          selectedCards.push(allCards[randomIndex]);
        }
      }

      const executionTime = Date.now() - startTime;

      const result = {
        cardIds: selectedCards.map((c) => c.id),
        cardNames: selectedCards.map((c) => c.displayName),
        cards: selectedCards,
      };

      if (debugMode) {
        console.log(`Step 2: Card Selection`);
        console.log(`🎲 Random Cards: [${result.cardIds.join(", ")}]`);
        console.log(
          `🃏 Card Names: [${result.cardNames.map((n) => `"${n}"`).join(", ")}]`
        );
        console.log(`⚡ Response Time: ${this.formatDuration(executionTime)}`);
        console.log();
      }

      return {
        stepName: "Card Selection",
        promptUsed: "database",
        version: 1,
        provider: "database",
        executionTime,
        input: { requestedCards: 3 },
        output: result,
        success: true,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      return {
        stepName: "Card Selection",
        promptUsed: "database",
        version: 1,
        provider: "database",
        executionTime,
        input: { requestedCards: 3 },
        output: null,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Save test results to database
   */
  private async saveTestResults(
    question: string,
    steps: TestStepResult[],
    totalTime: number,
    totalTokens: number
  ): Promise<void> {
    for (const step of steps) {
      if (step.promptUsed !== "database") {
        const templates = await this.manager.listPrompts(true);
        const template = templates.find((t) => t.name === step.promptUsed);

        if (template) {
          await this.manager.saveTestResult({
            templateId: template.id,
            version: step.version,
            testQuestion: question,
            resultData: {
              step: step.stepName,
              input: step.input,
              output: step.output,
              success: step.success,
              error: step.error,
            },
            executionTimeMs: step.executionTime,
            tokenUsage: totalTokens, // Approximate token distribution
            aiProvider: step.provider,
          });
        }
      }
    }
  }

  /**
   * Format duration for display
   */
  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    await this.manager.cleanup();
    await this.prisma.$disconnect();
  }
}

// Already exported above
