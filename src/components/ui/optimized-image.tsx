'use client';

import Image from 'next/image';
import { useState, memo } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  fill?: boolean;
}

// 기본 blur 데이터 URL (1x1 투명 이미지)
const defaultBlurDataURL = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPgo=";

const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75,
  placeholder = 'blur',
  blurDataURL = defaultBlurDataURL,
  sizes,
  fill = false,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError(true);
  };

  // 에러 시 기본 이미지
  const fallbackSrc = '/images/placeholder.png';

  // 반응형 크기 설정
  const responsiveSizes = sizes || (
    fill ? '100vw' : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
  );

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
        src={error ? fallbackSrc : src}
        alt={alt}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        fill={fill}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        quality={quality}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        sizes={responsiveSizes}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
      
      {/* 로딩 스켈레톤 */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}
      
      {/* 에러 상태 */}
      {error && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-500 text-sm">이미지 로드 실패</div>
        </div>
      )}
    </div>
  );
});

export { OptimizedImage };