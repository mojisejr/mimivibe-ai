export interface SelectedCard {
    id: number;
    name: string;
    displayName: string;
    arcana: string;
    shortMeaning: string;
    keywords: string | string[];
    imageUrl: string;
    position: number;
}
export interface CardPickerResult {
    selectedCards: SelectedCard[];
    cardCount: number;
}
/**
 * Randomly selects 3-5 tarot cards for a reading
 * Ensures no duplicate cards are selected
 */
export declare function pickRandomCards(): Promise<CardPickerResult>;
/**
 * Format selected cards for LangGraph workflow
 */
export declare function formatCardsForWorkflow(cards: SelectedCard[]): string[];
/**
 * Validate card selection results
 */
export declare function validateCardSelection(result: CardPickerResult): boolean;
/**
 * Get card meanings for AI context
 */
export declare function getCardMeaningsContext(cards: SelectedCard[]): string;
//# sourceMappingURL=card-picker.d.ts.map