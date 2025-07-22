import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { createProviderWithPrompt } from "../ai";
import {
  pickRandomCards,
  formatCardsForWorkflow,
  getCardMeaningsContext,
  SelectedCard,
} from "../utils/card-picker";
import {
  parseAndValidateAIResponse,
  logParsingError,
} from "../utils/json-parser";
import { prisma } from "../prisma";
import { PromptManager } from "../prompt-manager";
import type { CardReading, ReadingStructure } from "../../types/reading";

// Global prompt manager instance
let promptManager: PromptManager | null = null;

// Get or create prompt manager
function getPromptManager(): PromptManager {
  if (!promptManager) {
    promptManager = new PromptManager();
  }
  return promptManager;
}

// Define the state interface for the reading workflow
export const ReadingState = Annotation.Root({
  question: Annotation<string>,
  isValid: Annotation<boolean>,
  validationReason: Annotation<string>,
  selectedCards: Annotation<SelectedCard[]>,
  cardCount: Annotation<number>,
  questionAnalysis: Annotation<{
    mood: string;
    topic: string;
    period: string;
  }>,
  reading: Annotation<ReadingStructure>,
  error: Annotation<string>,
});

// Node 1: Question Filter - Validates if the question is appropriate (using database prompts)
async function questionFilterNode(state: typeof ReadingState.State) {
  try {
    console.log("🔍 Question Filter Node - Processing:", state.question);

    // Get prompt from database
    const manager = getPromptManager();
    const promptContent = await manager.getPrompt('questionFilter');
    
    const filterAI = createProviderWithPrompt(promptContent);

    const response = await filterAI.invoke([
      { role: "user", content: `Question to validate: "${state.question}"` },
    ]);

    const parsed = parseAndValidateAIResponse<{
      isValid: boolean;
      reason?: string;
    }>(response.content as string, ["isValid"]);

    if (!parsed.success) {
      logParsingError(
        "QuestionFilter",
        response.content as string,
        parsed.error || "Unknown error"
      );
      
      return {
        isValid: false,
        validationReason: "Unable to validate question format",
        error: `Question filter parsing failed: ${parsed.error}`,
      };
    }

    const result = parsed.data;
    console.log("✅ Question Filter Result:", result);

    if (!result) {
      return {
        isValid: false,
        validationReason: "No data returned from parsing",
      };
    }

    return {
      isValid: result.isValid,
      validationReason: result.reason || "",
    };
  } catch (error) {
    console.error("❌ Question Filter Node Error:", error);
    return {
      isValid: false,
      validationReason: "System error during validation",
      error: `Question filter failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

// Node 2: Card Picker - Selects random cards for the reading
async function cardPickerNode(state: typeof ReadingState.State) {
  try {
    console.log("🃏 Card Picker Node - Selecting cards");

    if (!state.isValid) {
      console.log("⚠️ Skipping card picking - question not valid");
      return { selectedCards: [] };
    }

    const cardResult = await pickRandomCards();

    console.log(`✅ Selected ${cardResult.selectedCards.length} cards:`, 
      cardResult.selectedCards.map(c => c.displayName));

    return { 
      selectedCards: cardResult.selectedCards,
      cardCount: cardResult.cardCount
    };
  } catch (error) {
    console.error("❌ Card Picker Node Error:", error);
    return {
      selectedCards: [],
      error: `Card picker failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

// Node 3: Question Analyzer - Analyzes the question context (using database prompts)
async function questionAnalyzerNode(state: typeof ReadingState.State) {
  try {
    console.log("📊 Question Analyzer Node - Analyzing question context");

    if (!state.isValid || !state.selectedCards?.length) {
      console.log("⚠️ Skipping analysis - invalid state");
      return { questionAnalysis: null };
    }

    // Get prompt from database
    const manager = getPromptManager();
    const promptContent = await manager.getPrompt('questionAnalysis');
    
    const analyzerAI = createProviderWithPrompt(promptContent);

    const response = await analyzerAI.invoke([
      {
        role: "user",
        content: `Question: "${state.question}"`,
      },
    ]);

    const parsed = parseAndValidateAIResponse<{
      mood: string;
      topic: string;
      period: string;
    }>(response.content as string, ["mood", "topic", "period"]);

    if (!parsed.success) {
      logParsingError(
        "QuestionAnalyzer",
        response.content as string,
        parsed.error || "Unknown error"
      );

      // Provide default analysis to continue workflow
      return {
        questionAnalysis: {
          mood: "อยากรู้",
          topic: "ทั่วไป",
          period: "ปัจจุบัน",
        },
      };
    }

    const result = parsed.data;
    console.log("✅ Question Analysis Result:", result);

    return { questionAnalysis: result };
  } catch (error) {
    console.error("❌ Question Analyzer Node Error:", error);
    return {
      questionAnalysis: {
        mood: "อยากรู้",
        topic: "ทั่วไป", 
        period: "ปัจจุบัน",
      },
      error: `Question analyzer failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

// Node 4: Reading Agent - Generates the complete tarot reading (using database prompts)
async function readingAgentNode(state: typeof ReadingState.State) {
  try {
    console.log("🔮 Reading Agent Node - Generating reading");

    if (
      !state.isValid ||
      !state.selectedCards?.length ||
      !state.questionAnalysis
    ) {
      console.log("⚠️ Skipping reading generation - invalid state");
      return { reading: null };
    }

    // Get prompt from database
    const manager = getPromptManager();
    const promptContent = await manager.getPrompt('readingAgent');

    const readingAI = createProviderWithPrompt(promptContent);

    // Prepare context
    const cardsContext = formatCardsForWorkflow(state.selectedCards);
    const cardMeanings = await getCardMeaningsContext(state.selectedCards);

    const contextPrompt = `
Question: "${state.question}"

Selected Cards (${state.selectedCards.length} cards):
${cardsContext}

Card Meanings Context:
${cardMeanings}

Question Analysis:
- Mood: ${state.questionAnalysis.mood}
- Topic: ${state.questionAnalysis.topic}  
- Period: ${state.questionAnalysis.period}
`;

    console.log("🎯 Reading Context prepared, generating response...");

    const response = await readingAI.invoke([
      { role: "user", content: contextPrompt },
    ]);

    const parsed = parseAndValidateAIResponse<ReadingStructure>(
      response.content as string,
      ["header", "reading", "suggestions", "final", "end", "notice"]
    );

    if (!parsed.success) {
      logParsingError(
        "ReadingAgent", 
        response.content as string,
        parsed.error || "Unknown error"
      );

      return {
        reading: null,
        error: `Reading generation parsing failed: ${parsed.error}`,
      };
    }

    const reading = parsed.data;
    console.log("✅ Reading Generated Successfully");

    return { reading };
  } catch (error) {
    console.error("❌ Reading Agent Node Error:", error);
    return {
      reading: null,
      error: `Reading agent failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

// Conditional routing function
function shouldContinue(state: typeof ReadingState.State) {
  if (state.error) {
    console.log("🛑 Workflow stopped due to error:", state.error);
    return "error";
  }
  
  if (!state.isValid) {
    console.log("🛑 Workflow stopped - question not valid");
    return "invalid";
  }
  
  if (!state.selectedCards?.length) {
    console.log("🛑 Workflow stopped - no cards selected");
    return "error";
  }
  
  if (!state.reading) {
    console.log("🛑 Workflow stopped - no reading generated");
    return "error";
  }
  
  return "success";
}

// Create the workflow graph
const workflow = new StateGraph(ReadingState)
  .addNode("questionFilter", questionFilterNode)
  .addNode("cardPicker", cardPickerNode)
  .addNode("questionAnalyzer", questionAnalyzerNode)
  .addNode("readingAgent", readingAgentNode)
  .addEdge(START, "questionFilter")
  .addEdge("questionFilter", "cardPicker")
  .addEdge("cardPicker", "questionAnalyzer")
  .addEdge("questionAnalyzer", "readingAgent")
  .addEdge("readingAgent", END);

// Compile the workflow
const app = workflow.compile();

// Export the main execution function
export async function executeWorkflowWithDB(
  question: string,
  cardCount: number = 3
): Promise<ReadingStructure> {
  console.log("🚀 Starting Tarot Reading Workflow (Database Prompts)");
  console.log("📝 Question:", question);

  const startTime = Date.now();

  try {
    // Execute the workflow with timeout protection
    const timeoutMs = 55000; // 55 seconds timeout
    
    const workflowPromise = app.invoke({
      question,
      cardCount,
    });

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Workflow timeout after 55 seconds')), timeoutMs)
    );

    const finalState = await Promise.race([workflowPromise, timeoutPromise]) as typeof ReadingState.State;

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log(`⏱️ Workflow completed in ${duration.toFixed(2)} seconds`);

    // Handle workflow result
    const result = shouldContinue(finalState);
    
    if (result === "success" && finalState.reading) {
      console.log("✅ Reading generated successfully");
      return finalState.reading;
    } else {
      const errorMessage = finalState.error || "Unknown workflow error";
      console.error("❌ Workflow failed:", errorMessage);
      throw new Error(errorMessage);
    }

  } catch (error) {
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.error(`❌ Workflow failed after ${duration.toFixed(2)} seconds:`, error instanceof Error ? error.message : String(error));
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('timeout')) {
      throw new Error('คำขอใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง');
    }
    
    throw error;
  }
}

// Cleanup function for prompt manager
export async function cleanupWorkflow() {
  if (promptManager) {
    await promptManager.cleanup();
    promptManager = null;
  }
}