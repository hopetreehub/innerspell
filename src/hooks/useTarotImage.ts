import { useState, useEffect } from 'react';
import { getTarotImagePath, TAROT_IMAGE_CONFIG } from '@/config/tarot-images';

interface UseTarotImageOptions {
  feature: 'encyclopedia' | 'reading';
  cardId?: string;
  isCardBack?: boolean;
  preload?: boolean;
}

interface UseTarotImageReturn {
  imageSrc: string;
  isLoading: boolean;
  error: Error | null;
  preloadImage: () => void;
}

/**
 * Custom hook for managing tarot card images with optimization
 */
export function useTarotImage({
  feature,
  cardId,
  isCardBack = false,
  preload = false,
}: UseTarotImageOptions): UseTarotImageReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Get the appropriate image path
  const imageSrc = cardId 
    ? getTarotImagePath(feature, cardId, isCardBack)
    : TAROT_IMAGE_CONFIG.features[feature].cardBack;
  
  // Preload image function
  const preloadImage = () => {
    if (typeof window === 'undefined') return;
    
    const img = new Image();
    img.src = imageSrc;
    
    setIsLoading(true);
    setError(null);
    
    img.onload = () => {
      setIsLoading(false);
    };
    
    img.onerror = () => {
      setError(new Error(`Failed to load image: ${imageSrc}`));
      setIsLoading(false);
    };
  };
  
  // Auto-preload if requested
  useEffect(() => {
    if (preload) {
      preloadImage();
    }
  }, [imageSrc, preload]);
  
  return {
    imageSrc,
    isLoading,
    error,
    preloadImage,
  };
}

/**
 * Batch preload multiple tarot images
 */
export function preloadTarotImages(
  feature: 'encyclopedia' | 'reading',
  cardIds: string[]
): Promise<void> {
  const promises = cardIds.map(cardId => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.src = getTarotImagePath(feature, cardId);
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to preload: ${cardId}`));
    });
  });
  
  return Promise.all(promises).then(() => undefined);
}