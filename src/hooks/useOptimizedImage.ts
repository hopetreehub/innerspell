import { useState, useEffect } from 'react';

interface OptimizedImageData {
  src: string;
  srcSet: string;
  sizes: string;
  isOptimized: boolean;
}

/**
 * Hook to get optimized image paths with WebP support
 * Falls back to original image if optimized version doesn't exist
 */
export function useOptimizedImage(
  originalSrc: string,
  sizes?: string
): OptimizedImageData {
  const [imageData, setImageData] = useState<OptimizedImageData>({
    src: originalSrc,
    srcSet: '',
    sizes: sizes || '100vw',
    isOptimized: false,
  });

  useEffect(() => {
    // Check if optimized version exists
    const checkOptimizedImage = async () => {
      // Convert original path to optimized path
      const optimizedPath = originalSrc.replace('/images/', '/images/optimized/');
      const webpPath = optimizedPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      
      // Generate srcSet for different sizes
      const baseName = webpPath.replace(/\.webp$/, '');
      const extension = '.webp';
      
      // Different size suffixes based on image type
      let sizeSuffixes: Array<{ suffix: string; width: number }> = [];
      
      if (originalSrc.includes('/tarot')) {
        sizeSuffixes = [
          { suffix: '-thumb', width: 150 },
          { suffix: '-small', width: 300 },
          { suffix: '-medium', width: 600 },
          { suffix: '-large', width: 1200 },
          { suffix: '', width: 1920 }, // Original size
        ];
      } else {
        sizeSuffixes = [
          { suffix: '-sm', width: 640 },
          { suffix: '-md', width: 1024 },
          { suffix: '-lg', width: 1920 },
          { suffix: '', width: 2400 }, // Original size
        ];
      }
      
      // Build srcSet
      const srcSetParts = sizeSuffixes
        .map(({ suffix, width }) => {
          const path = `${baseName}${suffix}${extension}`;
          return `${path} ${width}w`;
        })
        .filter((_, index) => index < sizeSuffixes.length - 1); // Exclude original for srcSet
      
      const srcSet = srcSetParts.join(', ');
      
      // Check if the WebP version exists by trying to fetch its headers
      try {
        const response = await fetch(webpPath, { method: 'HEAD' });
        if (response.ok) {
          setImageData({
            src: webpPath,
            srcSet,
            sizes: sizes || '(max-width: 640px) 640px, (max-width: 1024px) 1024px, 1920px',
            isOptimized: true,
          });
        }
      } catch {
        // If optimized version doesn't exist, use original
        setImageData({
          src: originalSrc,
          srcSet: '',
          sizes: sizes || '100vw',
          isOptimized: false,
        });
      }
    };

    if (originalSrc) {
      checkOptimizedImage();
    }
  }, [originalSrc, sizes]);

  return imageData;
}

/**
 * Get optimized image path synchronously (for SSR)
 * This doesn't check if the file exists, assumes it does
 */
export function getOptimizedImagePath(originalSrc: string): string {
  const optimizedPath = originalSrc.replace('/images/', '/images/optimized/');
  return optimizedPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
}

/**
 * Generate srcSet for optimized images
 */
export function getOptimizedSrcSet(originalSrc: string): string {
  const optimizedPath = originalSrc.replace('/images/', '/images/optimized/');
  const baseName = optimizedPath.replace(/\.(jpg|jpeg|png)$/i, '');
  
  if (originalSrc.includes('/tarot')) {
    return `
      ${baseName}-thumb.webp 150w,
      ${baseName}-small.webp 300w,
      ${baseName}-medium.webp 600w,
      ${baseName}-large.webp 1200w
    `.trim().replace(/\s+/g, ' ');
  } else {
    return `
      ${baseName}-sm.webp 640w,
      ${baseName}-md.webp 1024w,
      ${baseName}-lg.webp 1920w
    `.trim().replace(/\s+/g, ' ');
  }
}