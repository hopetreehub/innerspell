/**
 * 폰트 로딩 최적화
 */

// 폰트 로딩 상태 관리
export class FontLoadingManager {
  private static loadedFonts = new Set<string>();
  private static loadingPromises = new Map<string, Promise<void>>();

  // 폰트 프리로딩
  static async preloadFont(
    fontFamily: string,
    fontWeight: string = '400',
    fontStyle: string = 'normal'
  ): Promise<void> {
    const fontKey = `${fontFamily}-${fontWeight}-${fontStyle}`;
    
    if (this.loadedFonts.has(fontKey)) {
      return Promise.resolve();
    }

    if (this.loadingPromises.has(fontKey)) {
      return this.loadingPromises.get(fontKey)!;
    }

    const loadingPromise = this.loadFont(fontFamily, fontWeight, fontStyle);
    this.loadingPromises.set(fontKey, loadingPromise);

    try {
      await loadingPromise;
      this.loadedFonts.add(fontKey);
    } finally {
      this.loadingPromises.delete(fontKey);
    }
  }

  private static async loadFont(
    fontFamily: string,
    fontWeight: string,
    fontStyle: string
  ): Promise<void> {
    if (!('fonts' in document)) {
      // Font Loading API를 지원하지 않는 브라우저
      return Promise.resolve();
    }

    try {
      await document.fonts.load(`${fontStyle} ${fontWeight} 1em ${fontFamily}`);
      console.log(`Font loaded: ${fontFamily} ${fontWeight} ${fontStyle}`);
    } catch (error) {
      console.warn(`Failed to load font: ${fontFamily}`, error);
    }
  }

  // 중요한 폰트들 프리로딩
  static async preloadCriticalFonts(): Promise<void> {
    const criticalFonts = [
      { family: 'Inter', weight: '400' },
      { family: 'Inter', weight: '500' },
      { family: 'Inter', weight: '600' },
      { family: 'Pretendard', weight: '400' },
      { family: 'Pretendard', weight: '500' }
    ];

    const preloadPromises = criticalFonts.map(font =>
      this.preloadFont(font.family, font.weight)
    );

    await Promise.allSettled(preloadPromises);
  }

  // 폰트 로딩 상태 확인
  static isFontLoaded(
    fontFamily: string,
    fontWeight: string = '400',
    fontStyle: string = 'normal'
  ): boolean {
    const fontKey = `${fontFamily}-${fontWeight}-${fontStyle}`;
    return this.loadedFonts.has(fontKey);
  }

  // 모든 폰트 로딩 완료 대기
  static async waitForAllFonts(): Promise<void> {
    if ('fonts' in document) {
      await document.fonts.ready;
    }
  }
}

// 폰트 fallback 최적화
export const FONT_STACKS = {
  // 본문용 폰트 스택
  body: [
    'Pretendard',
    '-apple-system',
    'BlinkMacSystemFont',
    'Apple SD Gothic Neo',
    'Malgun Gothic',
    'system-ui',
    'sans-serif'
  ].join(', '),

  // 제목용 폰트 스택
  heading: [
    'Pretendard',
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    'Apple SD Gothic Neo',
    'Malgun Gothic',
    'system-ui',
    'sans-serif'
  ].join(', '),

  // 모노스페이스 폰트 스택
  mono: [
    'JetBrains Mono',
    'Monaco',
    'Consolas',
    'Liberation Mono',
    'Courier New',
    'monospace'
  ].join(', ')
} as const;

// 폰트 디스플레이 전략
export const FONT_DISPLAY_STRATEGIES = {
  // 중요한 텍스트 - swap (즉시 대체 폰트 표시, 웹폰트 로드 시 교체)
  critical: 'swap',
  
  // 일반 텍스트 - optional (네트워크 상태에 따라 결정)
  normal: 'optional',
  
  // 장식용 텍스트 - fallback (잠시 기다렸다가 대체 폰트)
  decorative: 'fallback',
  
  // 블록킹 허용 - block (웹폰트 로드까지 대기)
  blocking: 'block'
} as const;

// CSS에 폰트 최적화 규칙 추가
export function injectFontOptimizationCSS(): void {
  const style = document.createElement('style');
  style.textContent = `
    /* 폰트 로딩 최적화 */
    @font-face {
      font-family: 'Pretendard';
      font-display: swap;
      font-weight: 400;
      src: local('Pretendard Regular'),
           url('/fonts/Pretendard-Regular.woff2') format('woff2'),
           url('/fonts/Pretendard-Regular.woff') format('woff');
    }

    @font-face {
      font-family: 'Pretendard';
      font-display: swap;
      font-weight: 500;
      src: local('Pretendard Medium'),
           url('/fonts/Pretendard-Medium.woff2') format('woff2'),
           url('/fonts/Pretendard-Medium.woff') format('woff');
    }

    @font-face {
      font-family: 'Pretendard';
      font-display: swap;
      font-weight: 600;
      src: local('Pretendard SemiBold'),
           url('/fonts/Pretendard-SemiBold.woff2') format('woff2'),
           url('/fonts/Pretendard-SemiBold.woff') format('woff');
    }

    /* 폰트 로딩 중 레이아웃 시프트 방지 */
    .font-loading {
      font-family: ${FONT_STACKS.body};
      visibility: hidden;
    }

    .font-loaded {
      visibility: visible;
    }

    /* 시스템 폰트 우선 사용 */
    .system-font {
      font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, sans-serif;
    }
  `;
  
  document.head.appendChild(style);
}

// 폰트 로딩 성능 측정
export function measureFontLoadingPerformance(): void {
  if (!('fonts' in document) || !('performance' in window)) return;

  document.fonts.addEventListener('loadingdone', (event) => {
    const loadedFonts = event.fontfaces;
    
    loadedFonts.forEach(fontFace => {
      const loadTime = performance.now();
      console.log(`Font loaded: ${fontFace.family} in ${loadTime.toFixed(2)}ms`);
      
      // 성능 메트릭 전송
      if ('sendBeacon' in navigator) {
        const data = JSON.stringify({
          type: 'font_load',
          family: fontFace.family,
          weight: fontFace.weight,
          style: fontFace.style,
          loadTime,
          timestamp: Date.now()
        });
        
        navigator.sendBeacon('/api/analytics/performance', data);
      }
    });
  });
}

// 폰트 서브셋팅을 위한 유니코드 범위
export const UNICODE_RANGES = {
  // 한글 기본 범위
  korean: 'U+AC00-D7AF, U+1100-11FF, U+3130-318F',
  
  // 영문 기본 범위
  latin: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  
  // 숫자 및 기호
  numbers: 'U+0030-0039, U+002B, U+002D, U+002E, U+0025',
  
  // 자주 사용되는 특수문자
  symbols: 'U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215'
} as const;

// 반응형 폰트 크기 계산
export function calculateResponsiveFontSize(
  baseFontSize: number,
  minFontSize: number = 14,
  maxFontSize: number = 24,
  minViewport: number = 320,
  maxViewport: number = 1200
): string {
  const slope = (maxFontSize - minFontSize) / (maxViewport - minViewport);
  const yAxisIntersection = minFontSize - slope * minViewport;
  
  return `clamp(${minFontSize}px, ${yAxisIntersection}px + ${slope * 100}vw, ${maxFontSize}px)`;
}

// 폰트 로딩 최적화 초기화
export async function initializeFontOptimization(): Promise<void> {
  // CSS 주입
  injectFontOptimizationCSS();
  
  // 성능 측정 시작
  measureFontLoadingPerformance();
  
  // 중요한 폰트들 프리로딩
  await FontLoadingManager.preloadCriticalFonts();
  
  // 모든 폰트 로딩 완료 대기
  await FontLoadingManager.waitForAllFonts();
  
  // body에 폰트 로딩 완료 클래스 추가
  document.body.classList.add('fonts-loaded');
  
  console.log('Font optimization initialized');
}

// 폰트 대체 전략 (FOIT/FOUT 방지)
export function applyFontFallbackStrategy(): void {
  // font-display: swap이 지원되지 않는 경우의 대체 전략
  if (!CSS.supports('font-display', 'swap')) {
    const style = document.createElement('style');
    style.textContent = `
      .font-loading {
        opacity: 0;
        transition: opacity 0.2s ease-in-out;
      }
      
      .font-loaded {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
  }
}

export default FontLoadingManager;