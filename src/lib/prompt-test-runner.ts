import { PromptManager } from "./prompt-manager";
import { LLMManager } from "./ai/manager";
import { PrismaClient } from "@prisma/client";
import chalk from 'chalk';
import figlet from 'figlet';
import boxen from 'boxen';
import ora from 'ora';
import Table from 'cli-table3';

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
    console.log(chalk.cyan(figlet.textSync('Test Run', { horizontalLayout: 'fitted' })));
    console.log(chalk.cyan('🧪 Running full tarot reading test...\n'));
    
    console.log(boxen(
      chalk.white(`Question: "${question}"\n`) +
      chalk.gray(`Debug Mode: ${options.debugMode ? 'ON' : 'OFF'}\n`) +
      chalk.gray(`Save Results: ${options.saveResults ? 'YES' : 'NO'}`),
      { padding: 1, borderColor: 'blue', borderStyle: 'round' }
    ));
    
    const startTime = Date.now();
    const steps: TestStepResult[] = [];
    let totalTokens = 0;

    try {
      console.log(chalk.blue('\n🔄 Starting test pipeline...\n'));

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


      // Step 2: Card Selection (Database operation, no AI)
      const cardStep = await this.runCardSelection(options.debugMode);
      steps.push(cardStep);


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

      // Save test results if requested
      if (options.saveResults) {
        const spinner = ora('💾 Saving test results...').start();
        await this.saveTestResults(question, steps, totalTime, totalTokens);
        spinner.succeed(chalk.green('✅ Test results saved'));
      }

      // Display results summary
      this.displayTestSummary({
        question,
        totalTime,
        totalTokens,
        steps,
        finalResult,
        success: true,
      });

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

      const failedResult = {
        question,
        totalTime,
        totalTokens,
        steps,
        finalResult: null,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };

      // Display error summary
      this.displayTestSummary(failedResult);

      return failedResult;
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
    const spinner = ora(`🔄 ${stepName}...`).start();
    const startTime = Date.now();

    try {
      // Get prompt (specific version or active)
      spinner.text = `📝 Loading ${promptName} prompt...`;
      const prompt = versionOverride
        ? await this.manager.getPromptVersion(promptName, versionOverride)
        : await this.manager.getPrompt(promptName);

      // Get version info for tracking
      const templates = await this.manager.listPrompts(true);
      const template = templates.find((t) => t.name === promptName);
      const version = versionOverride || template?.version || 1;

      spinner.text = `🤖 Executing ${stepName} with AI...`;

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

      spinner.succeed(chalk.green(`✅ ${stepName} completed (${executionTime}ms)`));

      if (debugMode) {
        console.log(boxen(
          chalk.cyan(`🔍 ${stepName} Debug Info\n`) +
          chalk.white(`Prompt: ${promptName} v${version}\n`) +
          chalk.white(`Provider: ${process.env.DEFAULT_AI_PROVIDER || "unknown"}\n`) +
          chalk.white(`Time: ${executionTime}ms\n`) +
          chalk.white(`Output: ${typeof cleanedOutput === 'string' ? cleanedOutput.substring(0, 100) + '...' : '[Object]'}`),
          { padding: 1, borderColor: 'yellow', borderStyle: 'round' }
        ));
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
      spinner.fail(chalk.red(`❌ ${stepName} failed (${executionTime}ms)`));


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
   * Display comprehensive test summary with full reading and prompt analysis
   */
  private displayTestSummary(result: FullTestResult): void {
    console.log('\n' + '='.repeat(80));
    
    if (result.success) {
      console.log(chalk.green(figlet.textSync('Success!', { horizontalLayout: 'fitted' })));
    } else {
      console.log(chalk.red(figlet.textSync('Failed!', { horizontalLayout: 'fitted' })));
    }

    // Overall summary
    const summaryBox = boxen(
      (result.success ? chalk.green('✅ TEST PASSED\n') : chalk.red('❌ TEST FAILED\n')) +
      chalk.white(`Question: "${result.question}"\n`) +
      chalk.white(`Total Time: ${this.formatDuration(result.totalTime)}\n`) +
      chalk.white(`Total Tokens: ${result.totalTokens}\n`) +
      chalk.white(`Steps Completed: ${result.steps.filter(s => s.success).length}/${result.steps.length}`) +
      (result.error ? `\n${chalk.red('Error: ' + result.error)}` : ''),
      { 
        padding: 1, 
        borderColor: result.success ? 'green' : 'red', 
        borderStyle: 'double' 
      }
    );
    
    console.log('\n' + summaryBox);

    // Steps table
    const table = new Table({
      head: [
        chalk.cyan('Step'),
        chalk.cyan('Prompt'),
        chalk.cyan('Version'),
        chalk.cyan('Time'),
        chalk.cyan('Status')
      ],
      colWidths: [20, 20, 10, 12, 10]
    });

    result.steps.forEach(step => {
      table.push([
        step.stepName,
        step.promptUsed,
        `v${step.version}`,
        this.formatDuration(step.executionTime),
        step.success ? chalk.green('✅ Pass') : chalk.red('❌ Fail')
      ]);
    });

    console.log('\n📊 Step Details:');
    console.log(table.toString());

    // Display detailed prompt analysis for each step
    console.log('\n' + chalk.cyan(figlet.textSync('Prompt Analysis', { horizontalLayout: 'fitted' })));
    result.steps.forEach((step) => {
      this.displayPromptAnalysis(step);
    });

    // Full reading result display (if successful)
    if (result.success && result.finalResult) {
      this.displayFullReading(result.finalResult, result.question);
    }

    console.log('\n' + '='.repeat(80) + '\n');
  }

  /**
   * Display detailed analysis for each prompt step
   */
  private displayPromptAnalysis(step: TestStepResult): void {
    console.log('\n' + boxen(
      chalk.yellow(`🔍 ${step.stepName} Analysis\n`) +
      chalk.white(`Prompt: ${step.promptUsed} v${step.version}\n`) +
      chalk.white(`Provider: ${step.provider}\n`) +
      chalk.white(`Execution Time: ${this.formatDuration(step.executionTime)}\n`) +
      chalk.white(`Status: ${step.success ? chalk.green('✅ Success') : chalk.red('❌ Failed')}`),
      { padding: 1, borderColor: 'yellow', borderStyle: 'round' }
    ));

    // Display input analysis
    console.log(chalk.blue('\n📝 Input Analysis:'));
    const inputStr = typeof step.input === 'string' ? step.input : JSON.stringify(step.input, null, 2);
    console.log(boxen(
      chalk.white(inputStr.length > 200 ? inputStr.substring(0, 200) + '...' : inputStr),
      { padding: 1, borderColor: 'blue', borderStyle: 'single' }
    ));

    // Display output analysis
    if (step.success && step.output) {
      console.log(chalk.green('\n📤 Output Analysis:'));
      
      // Analyze output based on step type
      if (step.stepName === 'Question Filter') {
        this.analyzeFilterOutput(step.output);
      } else if (step.stepName === 'Question Analysis') {
        this.analyzeAnalysisOutput(step.output);
      } else if (step.stepName === 'Reading Generation') {
        this.analyzeReadingOutput(step.output);
      } else if (step.stepName === 'Card Selection') {
        this.analyzeCardSelection(step.output);
      }
    } else if (step.error) {
      console.log(chalk.red('\n❌ Error Details:'));
      console.log(boxen(
        chalk.red(step.error),
        { padding: 1, borderColor: 'red', borderStyle: 'single' }
      ));
    }
  }

  /**
   * Analyze Question Filter output
   */
  private analyzeFilterOutput(output: any): void {
    try {
      const parsed = typeof output === 'string' ? JSON.parse(output) : output;
      console.log(boxen(
        chalk.white(`Validation Result: ${parsed.isValid ? chalk.green('✅ Valid') : chalk.red('❌ Invalid')}\n`) +
        chalk.white(`Reason: ${parsed.reason || 'N/A'}\n`) +
        chalk.white(`Category: ${parsed.category || 'N/A'}\n`) +
        chalk.white(`Language: ${parsed.language || 'N/A'}`),
        { padding: 1, borderColor: 'green', borderStyle: 'single' }
      ));
    } catch (error) {
      console.log(boxen(
        chalk.yellow('Raw output (parsing failed):\n') + chalk.white(output.toString()),
        { padding: 1, borderColor: 'yellow', borderStyle: 'single' }
      ));
    }
  }

  /**
   * Analyze Question Analysis output
   */
  private analyzeAnalysisOutput(output: any): void {
    try {
      const parsed = typeof output === 'string' ? JSON.parse(output) : output;
      console.log(boxen(
        chalk.white(`Mood: ${parsed.mood || 'N/A'}\n`) +
        chalk.white(`Topic: ${parsed.topic || 'N/A'}\n`) +
        chalk.white(`Time Frame: ${parsed.timeframe || 'N/A'}\n`) +
        chalk.white(`Complexity: ${parsed.complexity || 'N/A'}\n`) +
        chalk.white(`Emotional State: ${parsed.emotional_state || 'N/A'}`),
        { padding: 1, borderColor: 'green', borderStyle: 'single' }
      ));
    } catch (error) {
      console.log(boxen(
        chalk.yellow('Raw output (parsing failed):\n') + chalk.white(output.toString()),
        { padding: 1, borderColor: 'yellow', borderStyle: 'single' }
      ));
    }
  }

  /**
   * Analyze Card Selection output
   */
  private analyzeCardSelection(output: any): void {
    console.log(boxen(
      chalk.white(`Cards Selected: ${output.cardNames?.length || 0}\n`) +
      chalk.white(`Card Names: ${output.cardNames?.join(', ') || 'N/A'}\n`) +
      chalk.white(`Card IDs: ${output.cardIds?.join(', ') || 'N/A'}`),
      { padding: 1, borderColor: 'green', borderStyle: 'single' }
    ));
  }

  /**
   * Analyze Reading Generation output
   */
  private analyzeReadingOutput(output: any): void {
    try {
      const parsed = typeof output === 'string' ? JSON.parse(output) : output;
      
      console.log(boxen(
        chalk.white(`Structure Elements:\n`) +
        chalk.white(`• Header: ${parsed.header ? '✅' : '❌'}\n`) +
        chalk.white(`• Cards Reading: ${parsed.cards_reading?.length || 0} cards\n`) +
        chalk.white(`• Main Reading: ${parsed.reading ? '✅' : '❌'}\n`) +
        chalk.white(`• Suggestions: ${parsed.suggestions?.length || 0} items\n`) +
        chalk.white(`• Final Message: ${parsed.final ? '✅' : '❌'}\n`) +
        chalk.white(`• End Message: ${parsed.end ? '✅' : '❌'}\n`) +
        chalk.white(`• Notice: ${parsed.notice ? '✅' : '❌'}`),
        { padding: 1, borderColor: 'green', borderStyle: 'single' }
      ));

      // Quality metrics
      const wordCount = (parsed.reading || '').split(' ').length;
      const hasAllSections = parsed.header && parsed.reading && parsed.final && parsed.end;
      
      console.log(boxen(
        chalk.cyan('📈 Quality Metrics:\n') +
        chalk.white(`Word Count: ${wordCount}\n`) +
        chalk.white(`Completeness: ${hasAllSections ? chalk.green('Complete') : chalk.red('Incomplete')}\n`) +
        chalk.white(`Card Coverage: ${parsed.cards_reading?.length === 3 ? chalk.green('All 3 cards') : chalk.yellow('Partial')}`),
        { padding: 1, borderColor: 'cyan', borderStyle: 'single' }
      ));

    } catch (error) {
      console.log(boxen(
        chalk.yellow('Raw output (parsing failed):\n') + chalk.white(output.toString().substring(0, 300) + '...'),
        { padding: 1, borderColor: 'yellow', borderStyle: 'single' }
      ));
    }
  }

  /**
   * Display full tarot reading result
   */
  private displayFullReading(finalResult: any, question: string): void {
    console.log('\n' + chalk.cyan(figlet.textSync('Full Reading', { horizontalLayout: 'fitted' })));
    
    try {
      const reading = typeof finalResult === 'string' ? JSON.parse(finalResult) : finalResult;
      
      // Header section
      if (reading.header) {
        console.log('\n' + boxen(
          chalk.magenta('🔮 ' + reading.header),
          { padding: 1, borderColor: 'magenta', borderStyle: 'double' }
        ));
      }

      // Cards reading section
      if (reading.cards_reading && Array.isArray(reading.cards_reading)) {
        console.log('\n' + chalk.yellow('🃏 Individual Card Readings:'));
        reading.cards_reading.forEach((card: any, index: number) => {
          console.log('\n' + boxen(
            chalk.cyan(`Card ${index + 1}: ${card.name || 'Unknown'}\n`) +
            chalk.white(card.meaning || card.description || 'No description'),
            { padding: 1, borderColor: 'cyan', borderStyle: 'round' }
          ));
        });
      }

      // Main reading
      if (reading.reading) {
        console.log('\n' + chalk.green('📖 Main Reading:'));
        console.log(boxen(
          chalk.white(reading.reading),
          { padding: 2, borderColor: 'green', borderStyle: 'double' }
        ));
      }

      // Suggestions
      if (reading.suggestions && Array.isArray(reading.suggestions)) {
        console.log('\n' + chalk.blue('💡 Suggestions:'));
        reading.suggestions.forEach((suggestion: string, index: number) => {
          console.log(chalk.blue(`${index + 1}. `) + chalk.white(suggestion));
        });
      }

      // Final message
      if (reading.final) {
        console.log('\n' + boxen(
          chalk.green('🌟 ' + reading.final),
          { padding: 1, borderColor: 'green', borderStyle: 'round' }
        ));
      }

      // End message
      if (reading.end) {
        console.log('\n' + boxen(
          chalk.gray('✨ ' + reading.end),
          { padding: 1, borderColor: 'gray', borderStyle: 'single' }
        ));
      }

      // Notice
      if (reading.notice) {
        console.log('\n' + boxen(
          chalk.yellow('⚠️  ' + reading.notice),
          { padding: 1, borderColor: 'yellow', borderStyle: 'single' }
        ));
      }

    } catch (error) {
      console.log('\n' + boxen(
        chalk.red('❌ Unable to parse reading result\n') +
        chalk.white('Raw output:\n') +
        chalk.gray(finalResult.toString()),
        { padding: 1, borderColor: 'red', borderStyle: 'single' }
      ));
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
