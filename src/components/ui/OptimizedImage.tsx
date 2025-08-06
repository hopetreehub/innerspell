'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  fill = false,
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // Generate optimized src with WebP support
  const getOptimizedSrc = (originalSrc: string) => {
    // For external images or if already optimized
    if (originalSrc.startsWith('http') || originalSrc.includes('webp')) {
      return originalSrc;
    }
    
    // Convert to WebP if supported
    if (typeof window !== 'undefined') {
      const canvas = document.createElement('canvas');
      const supportsWebP = canvas.toDataURL('image/webp').indexOf('webp') > -1;
      
      if (supportsWebP && !originalSrc.includes('.svg')) {
        const webpSrc = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        return webpSrc;
      }
    }
    
    return originalSrc;
  };

  // Fallback image placeholder
  const fallbackSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMzMzIi8+CjxwYXRoIGQ9Ik0yMCAyOEMyNC40MTgzIDI4IDI4IDI0LjQxODMgMjggMjBDMjggMTUuNTgxNyAyNC40MTgzIDEyIDIwIDEyQzE1LjU4MTcgMTIgMTIgMTUuNTgxNyAxMiAyMEMxMiAyNC40MTgzIDE1LjU4MTcgMjggMjAgMjhaIiBzdHJva2U9IiM2NjYiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K';

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={fill ? {} : { width, height }}
    >
      {/* Loading skeleton */}
      {isLoading && (
        <div 
          className="absolute inset-0 bg-purple-900/20 animate-pulse flex items-center justify-center"
          style={fill ? {} : { width, height }}
        >
          <svg 
            className="w-8 h-8 text-purple-600/50" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div 
          className="absolute inset-0 bg-purple-900/20 flex items-center justify-center"
          style={fill ? {} : { width, height }}
        >
          <svg 
            className="w-8 h-8 text-red-500/50" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* Actual image */}
      {(isInView || priority) && !hasError && (
        <Image
          src={hasError ? fallbackSrc : getOptimizedSrc(src)}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          priority={priority}
          quality={quality}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          sizes={sizes}
          className={`transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
      )}
    </div>
  );
}

// Pre-defined optimized image variants
export function TarotCardImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={200}
      height={300}
      className={className}
      quality={85}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      sizes="(max-width: 768px) 150px, 200px"
    />
  );
}

export function HeroImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      priority
      quality={90}
      className={className}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
}

export function BlogThumbnail({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={400}
      height={225}
      className={className}
      quality={80}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      sizes="(max-width: 768px) 100vw, 400px"
    />
  );
}