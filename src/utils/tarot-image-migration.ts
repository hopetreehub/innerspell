/**
 * Utility to migrate tarot card data to use the new image configuration system
 * This allows seamless switching between different image sets for different features
 */

import { TarotCard } from '@/types/tarot';
import { getTarotImagePath } from '@/config/tarot-images';

/**
 * Updates a tarot card to use the appropriate image based on the feature context
 */
export function updateCardImageForFeature(
  card: TarotCard,
  feature: 'encyclopedia' | 'reading'
): TarotCard {
  // Create a new imageUrl based on the feature
  const updatedImageUrl = getTarotImagePath(feature, card.id, false);
  
  return {
    ...card,
    imageUrl: updatedImageUrl
  };
}

/**
 * Batch update cards for a specific feature
 */
export function updateCardsForFeature(
  cards: TarotCard[],
  feature: 'encyclopedia' | 'reading'
): TarotCard[] {
  return cards.map(card => updateCardImageForFeature(card, feature));
}

/**
 * Get image URL from card data for backwards compatibility
 */
export function getCardImageUrl(
  card: { id: string; imageUrl?: string },
  feature: 'encyclopedia' | 'reading'
): string {
  // If we're in reading mode, convert to the new image path
  if (feature === 'reading') {
    return getTarotImagePath('reading', card.id, false);
  }
  
  // For encyclopedia, use the existing imageUrl or generate from ID
  return card.imageUrl || getTarotImagePath('encyclopedia', card.id, false);
}

/**
 * Preload card images for better performance
 */
export async function preloadCardImages(
  cardIds: string[],
  feature: 'encyclopedia' | 'reading'
): Promise<void> {
  const imagePromises = cardIds.map(cardId => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.src = getTarotImagePath(feature, cardId, false);
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to preload image for card ${cardId}`));
    });
  });
  
  try {
    await Promise.all(imagePromises);
  } catch (error) {
    console.warn('[Image Preload] Some images failed to preload:', error);
  }
}