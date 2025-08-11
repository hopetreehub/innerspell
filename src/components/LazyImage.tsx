'use client';

import { OptimizedImage } from './OptimizedImage';
import { useImageLazyLoading } from '@/hooks/useLazyLoading';
import { cn } from '@/lib/utils';
import { ImageProps } from 'next/image';

interface LazyImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape';
  placeholderClassName?: string;
  eagerlLoad?: boolean; // 즉시 로드 여부
}

const aspectRatioClasses = {
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[4/3]'
};

export function LazyImage({
  src,
  alt,
  fallbackSrc,
  aspectRatio,
  className,
  placeholderClassName,
  eagerlLoad = false,
  priority = false,
  ...props
}: LazyImageProps) {
  const { ref, shouldLoad } = useImageLazyLoading<HTMLDivElement>();

  // priority가 true이거나 eagerlLoad가 true면 즉시 로드
  const shouldRenderImage = priority || eagerlLoad || shouldLoad;

  return (
    <div
      ref={ref}
      className={cn(
        'relative overflow-hidden',
        aspectRatio && aspectRatioClasses[aspectRatio],
        className
      )}
    >
      {shouldRenderImage ? (
        <OptimizedImage
          src={src}
          alt={alt}
          fallbackSrc={fallbackSrc}
          aspectRatio={aspectRatio}
          priority={priority}
          className="h-full w-full object-cover"
          {...props}
        />
      ) : (
        // 로딩 전 플레이스홀더
        <div
          className={cn(
            'w-full h-full bg-gradient-to-br from-muted/30 to-muted/10',
            'flex items-center justify-center',
            'animate-pulse',
            placeholderClassName
          )}
        >
          <div className="text-muted-foreground/50">
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

// 타로 카드 지연 로딩 컴포넌트
export function LazyTarotCard({
  cardName,
  isRevealed = false,
  className,
  priority = false,
  ...props
}: {
  cardName: string;
  isRevealed?: boolean;
  className?: string;
  priority?: boolean;
} & Omit<ImageProps, 'src' | 'alt'>) {
  const cardSrc = isRevealed 
    ? `/images/tarot/${cardName}.png`
    : '/images/tarot/back.png';
  
  const webpSrc = isRevealed
    ? `/images/tarot/webp/${cardName}.webp`
    : '/images/tarot/webp/back.webp';

  return (
    <LazyImage
      src={webpSrc}
      fallbackSrc={cardSrc}
      alt={`${cardName} 타로 카드`}
      aspectRatio="portrait"
      className={cn(
        'rounded-xl shadow-lg transition-transform duration-300 hover:scale-105',
        'border border-border/20',
        className
      )}
      priority={priority}
      sizes="(max-width: 768px) 50vw, 20vw"
      {...props}
    />
  );
}

// 블로그 썸네일 지연 로딩 컴포넌트
export function LazyBlogThumbnail({
  src,
  alt,
  className,
  ...props
}: {
  src: string;
  alt: string;
  className?: string;
} & Omit<ImageProps, 'src' | 'alt'>) {
  const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');

  return (
    <LazyImage
      src={webpSrc}
      fallbackSrc={src}
      alt={alt}
      aspectRatio="landscape"
      className={cn(
        'rounded-lg border border-border/20',
        'transition-all duration-300 hover:shadow-md',
        className
      )}
      sizes="(max-width: 768px) 100vw, 50vw"
      {...props}
    />
  );
}

// 아바타 이미지 지연 로딩 컴포넌트 (작은 이미지용)
export function LazyAvatar({
  src,
  alt,
  size = 'md',
  className,
  ...props
}: {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
} & Omit<ImageProps, 'src' | 'alt'>) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <LazyImage
      src={src}
      alt={alt}
      className={cn(
        'rounded-full border-2 border-border/20',
        sizeClasses[size],
        className
      )}
      eagerlLoad={size === 'sm'} // 작은 아바타는 즉시 로드
      sizes="(max-width: 768px) 10vw, 5vw"
      {...props}
    />
  );
}