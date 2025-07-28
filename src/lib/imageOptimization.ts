/**
 * 이미지 최적화 관련 유틸리티
 */

// 이미지 형식별 품질 설정
export const IMAGE_QUALITY = {
  webp: 85,
  avif: 80,
  jpeg: 90,
  png: 95
} as const;

// 반응형 이미지 크기 설정
export const RESPONSIVE_SIZES = {
  thumbnail: [150, 300],
  small: [300, 600],
  medium: [600, 1200],
  large: [1200, 2400],
  hero: [1920, 3840]
} as const;

// Next.js Image 컴포넌트용 sizes 속성 생성
export function generateSizes(breakpoints: Record<string, string>): string {
  return Object.entries(breakpoints)
    .map(([mediaQuery, size]) => `${mediaQuery} ${size}`)
    .join(', ');
}

// 공통 sizes 패턴
export const COMMON_SIZES = {
  fullWidth: '100vw',
  halfWidth: '(max-width: 768px) 100vw, 50vw',
  thirdWidth: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quarterWidth: '(max-width: 768px) 50vw, 25vw',
  thumbnail: '(max-width: 768px) 25vw, 150px',
  avatar: '(max-width: 768px) 10vw, 64px',
  hero: '100vw',
  blogCard: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px',
  tarotCard: '(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 200px'
} as const;

// 이미지 URL에서 최적화된 경로 생성
export function getOptimizedImagePath(
  originalPath: string,
  format: 'webp' | 'avif' = 'webp'
): string {
  const pathParts = originalPath.split('/');
  const fileName = pathParts.pop();
  
  if (!fileName) return originalPath;
  
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
  const optimizedFileName = `${nameWithoutExt}.${format}`;
  
  // 최적화된 이미지를 위한 별도 폴더 구조
  const optimizedPath = [...pathParts, format, optimizedFileName].join('/');
  
  return optimizedPath;
}

// 이미지 프리로딩 함수
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

// 중요한 이미지들 프리로딩
export async function preloadCriticalImages(images: string[]): Promise<void> {
  const preloadPromises = images.map(preloadImage);
  
  try {
    await Promise.all(preloadPromises);
    console.log('Critical images preloaded successfully');
  } catch (error) {
    console.warn('Some critical images failed to preload:', error);
  }
}

// 이미지 지연 로딩을 위한 Intersection Observer 설정
export const LAZY_LOADING_CONFIG = {
  rootMargin: '50px 0px',
  threshold: 0.01
} as const;

// 이미지 최적화 체크리스트
export interface ImageOptimizationReport {
  originalSize: number;
  optimizedSize: number;
  format: string;
  compression: number;
  recommendations: string[];
}

// 블러 데이터 URL 생성 (저화질 플레이스홀더)
export function generateBlurDataURL(
  width: number = 10,
  height: number = 10,
  color: string = '#f3f4f6'
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  // 그라데이션 생성
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, adjustBrightness(color, -10));
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL('image/jpeg', 0.1);
}

// 색상 밝기 조절 유틸리티
function adjustBrightness(color: string, amount: number): string {
  const usePound = color[0] === '#';
  const col = usePound ? color.slice(1) : color;
  
  const num = parseInt(col, 16);
  let r = (num >> 16) + amount;
  let g = (num >> 8 & 0x00FF) + amount;
  let b = (num & 0x0000FF) + amount;
  
  r = r > 255 ? 255 : r < 0 ? 0 : r;
  g = g > 255 ? 255 : g < 0 ? 0 : g;
  b = b > 255 ? 255 : b < 0 ? 0 : b;
  
  return (usePound ? '#' : '') + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
}

// 이미지 최적화 메타데이터
export const IMAGE_METADATA = {
  tarotCards: {
    totalImages: 78,
    averageSize: '150KB',
    format: 'PNG',
    optimization: {
      webp: '60% reduction',
      avif: '70% reduction'
    }
  },
  blogImages: {
    averageSize: '300KB',
    format: 'PNG/JPEG',
    optimization: {
      webp: '40% reduction',
      avif: '50% reduction'
    }
  },
  icons: {
    format: 'PNG',
    sizes: ['72x72', '96x96', '128x128', '144x144', '152x152', '192x192', '384x384', '512x512'],
    optimization: 'WebP for better compression'
  }
} as const;

// 성능 메트릭을 위한 이미지 로딩 추적
export function trackImageLoading(imageSrc: string, startTime: number) {
  const loadTime = performance.now() - startTime;
  
  // 성능 API에 메트릭 전송
  if ('sendBeacon' in navigator) {
    const data = JSON.stringify({
      type: 'image_load',
      src: imageSrc,
      loadTime,
      timestamp: Date.now()
    });
    
    navigator.sendBeacon('/api/analytics/performance', data);
  }
  
  console.log(`Image loaded: ${imageSrc} in ${loadTime.toFixed(2)}ms`);
}