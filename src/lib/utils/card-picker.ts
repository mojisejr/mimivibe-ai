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
    // Get total number of cards
    const totalCards = await prisma.card.count()
    
    if (totalCards < 5) {
      throw new Error('Insufficient cards in database')
    }

    // Randomly decide how many cards to select (3-5)
    const cardCount = Math.floor(Math.random() * 3) + 3 // 3, 4, or 5 cards

    // Generate unique random card IDs
    const selectedIds = new Set<number>()
    
    while (selectedIds.size < cardCount) {
      const randomId = Math.floor(Math.random() * totalCards) + 1
      selectedIds.add(randomId)
    }

    // Fetch the selected cards
    const cards = await prisma.card.findMany({
      where: {
        id: {
          in: Array.from(selectedIds)
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

    // Add position numbers and shuffle the results
    const selectedCards: SelectedCard[] = cards
      .map((card, index) => ({
        ...card,
        position: index + 1
      }))
      .sort(() => Math.random() - 0.5) // Shuffle to randomize positions

    return {
      selectedCards,
      cardCount
    }
  } catch (error) {
    console.error('Card picker error:', error)
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