import { prisma } from '@/lib/prisma'

export interface SelectedCard {
  id: number
  name: string
  displayName: string
  arcana: string
  shortMeaning: string
  keywords: string | string[]
  imageUrl: string
  position: number
}

export interface CardPickerResult {
  selectedCards: SelectedCard[]
  cardCount: number
}

/**
 * Randomly selects 3-5 tarot cards for a reading
 * Ensures no duplicate cards are selected
 */
export async function pickRandomCards(): Promise<CardPickerResult> {
  try {
    console.log('🎴 Starting card selection process...')
    
    // Get all available card IDs from database
    const availableCards = await prisma.card.findMany({
      select: {
        id: true
      },
      orderBy: {
        id: 'asc'
      }
    })
    
    console.log('🎴 Available card IDs:', availableCards.map(c => c.id))
    console.log('🎴 Total cards in database:', availableCards.length)
    
    if (availableCards.length < 5) {
      throw new Error('Insufficient cards in database')
    }

    // Randomly decide how many cards to select (3-5)
    const cardCount = Math.floor(Math.random() * 3) + 3 // 3, 4, or 5 cards
    console.log('🎴 Selected card count:', cardCount)

    // Shuffle available card IDs using Fisher-Yates algorithm (similar to n8n flow)
    const shuffledCardIds = [...availableCards.map(c => c.id)]
    for (let i = shuffledCardIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffledCardIds[i], shuffledCardIds[j]] = [shuffledCardIds[j], shuffledCardIds[i]]
    }
    
    // Select first N cards from shuffled array
    const selectedIds = shuffledCardIds.slice(0, cardCount)
    console.log('🎴 Selected card IDs:', selectedIds)

    // Fetch the selected cards
    const cards = await prisma.card.findMany({
      where: {
        id: {
          in: selectedIds
        }
      },
      select: {
        id: true,
        name: true,
        displayName: true,
        arcana: true,
        shortMeaning: true,
        keywords: true,
        imageUrl: true
      }
    })

    console.log('🎴 Fetched cards from database:', cards.length, 'cards')
    console.log('🎴 Card details:', cards.map(c => ({ id: c.id, name: c.displayName })))

    // Add position numbers and maintain shuffle order
    const selectedCards: SelectedCard[] = cards
      .map((card, index) => ({
        ...card,
        position: index + 1
      }))

    console.log('🎴 Final selected cards:', selectedCards.length, 'cards')
    console.log('🎴 Final card details:', selectedCards.map(c => ({ id: c.id, name: c.displayName, position: c.position })))

    const result = {
      selectedCards,
      cardCount
    }
    
    console.log('🎴 Card selection completed successfully')
    return result
  } catch (error) {
    console.error('❌ Card picker error:', error)
    throw new Error('Failed to select cards')
  }
}

/**
 * Format selected cards for LangGraph workflow
 */
export function formatCardsForWorkflow(cards: SelectedCard[]): string[] {
  return cards.map(card => 
    `${card.position}. ${card.displayName} (${card.arcana}) - ${card.shortMeaning}`
  )
}

/**
 * Validate card selection results
 */
export function validateCardSelection(result: CardPickerResult): boolean {
  if (!result.selectedCards || result.selectedCards.length === 0) {
    return false
  }

  if (result.cardCount !== result.selectedCards.length) {
    return false
  }

  if (result.cardCount < 3 || result.cardCount > 5) {
    return false
  }

  // Check for duplicates
  const cardIds = result.selectedCards.map(card => card.id)
  const uniqueIds = new Set(cardIds)
  
  return uniqueIds.size === cardIds.length
}

/**
 * Get card meanings for AI context
 */
export function getCardMeaningsContext(cards: SelectedCard[]): string {
  return cards.map(card => {
    const keywords = Array.isArray(card.keywords) 
      ? card.keywords.join(', ')
      : typeof card.keywords === 'string' 
        ? card.keywords 
        : ''
        
    return `Card ${card.position}: ${card.displayName}
- Arcana: ${card.arcana}
- Meaning: ${card.shortMeaning}
- Keywords: ${keywords}`
  }).join('\n\n')
}