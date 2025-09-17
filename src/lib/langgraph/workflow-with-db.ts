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
import { PromptManager } from "../prompt-manager";
import { createAIError, createValidationError, APIError } from "../error-handler";
import type { ReadingStructure } from "../../types/reading";

// Helper: extract error message from AI raw output
function extractErrorMessageFromAIOutput(raw: string | unknown): string | null {
  const text = typeof raw === 'string' ? raw : String(raw ?? '');
  try {
    const obj = JSON.parse(text);
    if (obj && typeof obj === 'object') {
      // direct string error
      if (typeof (obj as any).error === 'string') return (obj as any).error;
      // nested error.message
      if ((obj as any).error && typeof (obj as any).error.message === 'string') return (obj as any).error.message;
      // top-level message (non-reading)
      if (typeof (obj as any).message === 'string') return (obj as any).message;
      // array errors
      if (Array.isArray((obj as any).errors) && (obj as any).errors.length) {
        const first = (obj as any).errors[0];
        if (typeof first === 'string') return first;
        if (first && typeof first.message === 'string') return first.message;
      }
    }
  } catch {
    // ignore JSON parse error
  }
  const m1 = text.match(/"error"\s*:\s*"([^"]+)"/i);
  if (m1) return m1[1];
  const m2 = text.match(/"message"\s*:\s*"([^"]+)"/i);
  if (m2) return m2[1];
  return null;
}

// Helper: shorten long content for logging
function snippet(raw: string | unknown, max = 300): string {
  const s = typeof raw === 'string' ? raw : String(raw ?? '');
  return s.length > max ? s.slice(0, max) + '…' : s;
}

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
  console.debug(`[DEBUG] QuestionFilter: start question="${state.question}"`);
  try {
    // Get prompt from database
    const manager = getPromptManager();
    const promptContent = await manager.getPrompt('questionFilter', state.userId);
    console.debug(`[DEBUG] QuestionFilter: prompt length=${promptContent.length}`);

    const filterAI = createProviderWithPrompt(promptContent);

    const response = await filterAI.invoke([
      { role: "user", content: `Question to validate: "${state.question}"` },
    ]);
    console.debug(`[DEBUG] QuestionFilter: response length=${String(response.content).length}`);

    const parsed = parseAndValidateAIResponse<{
      isValid: boolean;
      reason?: string;
    }>(response.content as string, ["isValid"]);

    if (!parsed.success) {
      const aiMsg = extractErrorMessageFromAIOutput(response.content as string);
      console.debug(`[DEBUG] QuestionFilter: parse error=${parsed.error}${aiMsg ? ` | ai_error=${aiMsg}` : ''}`);
      console.debug(`[DEBUG] QuestionFilter: raw snippet=${snippet(response.content)}`);
      logParsingError(
        "QuestionFilter",
        response.content as string,
        parsed.error || "Unknown error"
      );
      
      const validationError = createValidationError(
        "question",
        "Unable to validate question format",
        `/api/readings/ask`
      );
      
      return {
        isValid: false,
        validationReason: validationError.error.message,
        error: `Question filter parsing failed: ${parsed.error}`,
      };
    }

    const result = parsed.data;

    if (!result) {
      console.debug(`[DEBUG] QuestionFilter: parsed data is null/undefined`);
      return {
        isValid: false,
        validationReason: "No data returned from parsing",
      };
    }

    console.debug(`[DEBUG] QuestionFilter: result isValid=${result.isValid} reason="${result.reason || ''}"`);
    return {
      isValid: result.isValid,
      validationReason: result.reason || "",
    };
  } catch (error) {
    console.debug(`[DEBUG] QuestionFilter: exception=${error instanceof Error ? error.message : String(error)}`);
    const aiError = createAIError(
      "generation",
      `/api/readings/ask`,
      error instanceof Error ? error.message : String(error)
    );
    
    return {
      isValid: false,
      validationReason: aiError.error.message,
      error: `Question filter failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

// Node 2: Card Picker - Selects random cards for the reading
async function cardPickerNode(state: typeof ReadingState.State) {
  console.debug(`[DEBUG] CardPicker: start isValid=${state.isValid}`);
  try {
    if (!state.isValid) {
      console.debug(`[DEBUG] CardPicker: skip due to invalid state`);
      return { selectedCards: [] };
    }

    const cardResult = await pickRandomCards();
    console.debug(`[DEBUG] CardPicker: selected=${cardResult.cardCount}`);

    return { 
      selectedCards: cardResult.selectedCards,
      cardCount: cardResult.cardCount
    };
  } catch (error) {
    console.debug(`[DEBUG] CardPicker: exception=${error instanceof Error ? error.message : String(error)}`);
    return {
      selectedCards: [],
      error: `Card picker failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

// Node 3: Question Analyzer - Analyzes the question context (using database prompts)
async function questionAnalyzerNode(state: typeof ReadingState.State) {
  console.debug(`[DEBUG] QuestionAnalyzer: start isValid=${state.isValid} cards=${state.selectedCards?.length || 0}`);
  try {
    if (!state.isValid || !state.selectedCards?.length) {
      console.debug(`[DEBUG] QuestionAnalyzer: skip due to invalid state`);
      return { questionAnalysis: null };
    }

    // Get prompt from database
    const manager = getPromptManager();
    const promptContent = await manager.getPrompt('questionAnalysis', state.userId);
    console.debug(`[DEBUG] QuestionAnalyzer: prompt length=${promptContent.length}`);
    
    const analyzerAI = createProviderWithPrompt(promptContent);

    const response = await analyzerAI.invoke([
      {
        role: "user",
        content: `Question: "${state.question}"`,
      },
    ]);
    console.debug(`[DEBUG] QuestionAnalyzer: response length=${String(response.content).length}`);

    const parsed = parseAndValidateAIResponse<{
      mood: string;
      topic: string;
      period: string;
    }>(response.content as string, ["mood", "topic", "period"]);

    if (!parsed.success) {
      const aiMsg = extractErrorMessageFromAIOutput(response.content as string);
      console.debug(`[DEBUG] QuestionAnalyzer: parse error=${parsed.error}${aiMsg ? ` | ai_error=${aiMsg}` : ''}`);
      console.debug(`[DEBUG] QuestionAnalyzer: raw snippet=${snippet(response.content)}`);
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
    
    if (!result) {
      console.debug(`[DEBUG] QuestionAnalyzer: parsed data is null/undefined`);
      return {
        questionAnalysis: {
          mood: "อยากรู้",
          topic: "ทั่วไป",
          period: "ปัจจุบัน",
        },
      };
    }
    
    console.debug(`[DEBUG] QuestionAnalyzer: result mood="${result.mood}" topic="${result.topic}" period="${result.period}"`);
    return { questionAnalysis: result };
  } catch (error) {
    console.debug(`[DEBUG] QuestionAnalyzer: exception=${error instanceof Error ? error.message : String(error)}`);
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
  console.debug(`[DEBUG] ReadingAgent: start isValid=${state.isValid} cards=${state.selectedCards?.length || 0} analysis=${!!state.questionAnalysis}`);
  try {
    if (
      !state.isValid ||
      !state.selectedCards?.length ||
      !state.questionAnalysis
    ) {
      console.debug(`[DEBUG] ReadingAgent: skip due to invalid state`);
      return { reading: null };
    }

    // Get prompt from database
    const manager = getPromptManager();
    const promptContent = await manager.getPrompt('readingAgent', state.userId);
    console.debug(`[DEBUG] ReadingAgent: prompt length=${promptContent.length}`);

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
    console.debug(`[DEBUG] ReadingAgent: response length=${String(response.content).length}`);
    console.debug(`[DEBUG] ReadingAgent: raw snippet=${snippet(response.content)}`);

    const parsed = parseAndValidateAIResponse<ReadingStructure>(
      response.content as string,
      ["header", "reading", "suggestions", "final", "end", "notice"]
    );

    if (!parsed.success) {
      const aiMsg = extractErrorMessageFromAIOutput(response.content as string);
      console.debug(`[DEBUG] ReadingAgent: parse error=${parsed.error}${aiMsg ? ` | ai_error=${aiMsg}` : ''}`);
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

    const result = parsed.data;
    console.debug(`[DEBUG] ReadingAgent: parsed reading OK`);

    return { reading: result };
  } catch (error) {
    console.debug(`[DEBUG] ReadingAgent: exception=${error instanceof Error ? error.message : String(error)}`);
    return {
      reading: null,
      error: `Reading generation failed: ${error instanceof Error ? error.message : String(error)}`,
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

    // Handle workflow result
    const result = shouldContinue(finalState);
    
    if (result === "success" && finalState.reading) {
      return finalState.reading;
    } else {
      const errorMessage = finalState.error || "Unknown workflow error";
      const aiError = createAIError("generation", "/api/readings/ask", errorMessage);
      throw new APIError(aiError.error.code, aiError.error.details);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('timeout')) {
      const timeoutError = createAIError("timeout", "/api/readings/ask", "คำขอใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง");
      throw new APIError(timeoutError.error.code, timeoutError.error.details);
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

    // Expected rejection: invalid question from QuestionFilter
    if (finalState && finalState.isValid === false) {
      const reason = (finalState.validationReason || 'คำถามไม่เหมาะสม กรุณาปรับข้อความแล้วลองใหม่อีกครั้ง').trim();
      const validationError = createValidationError(
        'question',
        reason,
        '/api/readings/ask'
      );
      return { validationError };
    }

    // Check if workflow was successful
    if (finalState.error || !finalState.reading) {
      const aiError = createAIError("generation", "/api/readings/ask", finalState.error || "Failed to generate reading");
      return {
        error: aiError.error.message,
      };
    }

    // Return data in the same format as original workflow
    return {
      reading: finalState.reading,
      questionAnalysis: finalState.questionAnalysis,
      selectedCards: finalState.selectedCards,
    };
  } catch (error) {
    const aiError = createAIError("generation", "/api/readings/ask", error instanceof Error ? error.message : String(error));
    return {
      error: aiError.error.message,
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