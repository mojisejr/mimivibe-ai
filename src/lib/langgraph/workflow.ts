import { StateGraph, Annotation, START, END } from '@langchain/langgraph'
import { SYSTEM_PROMPTS, createProviderWithPrompt } from '@/lib/ai'
import { pickRandomCards, formatCardsForWorkflow, getCardMeaningsContext, SelectedCard } from '@/lib/utils/card-picker'
import { parseAndValidateAIResponse, logParsingError } from '@/lib/utils/json-parser'
import { prisma } from '@/lib/prisma'
import type { CardReading, ReadingStructure } from '@/types/reading'

// Define the state interface for the reading workflow
export const ReadingState = Annotation.Root({
  question: Annotation<string>,
  isValid: Annotation<boolean>,
  validationReason: Annotation<string>,
  selectedCards: Annotation<SelectedCard[]>,
  cardCount: Annotation<number>,
  questionAnalysis: Annotation<{
    mood: string
    topic: string
    period: string
  }>,
  reading: Annotation<ReadingStructure>,
  error: Annotation<string>
})

// Node 1: Question Filter - Validates if the question is appropriate
async function questionFilterNode(state: typeof ReadingState.State) {
  try {
    console.log('🔍 Question Filter Node - Processing:', state.question)
    
    const filterAI = createProviderWithPrompt(SYSTEM_PROMPTS.questionFilter)
    
    const response = await filterAI.invoke([
      { role: 'user', content: `Question to validate: "${state.question}"` }
    ])
    
    const parsed = parseAndValidateAIResponse<{isValid: boolean; reason?: string}>(
      response.content as string,
      ['isValid']
    )
    
    if (!parsed.success) {
      logParsingError('QuestionFilter', response.content as string, parsed.error || 'Unknown error')
      return {
        isValid: false,
        validationReason: 'Failed to parse AI response',
        error: 'Question validation failed due to parsing error'
      }
    }
    
    const result = parsed.data!
    
    return {
      isValid: result.isValid,
      validationReason: result.reason || '',
      error: result.isValid ? '' : (result.reason || 'Question is invalid')
    }
  } catch (error) {
    console.error('Question filter error:', error)
    return {
      isValid: false,
      validationReason: 'Failed to validate question',
      error: 'Question validation failed'
    }
  }
}

// Node 2: Card Picker - Randomly selects 3-5 cards
async function cardPickerNode(state: typeof ReadingState.State) {
  try {
    console.log('🎴 Card Picker Node - Selecting cards')
    
    if (!state.isValid) {
      return { error: 'Cannot pick cards for invalid question' }
    }
    
    const cardResult = await pickRandomCards()
    
    return {
      selectedCards: cardResult.selectedCards,
      cardCount: cardResult.cardCount
    }
  } catch (error) {
    console.error('Card picker error:', error)
    return {
      error: 'Failed to select cards'
    }
  }
}

// Node 3: Question Analyzer - Analyzes mood, topic, and timeframe
async function questionAnalyzerNode(state: typeof ReadingState.State) {
  try {
    console.log('🔮 Question Analysis Node - Analyzing question')
    
    if (!state.isValid || !state.selectedCards) {
      return { error: 'Cannot analyze invalid question or missing cards' }
    }
    
    const analysisAI = createProviderWithPrompt(SYSTEM_PROMPTS.questionAnalysis)
    
    const response = await analysisAI.invoke([
      { role: 'user', content: `Analyze this question: "${state.question}"` }
    ])
    
    const parsed = parseAndValidateAIResponse<{mood: string; topic: string; period: string}>(
      response.content as string,
      ['mood', 'topic', 'period']
    )
    
    if (!parsed.success) {
      logParsingError('QuestionAnalyzer', response.content as string, parsed.error || 'Unknown error')
      return { error: 'Failed to parse question analysis response' }
    }
    
    const analysis = parsed.data!
    
    return {
      questionAnalysis: {
        mood: analysis.mood,
        topic: analysis.topic,
        period: analysis.period
      }
    }
  } catch (error) {
    console.error('Question analysis error:', error)
    return {
      error: 'Failed to analyze question'
    }
  }
}

// Node 4: Reading Agent - Generates the final tarot reading
async function readingAgentNode(state: typeof ReadingState.State) {
  try {
    console.log('✨ Reading Agent Node - Generating reading')
    
    if (!state.isValid || !state.selectedCards || !state.questionAnalysis) {
      return { error: 'Cannot generate reading without valid question, cards, and analysis' }
    }
    
    // Fetch full card objects from database
    const cardIds = state.selectedCards.map(card => card.id)
    const cards = await prisma.card.findMany({
      where: { id: { in: cardIds } },
      select: {
        id: true,
        name: true,
        displayName: true,
        imageUrl: true,
        shortMeaning: true,
        keywords: true
      }
    })
    
    // Create cards_reading with position
    const cardsReading: CardReading[] = cards.map((card, index) => ({
      id: card.id,
      name: card.name,
      displayName: card.displayName,
      imageUrl: card.imageUrl,
      position: index + 1,
      shortMeaning: card.shortMeaning,
      keywords: card.keywords
    }))
    
    const cardContext = getCardMeaningsContext(state.selectedCards)
    const readingAI = createProviderWithPrompt(SYSTEM_PROMPTS.readingAgent)
    
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

เขียนด้วยภาษาไทยที่อบอุ่น เป็นกันเอง และให้กำลังใจ`

    const response = await readingAI.invoke([
      { role: 'user', content: prompt }
    ])
    
    const parsed = parseAndValidateAIResponse<{
      header: string;
      reading: string;
      suggestions: string[];
      next_questions: string[];
      final: string;
      end: string;
      notice: string;
    }>(
      response.content as string,
      ['header', 'reading', 'suggestions', 'next_questions', 'final', 'end', 'notice']
    )
    
    if (!parsed.success) {
      logParsingError('ReadingAgent', response.content as string, parsed.error || 'Unknown error')
      return { error: 'Failed to parse reading response' }
    }
    
    const reading = parsed.data!
    
    return {
      reading: {
        header: reading.header,
        cards_reading: cardsReading, // Include full card objects
        reading: reading.reading,
        suggestions: Array.isArray(reading.suggestions) ? reading.suggestions : [],
        next_questions: Array.isArray(reading.next_questions) ? reading.next_questions : [],
        final: reading.final,
        end: reading.end,
        notice: reading.notice
      }
    }
  } catch (error) {
    console.error('Reading agent error:', error)
    return {
      error: 'Failed to generate reading'
    }
  }
}

// Conditional edge function to route based on validation result
function shouldContinue(state: typeof ReadingState.State) {
  if (state.error) {
    return END
  }
  if (!state.isValid) {
    return END
  }
  return 'cardPicker'
}

// Create and configure the workflow graph
export function createReadingWorkflow() {
  const workflow = new StateGraph(ReadingState)
    .addNode('questionFilter', questionFilterNode)
    .addNode('cardPicker', cardPickerNode)
    .addNode('questionAnalyzer', questionAnalyzerNode)
    .addNode('readingAgent', readingAgentNode)
    .addEdge(START, 'questionFilter')
    .addConditionalEdges('questionFilter', shouldContinue, {
      cardPicker: 'cardPicker',
      [END]: END
    })
    .addEdge('cardPicker', 'questionAnalyzer')
    .addEdge('questionAnalyzer', 'readingAgent')
    .addEdge('readingAgent', END)

  return workflow.compile()
}

// Main function to run the complete reading workflow
export async function generateTarotReading(question: string) {
  try {
    console.log('🚀 Starting tarot reading workflow for question:', question)
    
    const workflow = createReadingWorkflow()
    
    const initialState = {
      question: question.trim(),
      isValid: false,
      validationReason: '',
      selectedCards: [],
      cardCount: 0,
      questionAnalysis: { mood: '', topic: '', period: '' },
      reading: { header: '', cards_reading: [], reading: '', suggestions: [], next_questions: [], final: '', end: '', notice: '' },
      error: ''
    }
    
    const result = await workflow.invoke(initialState)
    
    if (result.error) {
      throw new Error(result.error)
    }
    
    if (!result.isValid) {
      throw new Error(result.validationReason || 'Invalid question')
    }
    
    console.log('✅ Tarot reading workflow completed successfully')
    
    return {
      questionAnalysis: result.questionAnalysis,
      selectedCards: result.selectedCards,
      cardCount: result.cardCount,
      reading: result.reading
    }
    
  } catch (error) {
    console.error('Workflow execution error:', error)
    throw error
  }
}