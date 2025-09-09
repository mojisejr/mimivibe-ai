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
  userId: Annotation<string>,
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

    // Get prompt from database
    const manager = getPromptManager();
    const promptContent = await manager.getPrompt('questionFilter', state.userId);
    
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

    if (!state.isValid) {
      return { selectedCards: [] };
    }

    const cardResult = await pickRandomCards();


    return { 
      selectedCards: cardResult.selectedCards,
      cardCount: cardResult.cardCount
    };
  } catch (error) {
    return {
      selectedCards: [],
      error: `Card picker failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

// Node 3: Question Analyzer - Analyzes the question context (using database prompts)
async function questionAnalyzerNode(state: typeof ReadingState.State) {
  try {

    if (!state.isValid || !state.selectedCards?.length) {
      return { questionAnalysis: null };
    }

    // Get prompt from database
    const manager = getPromptManager();
    const promptContent = await manager.getPrompt('questionAnalysis', state.userId);
    
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

    return { questionAnalysis: result };
  } catch (error) {
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

    if (
      !state.isValid ||
      !state.selectedCards?.length ||
      !state.questionAnalysis
    ) {
      return { reading: null };
    }

    // Get prompt from database
    const manager = getPromptManager();
    const promptContent = await manager.getPrompt('readingAgent', state.userId);

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

    return { reading };
  } catch (error) {
    return {
      reading: null,
      error: `Reading agent failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

// Conditional routing function
function shouldContinue(state: typeof ReadingState.State) {
  if (state.error) {
    return "error";
  }
  
  if (!state.isValid) {
    return "invalid";
  }
  
  if (!state.selectedCards?.length) {
    return "error";
  }
  
  if (!state.reading) {
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


    // Handle workflow result
    const result = shouldContinue(finalState);
    
    if (result === "success" && finalState.reading) {
      return finalState.reading;
    } else {
      const errorMessage = finalState.error || "Unknown workflow error";
      throw new Error(errorMessage);
    }

  } catch (error) {
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('timeout')) {
      throw new Error('คำขอใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง');
    }
    
    throw error;
  }
}

// Wrapper function to maintain API compatibility with original workflow
export async function generateTarotReading(question: string, userId?: string) {
  try {
    // Execute the encrypted workflow and capture the final state
    const finalState = await app.invoke({
      question: question.trim(),
      userId: userId || 'anonymous',
      isValid: false,
      validationReason: "",
      selectedCards: [],
      cardCount: 3,
      questionAnalysis: { mood: "", topic: "", period: "" },
      reading: {
        header: "",
        cards_reading: [],
        reading: "",
        suggestions: [],
        next_questions: [],
        final: "",
        end: "",
        notice: "",
      },
      error: "",
    });

    // Check if workflow was successful
    if (finalState.error || !finalState.reading) {
      return {
        error: finalState.error || "Failed to generate reading",
      };
    }

    // Return data in the same format as original workflow
    return {
      reading: finalState.reading,
      questionAnalysis: finalState.questionAnalysis,
      selectedCards: finalState.selectedCards,
    };
  } catch (error) {
    return {
      error: "Failed to generate reading",
    };
  }
}

// Cleanup function for prompt manager
export async function cleanupWorkflow() {
  if (promptManager) {
    await promptManager.cleanup();
    promptManager = null;
  }
}