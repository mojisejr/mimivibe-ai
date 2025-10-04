"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickRandomCards = pickRandomCards;
exports.formatCardsForWorkflow = formatCardsForWorkflow;
exports.validateCardSelection = validateCardSelection;
exports.getCardMeaningsContext = getCardMeaningsContext;
const prisma_1 = require("@/lib/prisma");
/**
 * Randomly selects 3-5 tarot cards for a reading
 * Ensures no duplicate cards are selected
 */
async function pickRandomCards() {
    try {
        // Get all available card IDs from database
        const availableCards = await prisma_1.prisma.card.findMany({
            select: {
                id: true,
            },
            orderBy: {
                id: "asc",
            },
        });
        if (availableCards.length < 5) {
            throw new Error("Insufficient cards in database");
        }
        // Randomly decide how many cards to select (3-5)
        // const cardCount = Math.floor(Math.random() * 3) + 3 // 3, 4, or 5 cards
        const cardCount = Math.random() < 0.5 ? 3 : 5;
        // Shuffle available card IDs using Fisher-Yates algorithm (similar to n8n flow)
        const shuffledCardIds = [...availableCards.map((c) => c.id)];
        for (let i = shuffledCardIds.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledCardIds[i], shuffledCardIds[j]] = [
                shuffledCardIds[j],
                shuffledCardIds[i],
            ];
        }
        // Select first N cards from shuffled array
        const selectedIds = shuffledCardIds.slice(0, cardCount);
        // Fetch the selected cards
        const cards = await prisma_1.prisma.card.findMany({
            where: {
                id: {
                    in: selectedIds,
                },
            },
            select: {
                id: true,
                name: true,
                displayName: true,
                arcana: true,
                shortMeaning: true,
                keywords: true,
                imageUrl: true,
            },
        });
        // Add position numbers and maintain shuffle order
        const selectedCards = cards.map((card, index) => ({
            ...card,
            position: index + 1,
        }));
        const result = {
            selectedCards,
            cardCount,
        };
        return result;
    }
    catch (error) {
        throw new Error("Failed to select cards");
    }
}
/**
 * Format selected cards for LangGraph workflow
 */
function formatCardsForWorkflow(cards) {
    return cards.map((card) => `${card.position}. ${card.displayName} (${card.arcana}) - ${card.shortMeaning}`);
}
/**
 * Validate card selection results
 */
function validateCardSelection(result) {
    if (!result.selectedCards || result.selectedCards.length === 0) {
        return false;
    }
    if (result.cardCount !== result.selectedCards.length) {
        return false;
    }
    if (result.cardCount < 3 || result.cardCount > 5) {
        return false;
    }
    // Check for duplicates
    const cardIds = result.selectedCards.map((card) => card.id);
    const uniqueIds = new Set(cardIds);
    return uniqueIds.size === cardIds.length;
}
/**
 * Get card meanings for AI context
 */
function getCardMeaningsContext(cards) {
    return cards
        .map((card) => {
        const keywords = Array.isArray(card.keywords)
            ? card.keywords.join(", ")
            : typeof card.keywords === "string"
                ? card.keywords
                : "";
        return `Card ${card.position}: ${card.displayName}
- Arcana: ${card.arcana}
- Meaning: ${card.shortMeaning}
- Keywords: ${keywords}`;
    })
        .join("\n\n");
}
//# sourceMappingURL=card-picker.js.map