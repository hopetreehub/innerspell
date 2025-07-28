'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape';
  showPlaceholder?: boolean;
  blurDataURL?: string;
}

const aspectRatioClasses = {
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[4/3]'
};

export function OptimizedImage({
  src,
  alt,
  fallbackSrc,
  aspectRatio,
  showPlaceholder = true,
  blurDataURL,
  className,
  fill,
  sizes,
  priority = false,
  ...props
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 기본 blur 데이터 URL (최소한의 그레이디언트)
  const defaultBlurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bK';

  const imageSrc = imageError && fallbackSrc ? fallbackSrc : src;

  return (
    <div className={cn(
      'relative overflow-hidden',
      aspectRatio && aspectRatioClasses[aspectRatio],
      className
    )}>
      {/* 로딩 플레이스홀더 */}
      {isLoading && showPlaceholder && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted/20 animate-pulse" />
      )}

      <Image
        src={imageSrc}
        alt={alt}
        fill={fill}
        sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
        placeholder="blur"
        blurDataURL={blurDataURL || defaultBlurDataURL}
        priority={priority}
        quality={85}
        {...props}
      />

      {/* 오류시 대체 컨텐츠 */}
      {imageError && !fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center text-muted-foreground">
            <div className="text-2xl mb-2">🖼️</div>
            <p className="text-sm">이미지를 불러올 수 없습니다</p>
          </div>
        </div>
      )}
    </div>
  );
}

// 타로 카드 전용 최적화 이미지 컴포넌트
export function TarotCardImage({
  cardName,
  className,
  priority = false,
  ...props
}: {
  cardName: string;
  className?: string;
  priority?: boolean;
} & Omit<ImageProps, 'src' | 'alt'>) {
  const src = `/images/tarot/${cardName}.png`;
  const webpSrc = `/images/tarot/webp/${cardName}.webp`;
  
  return (
    <OptimizedImage
      src={webpSrc}
      fallbackSrc={src}
      alt={`${cardName} 타로 카드`}
      aspectRatio="portrait"
      className={cn('rounded-lg shadow-md', className)}
      sizes="(max-width: 768px) 50vw, 25vw"
      priority={priority}
      {...props}
    />
  );
}

// 블로그 이미지 전용 최적화 컴포넌트
export function BlogImage({
  src,
  alt,
  className,
  ...props
}: {
  src: string;
  alt: string;
  className?: string;
} & Omit<ImageProps, 'src' | 'alt'>) {
  // WebP 버전 경로 생성
  const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  
  return (
    <OptimizedImage
      src={webpSrc}
      fallbackSrc={src}
      alt={alt}
      aspectRatio="landscape"
      className={cn('rounded-lg', className)}
      sizes="(max-width: 768px) 100vw, 50vw"
      {...props}
    />
  );
}