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
  // Enhanced error tracking fields for Phase 1 conditional routing
  workflowError: Annotation<string | null>,
  hasError: Annotation<boolean>,
  errorSource: Annotation<string | null>,
});

// Node 1: Question Filter - Validates if the question is appropriate (using database prompts)
async function questionFilterNode(state: typeof ReadingState.State) {
  try {
    // Input validation
    if (!state.question || state.question.trim().length === 0) {
      return {
        isValid: false,
        validationReason: "Question cannot be empty",
        error: "Empty question provided",
        hasError: true,
        errorSource: "questionFilter",
        workflowError: "Question validation failed: Empty question"
      };
    }

    if (state.question.length > 500) {
      return {
        isValid: false,
        validationReason: "Question is too long (max 500 characters)",
        error: "Question exceeds maximum length",
        hasError: true,
        errorSource: "questionFilter",
        workflowError: "Question validation failed: Question too long"
      };
    }

    // Get prompt from database
    const manager = getPromptManager();
    const promptContent = await manager.getPrompt('questionFilter', state.userId);
    
    if (!promptContent) {
      return {
        isValid: false,
        validationReason: "Unable to load validation prompt",
        error: "Prompt loading failed",
        hasError: true,
        errorSource: "questionFilter",
        workflowError: "Question filter failed: Prompt not available"
      };
    }
    
    const filterAI = createProviderWithPrompt(promptContent);

    const response = await filterAI.invoke([
      { role: "user", content: `Question to validate: "${state.question}"` },
    ]);

    if (!response || !response.content) {
      return {
        isValid: false,
        validationReason: "AI validation service unavailable",
        error: "No response from AI service",
        hasError: true,
        errorSource: "questionFilter",
        workflowError: "Question filter failed: AI service error"
      };
    }

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
        hasError: true,
        errorSource: "questionFilter",
        workflowError: `Question filter parsing error: ${parsed.error}`
      };
    }

    const result = parsed.data;

    if (!result) {
      return {
        isValid: false,
        validationReason: "No data returned from parsing",
        error: "Question filter returned empty result",
        hasError: true,
        errorSource: "questionFilter",
        workflowError: "Question filter failed: Empty result from AI"
      };
    }

    // Success case - clear any previous errors
    return {
      isValid: result.isValid,
      validationReason: result.reason || "",
      hasError: false,
      errorSource: null,
      workflowError: null
    };
  } catch (error) {
    return {
      isValid: false,
      validationReason: "System error during validation",
      error: `Question filter failed: ${error instanceof Error ? error.message : String(error)}`,
      hasError: true,
      errorSource: "questionFilter",
      workflowError: `Question filter system error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

// Node 2: Card Picker - Selects random cards for the reading
async function cardPickerNode(state: typeof ReadingState.State) {
  try {
    // Check if previous step failed
    if (!state.isValid) {
      return { 
        selectedCards: [],
        hasError: true,
        errorSource: "cardPicker",
        workflowError: "Card picker skipped: Question validation failed"
      };
    }

    // Validate card count parameter
    const requestedCardCount = state.cardCount || 3;
    if (requestedCardCount < 1 || requestedCardCount > 10) {
      return {
        selectedCards: [],
        error: "Invalid card count requested",
        hasError: true,
        errorSource: "cardPicker",
        workflowError: `Card picker failed: Invalid card count ${requestedCardCount}`
      };
    }

    const cardResult = await pickRandomCards();

    // Validate card selection result
    if (!cardResult || !cardResult.selectedCards || cardResult.selectedCards.length === 0) {
      return {
        selectedCards: [],
        error: "Failed to select cards",
        hasError: true,
        errorSource: "cardPicker",
        workflowError: "Card picker failed: No cards selected"
      };
    }

    // Validate card data integrity
     const invalidCards = cardResult.selectedCards.filter(card => 
       !card || !card.id || !card.name || !card.shortMeaning || !card.displayName
     );

    if (invalidCards.length > 0) {
      return {
        selectedCards: [],
        error: "Invalid card data received",
        hasError: true,
        errorSource: "cardPicker",
        workflowError: `Card picker failed: ${invalidCards.length} cards have invalid data`
      };
    }

    // Success case - clear any previous errors
    return { 
      selectedCards: cardResult.selectedCards,
      cardCount: cardResult.cardCount,
      hasError: false,
      errorSource: null,
      workflowError: null
    };
  } catch (error) {
    return {
      selectedCards: [],
      error: `Card picker failed: ${error instanceof Error ? error.message : String(error)}`,
      hasError: true,
      errorSource: "cardPicker",
      workflowError: `Card picker system error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

// Node 3: Question Analyzer - Analyzes the question context (using database prompts)
async function questionAnalyzerNode(state: typeof ReadingState.State) {
  try {
    // Check if previous step failed
    if (state.hasError) {
      return {
        questionAnalysis: null,
        hasError: true,
        errorSource: state.errorSource,
        workflowError: state.workflowError
      };
    }

    // Validate prerequisites
    if (!state.isValid) {
      return {
        questionAnalysis: null,
        hasError: true,
        errorSource: "questionAnalyzer",
        workflowError: "Cannot analyze question: question validation failed"
      };
    }

    if (!state.selectedCards?.length) {
      return {
        questionAnalysis: null,
        hasError: true,
        errorSource: "questionAnalyzer",
        workflowError: "Cannot analyze question: no cards selected"
      };
    }

    if (!state.question?.trim()) {
      return {
        questionAnalysis: null,
        hasError: true,
        errorSource: "questionAnalyzer",
        workflowError: "Cannot analyze question: empty question"
      };
    }

    // Get prompt from database
    const manager = getPromptManager();
    let promptContent: string;
    
    try {
      promptContent = await manager.getPrompt('questionAnalysis', state.userId);
    } catch (error) {
      return {
        questionAnalysis: null,
        hasError: true,
        errorSource: "questionAnalyzer",
        workflowError: `Failed to load analysis prompt: ${error instanceof Error ? error.message : String(error)}`
      };
    }

    if (!promptContent?.trim()) {
      return {
        questionAnalysis: null,
        hasError: true,
        errorSource: "questionAnalyzer",
        workflowError: "Analysis prompt is empty or invalid"
      };
    }
    
    const analyzerAI = createProviderWithPrompt(promptContent);

    const response = await analyzerAI.invoke([
      {
        role: "user",
        content: `Question: "${state.question}"`,
      },
    ]);

    // Validate AI response
    if (!response?.content) {
      return {
        questionAnalysis: null,
        hasError: true,
        errorSource: "questionAnalyzer",
        workflowError: "AI provider returned empty response"
      };
    }

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
        hasError: false,
        errorSource: null,
        workflowError: null
      };
    }

    const result = parsed.data;

    // Validate analysis result
    if (!result || !result.mood?.trim() || !result.topic?.trim() || !result.period?.trim()) {
      return {
        questionAnalysis: {
          mood: "อยากรู้",
          topic: "ทั่วไป",
          period: "ปัจจุบัน",
        },
        hasError: false,
        errorSource: null,
        workflowError: null
      };
    }

    return { 
      questionAnalysis: result,
      hasError: false,
      errorSource: null,
      workflowError: null
    };
  } catch (error) {
    return {
      questionAnalysis: {
        mood: "อยากรู้",
        topic: "ทั่วไป", 
        period: "ปัจจุบัน",
      },
      error: `Question analyzer failed: ${error instanceof Error ? error.message : String(error)}`,
      hasError: true,
      errorSource: "questionAnalyzer",
      workflowError: `Question analyzer system error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

// Node 4: Reading Agent - Generates the complete tarot reading (using database prompts)
async function readingAgentNode(state: typeof ReadingState.State) {
  try {
    // Check if previous step failed
    if (state.hasError) {
      return {
        reading: null,
        hasError: true,
        errorSource: state.errorSource,
        workflowError: state.workflowError
      };
    }

    // Validate prerequisites
    if (!state.isValid) {
      return {
        reading: null,
        hasError: true,
        errorSource: "readingAgent",
        workflowError: "Cannot generate reading: question validation failed"
      };
    }

    if (!state.selectedCards?.length) {
      return {
        reading: null,
        hasError: true,
        errorSource: "readingAgent",
        workflowError: "Cannot generate reading: no cards selected"
      };
    }

    if (!state.questionAnalysis) {
      return {
        reading: null,
        hasError: true,
        errorSource: "readingAgent",
        workflowError: "Cannot generate reading: question analysis missing"
      };
    }

    if (!state.question?.trim()) {
      return {
        reading: null,
        hasError: true,
        errorSource: "readingAgent",
        workflowError: "Cannot generate reading: empty question"
      };
    }

    // Get prompt from database
    const manager = getPromptManager();
    let promptContent: string;
    
    try {
      promptContent = await manager.getPrompt('readingAgent', state.userId);
    } catch (error) {
      return {
        reading: null,
        hasError: true,
        errorSource: "readingAgent",
        workflowError: `Failed to load reading prompt: ${error instanceof Error ? error.message : String(error)}`
      };
    }

    if (!promptContent?.trim()) {
      return {
        reading: null,
        hasError: true,
        errorSource: "readingAgent",
        workflowError: "Reading prompt is empty or invalid"
      };
    }

    const readingAI = createProviderWithPrompt(promptContent);

    // Prepare context with validation
    let cardsContext: string;
    let cardMeanings: string;
    
    try {
      const cardsArray = formatCardsForWorkflow(state.selectedCards);
      cardsContext = cardsArray.join('\n');
      cardMeanings = await getCardMeaningsContext(state.selectedCards);
    } catch (error) {
      return {
        reading: null,
        hasError: true,
        errorSource: "readingAgent",
        workflowError: `Failed to prepare card context: ${error instanceof Error ? error.message : String(error)}`
      };
    }

    if (!cardsContext?.trim() || !cardMeanings?.trim()) {
      return {
        reading: null,
        hasError: true,
        errorSource: "readingAgent",
        workflowError: "Card context or meanings are empty"
      };
    }

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

    // Validate AI response
    if (!response?.content) {
      return {
        reading: null,
        hasError: true,
        errorSource: "readingAgent",
        workflowError: "AI provider returned empty response"
      };
    }

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
        hasError: true,
        errorSource: "readingAgent",
        workflowError: `Failed to parse reading response: ${parsed.error}`
      };
    }

    const reading = parsed.data;

    // Validate reading structure
    if (!reading || !reading.header || !reading.reading || !reading.final) {
      return {
        reading: null,
        hasError: true,
        errorSource: "readingAgent",
        workflowError: "Generated reading is missing required fields"
      };
    }

    return { 
      reading,
      hasError: false,
      errorSource: null,
      workflowError: null
    };
  } catch (error) {
    return {
      reading: null,
      error: `Reading agent failed: ${error instanceof Error ? error.message : String(error)}`,
      hasError: true,
      errorSource: "readingAgent",
      workflowError: `Reading agent system error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

// Error handler node to consolidate and process all workflow errors
async function errorHandlerNode(state: typeof ReadingState.State) {
  try {
    // Collect all possible error sources
    const errors: string[] = [];
    
    // Check for validation errors
    if (!state.isValid && state.validationReason) {
      errors.push(`Validation Error: ${state.validationReason}`);
    }
    
    // Check for card selection errors
    if (!state.selectedCards || state.selectedCards.length === 0) {
      errors.push("Card Selection Error: No cards were selected");
    }
    
    // Check for question analysis errors
    if (!state.questionAnalysis || !state.questionAnalysis.mood || !state.questionAnalysis.topic) {
      errors.push("Question Analysis Error: Failed to analyze question properly");
    }
    
    // Check for reading generation errors
    if (!state.reading || !state.reading.reading) {
      errors.push("Reading Generation Error: Failed to generate reading content");
    }
    
    // Check for existing workflow errors
    if (state.workflowError) {
      errors.push(`Workflow Error: ${state.workflowError}`);
    }
    
    // Check for general errors
    if (state.error) {
      errors.push(`General Error: ${state.error}`);
    }
    
    // Consolidate all errors
    const consolidatedError = errors.length > 0 ? errors.join("; ") : null;
    
    return {
      ...state,
      hasError: errors.length > 0,
      workflowError: consolidatedError,
      errorSource: errors.length > 0 ? "errorHandler" : null,
      error: consolidatedError || state.error,
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      ...state,
      hasError: true,
      workflowError: `Error Handler Failed: ${errorMessage}`,
      errorSource: "errorHandler",
      error: errorMessage,
    };
  }
}

// Enhanced conditional routing function with comprehensive error detection
function shouldContinue(state: typeof ReadingState.State) {
  // Check for existing error flags first
  if (state.hasError || state.workflowError) {
    return "error";
  }

  // Check for general errors
  if (state.error) {
    return "error";
  }

  // Check question validation (questionFilterNode)
  if (state.isValid === false || state.validationReason) {
    return "error";
  }

  // Check card selection (cardPickerNode)
  if (state.cardCount && (!state.selectedCards || state.selectedCards.length === 0)) {
    return "error";
  }

  // Check question analysis (questionAnalyzerNode)
  if (state.selectedCards && state.selectedCards.length > 0) {
    if (!state.questionAnalysis || 
        !state.questionAnalysis.mood || 
        !state.questionAnalysis.topic || 
        !state.questionAnalysis.period) {
      return "error";
    }
  }

  // Check reading generation (readingAgentNode)
  if (state.questionAnalysis && 
      state.questionAnalysis.mood && 
      state.questionAnalysis.topic && 
      state.questionAnalysis.period) {
    if (!state.reading || 
        !state.reading.header || 
        !state.reading.reading || 
        !state.reading.final || 
        !state.reading.end) {
      return "error";
    }
  }

  // Success condition - all required data is present
  if (state.reading && 
      state.reading.header && 
      state.reading.reading && 
      state.reading.final && 
      state.reading.end &&
      state.selectedCards && 
      state.selectedCards.length > 0 &&
      state.questionAnalysis &&
      state.questionAnalysis.mood &&
      state.questionAnalysis.topic &&
      state.questionAnalysis.period) {
    return "success";
  }

  // Default to continue if no errors detected and workflow is in progress
  return "continue";
}

// Create the workflow graph with conditional routing
const workflow = new StateGraph(ReadingState)
  .addNode("questionFilter", questionFilterNode)
  .addNode("cardPicker", cardPickerNode)
  .addNode("questionAnalyzer", questionAnalyzerNode)
  .addNode("readingAgent", readingAgentNode)
  .addNode("errorHandler", errorHandlerNode)
  .addEdge(START, "questionFilter")
  .addConditionalEdges("questionFilter", shouldContinue, {
    continue: "cardPicker",
    error: "errorHandler",
    success: END
  })
  .addConditionalEdges("cardPicker", shouldContinue, {
    continue: "questionAnalyzer",
    error: "errorHandler",
    success: END
  })
  .addConditionalEdges("questionAnalyzer", shouldContinue, {
    continue: "readingAgent",
    error: "errorHandler",
    success: END
  })
  .addConditionalEdges("readingAgent", shouldContinue, {
    continue: END,
    error: "errorHandler",
    success: END
  })
  .addEdge("errorHandler", END);

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