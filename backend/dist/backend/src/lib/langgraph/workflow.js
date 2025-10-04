"use strict";
/**
 * DEPRECATED: This workflow uses hardcoded prompts and is no longer used in production.
 * Production now uses workflow-with-db.ts which loads encrypted prompts from database.
 * This file is kept for reference only.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadingState = void 0;
exports.createReadingWorkflow = createReadingWorkflow;
exports.generateTarotReading = generateTarotReading;
const langgraph_1 = require("@langchain/langgraph");
const ai_1 = require("@/lib/ai");
const card_picker_1 = require("@/lib/utils/card-picker");
const json_parser_1 = require("@/lib/utils/json-parser");
const prisma_1 = require("@/lib/prisma");
// Define the state interface for the reading workflow
exports.ReadingState = langgraph_1.Annotation.Root({
    question: (langgraph_1.Annotation),
    isValid: (langgraph_1.Annotation),
    validationReason: (langgraph_1.Annotation),
    selectedCards: (langgraph_1.Annotation),
    cardCount: (langgraph_1.Annotation),
    questionAnalysis: (langgraph_1.Annotation),
    reading: (langgraph_1.Annotation),
    error: (langgraph_1.Annotation),
});
// Node 1: Question Filter - Validates if the question is appropriate
async function questionFilterNode(state) {
    try {
        const filterAI = (0, ai_1.createProviderWithPrompt)("DEPRECATED - This workflow no longer used in production");
        const response = await filterAI.invoke([
            { role: "user", content: `Question to validate: "${state.question}"` },
        ]);
        const parsed = (0, json_parser_1.parseAndValidateAIResponse)(response.content, ["isValid"]);
        if (!parsed.success) {
            (0, json_parser_1.logParsingError)("QuestionFilter", response.content, parsed.error || "Unknown error");
            return {
                isValid: false,
                validationReason: "Failed to parse AI response",
                error: "Question validation failed due to parsing error",
            };
        }
        const result = parsed.data;
        return {
            isValid: result.isValid,
            validationReason: result.reason || "",
            error: result.isValid ? "" : result.reason || "Question is invalid",
        };
    }
    catch (error) {
        return {
            isValid: false,
            validationReason: "Failed to validate question",
            error: "Question validation failed",
        };
    }
}
// Node 2: Card Picker - Randomly selects 3-5 cards
async function cardPickerNode(state) {
    try {
        if (!state.isValid) {
            return { error: "Cannot pick cards for invalid question" };
        }
        const cardResult = await (0, card_picker_1.pickRandomCards)();
        return {
            selectedCards: cardResult.selectedCards,
            cardCount: cardResult.cardCount,
        };
    }
    catch (error) {
        return {
            error: "Failed to select cards",
        };
    }
}
// Node 3: Question Analyzer - Analyzes mood, topic, and timeframe
async function questionAnalyzerNode(state) {
    try {
        if (!state.isValid || !state.selectedCards) {
            return { error: "Cannot analyze invalid question or missing cards" };
        }
        const analysisAI = (0, ai_1.createProviderWithPrompt)("DEPRECATED - This workflow no longer used in production");
        const response = await analysisAI.invoke([
            { role: "user", content: `Analyze this question: "${state.question}"` },
        ]);
        const parsed = (0, json_parser_1.parseAndValidateAIResponse)(response.content, ["mood", "topic", "period"]);
        if (!parsed.success) {
            (0, json_parser_1.logParsingError)("QuestionAnalyzer", response.content, parsed.error || "Unknown error");
            return { error: "Failed to parse question analysis response" };
        }
        const analysis = parsed.data;
        return {
            questionAnalysis: {
                mood: analysis.mood,
                topic: analysis.topic,
                period: analysis.period,
            },
        };
    }
    catch (error) {
        return {
            error: "Failed to analyze question",
        };
    }
}
// Node 4: Reading Agent - Generates the final tarot reading
async function readingAgentNode(state) {
    try {
        if (!state.isValid || !state.selectedCards || !state.questionAnalysis) {
            return {
                error: "Cannot generate reading without valid question, cards, and analysis",
            };
        }
        // Fetch full card objects from database
        const cardIds = state.selectedCards.map((card) => card.id);
        const cards = await prisma_1.prisma.card.findMany({
            where: { id: { in: cardIds } },
            select: {
                id: true,
                name: true,
                displayName: true,
                imageUrl: true,
                shortMeaning: true,
                keywords: true,
            },
        });
        // Create cards_reading with position
        const cardsReading = cards.map((card, index) => ({
            id: card.id,
            name: card.name,
            displayName: card.displayName,
            imageUrl: card.imageUrl,
            position: index + 1,
            shortMeaning: card.shortMeaning,
            keywords: card.keywords,
        }));
        const cardContext = (0, card_picker_1.getCardMeaningsContext)(state.selectedCards);
        const prompt = `User Question: "${state.question}"

Question Analysis:
- Mood: ${state.questionAnalysis.mood}
- Topic: ${state.questionAnalysis.topic}
- Period: ${state.questionAnalysis.period}

Selected Cards:
${cardContext}

Create a warm, insightful tarot reading in Thai that addresses the user's question using these specific cards. 

Return JSON with this structure:
{
  "header": "คำทักทายและทวนคำถามอย่างอบอุ่น",
  "reading": "คำทำนายหลักจากไพ่อย่างละเอียด",
  "suggestions": ["คำแนะนำ 1", "คำแนะนำ 2", "คำแนะนำ 3"],
  "next_questions": ["คำถามแนะนำ 1", "คำถามแนะนำ 2", "คำถามแนะนำ 3"],
  "final": "คำสรุปและกำลังใจ",
  "end": "คำปิดท้ายอบอุ่น",
  "notice": "ข้อความแจ้งเตือนเกี่ยวกับการดูดวง"
}

เขียนด้วยภาษาไทยที่อบอุ่น เป็นกันเอง และให้กำลังใจ`;
        // Try with primary provider first
        let parsed;
        let response;
        try {
            const readingAI = (0, ai_1.createProviderWithPrompt)("DEPRECATED - This workflow no longer used in production");
            response = await readingAI.invoke([{ role: "user", content: prompt }]);
            parsed = (0, json_parser_1.parseAndValidateAIResponse)(response.content, [
                "header",
                "reading",
                "suggestions",
                "next_questions",
                "final",
                "end",
                "notice",
            ]);
            if (!parsed.success) {
                (0, json_parser_1.logParsingError)("ReadingAgent", response.content, parsed.error || "Unknown error");
                // Try fallback provider
                const fallbackAI = (0, ai_1.createProviderWithPrompt)("DEPRECATED - This workflow no longer used in production", "gemini");
                response = await fallbackAI.invoke([{ role: "user", content: prompt }]);
                parsed = (0, json_parser_1.parseAndValidateAIResponse)(response.content, [
                    "header",
                    "reading",
                    "suggestions",
                    "next_questions",
                    "final",
                    "end",
                    "notice",
                ]);
                if (!parsed.success) {
                    (0, json_parser_1.logParsingError)("ReadingAgent-Fallback", response.content, parsed.error || "Unknown error");
                    return {
                        error: "Failed to parse reading response from both providers",
                    };
                }
            }
        }
        catch (error) {
            return { error: "Failed to generate reading" };
        }
        const reading = parsed.data;
        return {
            reading: {
                header: reading.header,
                cards_reading: cardsReading, // Include full card objects
                reading: reading.reading,
                suggestions: Array.isArray(reading.suggestions)
                    ? reading.suggestions
                    : [],
                next_questions: Array.isArray(reading.next_questions)
                    ? reading.next_questions
                    : [],
                final: reading.final,
                end: reading.end,
                notice: reading.notice,
            },
        };
    }
    catch (error) {
        return {
            error: "Failed to generate reading",
        };
    }
}
// Conditional edge function to route based on validation result
function shouldContinue(state) {
    if (state.error) {
        return langgraph_1.END;
    }
    if (!state.isValid) {
        return langgraph_1.END;
    }
    return "cardPicker";
}
// Create and configure the workflow graph
function createReadingWorkflow() {
    const workflow = new langgraph_1.StateGraph(exports.ReadingState)
        .addNode("questionFilter", questionFilterNode)
        .addNode("cardPicker", cardPickerNode)
        .addNode("questionAnalyzer", questionAnalyzerNode)
        .addNode("readingAgent", readingAgentNode)
        .addEdge(langgraph_1.START, "questionFilter")
        .addConditionalEdges("questionFilter", shouldContinue, {
        cardPicker: "cardPicker",
        [langgraph_1.END]: langgraph_1.END,
    })
        .addEdge("cardPicker", "questionAnalyzer")
        .addEdge("questionAnalyzer", "readingAgent")
        .addEdge("readingAgent", langgraph_1.END);
    return workflow.compile();
}
// Main function to run the complete reading workflow
async function generateTarotReading(question) {
    try {
        const workflow = createReadingWorkflow();
        const initialState = {
            question: question.trim(),
            isValid: false,
            validationReason: "",
            selectedCards: [],
            cardCount: 0,
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
        };
        // Add timeout handling for Vercel 60s limit - timeout at 55s
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("TIMEOUT")), 55000);
        });
        const workflowPromise = workflow.invoke(initialState);
        const result = (await Promise.race([
            workflowPromise,
            timeoutPromise,
        ]));
        if (result.error) {
            throw new Error(result.error);
        }
        if (!result.isValid) {
            throw new Error(result.validationReason || "Invalid question");
        }
        return {
            questionAnalysis: result.questionAnalysis,
            selectedCards: result.selectedCards,
            cardCount: result.cardCount,
            reading: result.reading,
        };
    }
    catch (error) {
        // Handle timeout error with user-friendly message
        if (error instanceof Error && error.message === "TIMEOUT") {
            throw new Error("Reading timeout - please try again (no credit deducted)");
        }
        throw error;
    }
}
//# sourceMappingURL=workflow.js.map