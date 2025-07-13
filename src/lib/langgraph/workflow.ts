import { StateGraph, Annotation, START, END } from '@langchain/langgraph'
import { geminiAI, SYSTEM_PROMPTS, createGeminiWithPrompt } from '@/lib/ai/gemini'
import { pickRandomCards, formatCardsForWorkflow, getCardMeaningsContext, SelectedCard } from '@/lib/utils/card-picker'

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
  reading: Annotation<{
    header: string
    reading: string
    suggestions: string[]
    final: string[]
    end: string
    notice: string
  }>,
  error: Annotation<string>
})

// Node 1: Question Filter - Validates if the question is appropriate
async function questionFilterNode(state: typeof ReadingState.State) {
  try {
    console.log('🔍 Question Filter Node - Processing:', state.question)
    
    const filterAI = createGeminiWithPrompt(SYSTEM_PROMPTS.questionFilter)
    
    const response = await filterAI.invoke([
      { role: 'user', content: `Question to validate: "${state.question}"` }
    ])
    
    const result = JSON.parse(response.content as string)
    
    return {
      isValid: result.isValid,
      validationReason: result.reason || '',
      error: result.isValid ? '' : result.reason
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

// Node 3: Question Analysis - Analyzes mood, topic, and timeframe
async function questionAnalysisNode(state: typeof ReadingState.State) {
  try {
    console.log('🔮 Question Analysis Node - Analyzing question')
    
    if (!state.isValid || !state.selectedCards) {
      return { error: 'Cannot analyze invalid question or missing cards' }
    }
    
    const analysisAI = createGeminiWithPrompt(SYSTEM_PROMPTS.questionAnalysis)
    
    const response = await analysisAI.invoke([
      { role: 'user', content: `Analyze this question: "${state.question}"` }
    ])
    
    const analysis = JSON.parse(response.content as string)
    
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
    
    const cardContext = getCardMeaningsContext(state.selectedCards)
    const cardList = formatCardsForWorkflow(state.selectedCards)
    
    const readingAI = createGeminiWithPrompt(SYSTEM_PROMPTS.readingAgent)
    
    const prompt = `User Question: "${state.question}"

Question Analysis:
- Mood: ${state.questionAnalysis.mood}
- Topic: ${state.questionAnalysis.topic}
- Period: ${state.questionAnalysis.period}

Selected Cards:
${cardContext}

Create a warm, insightful tarot reading in Thai that addresses the user's question using these specific cards. Follow the exact JSON format specified in your instructions.`

    const response = await readingAI.invoke([
      { role: 'user', content: prompt }
    ])
    
    const reading = JSON.parse(response.content as string)
    
    return {
      reading: {
        header: reading.header,
        reading: reading.reading,
        suggestions: reading.suggestions,
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
    .addNode('questionAnalysis', questionAnalysisNode)
    .addNode('readingAgent', readingAgentNode)
    .addEdge(START, 'questionFilter')
    .addConditionalEdges('questionFilter', shouldContinue, {
      cardPicker: 'cardPicker',
      [END]: END
    })
    .addEdge('cardPicker', 'questionAnalysis')
    .addEdge('questionAnalysis', 'readingAgent')
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
      reading: { header: '', reading: '', suggestions: [], final: [], end: '', notice: '' },
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