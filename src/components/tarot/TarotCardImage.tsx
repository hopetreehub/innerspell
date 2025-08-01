'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { getTarotImagePath, TAROT_IMAGE_CONFIG } from '@/config/tarot-images';
import { Skeleton } from '@/components/ui/skeleton';

interface TarotCardImageProps {
  cardId?: string;
  cardName: string;
  feature: 'encyclopedia' | 'reading';
  isCardBack?: boolean;
  isReversed?: boolean;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Optimized Tarot Card Image Component
 * Handles different image sets for different features with performance optimization
 */
export function TarotCardImage({
  cardId,
  cardName,
  feature,
  isCardBack = false,
  isReversed = false,
  width,
  height,
  priority = false,
  className,
  sizes,
  onLoad,
  onError,
}: TarotCardImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Get the appropriate image source
  const imageSrc = cardId 
    ? getTarotImagePath(feature, cardId, isCardBack)
    : TAROT_IMAGE_CONFIG.features[feature].cardBack;
  
  // Use configured sizes if not provided
  const imageSizes = sizes || TAROT_IMAGE_CONFIG.imageOptimization.sizes[feature];
  
  // Handle image load
  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };
  
  // Handle image error
  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
    
    console.error(`[TarotCardImage] Failed to load image: ${imageSrc}`);
  };
  
  // Fallback to card back on error
  const displaySrc = hasError 
    ? TAROT_IMAGE_CONFIG.features[feature].cardBack 
    : imageSrc;
  
  // Reset error state when card changes
  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
  }, [cardId, feature]);
  
  return (
    <div className={cn('relative overflow-hidden', className)}>
      {isLoading && (
        <Skeleton 
          className="absolute inset-0 z-10" 
          style={{ width, height }}
        />
      )}
      
      <Image
        src={displaySrc}
        alt={isCardBack ? 'Card back' : `${cardName} ${isReversed ? '(Reversed)' : ''}`}
        width={width}
        height={height}
        className={cn(
          'transition-opacity duration-300',
          isLoading && 'opacity-0',
          !isLoading && 'opacity-100',
          isReversed && 'rotate-180',
          className
        )}
        sizes={imageSizes}
        priority={priority}
        onLoad={handleLoad}
        onError={handleError}
        quality={85}
        placeholder="empty"
      />
    </div>
  );
}

/**
 * Batch component for rendering multiple tarot cards with optimization
 */
export function TarotCardGrid({
  cards,
  feature,
  className,
  cardClassName,
}: {
  cards: Array<{ id: string; name: string; isReversed?: boolean }>;
  feature: 'encyclopedia' | 'reading';
  className?: string;
  cardClassName?: string;
}) {
  const priorityCount = TAROT_IMAGE_CONFIG.imageOptimization.priorityCount[feature];
  
  return (
    <div className={cn('grid gap-4', className)}>
      {cards.map((card, index) => (
        <TarotCardImage
          key={`${card.id}-${card.isReversed ? 'rev' : 'upr'}`}
          cardId={card.id}
          cardName={card.name}
          feature={feature}
          isReversed={card.isReversed}
          width={275}
          height={475}
          priority={index < priorityCount}
          className={cardClassName}
        />
      ))}
    </div>
  );
}