/**
 * 동적 임포트 및 코드 스플리팅 유틸리티
 */

// 라이브러리 동적 임포트 타입 정의
type ImportFunction<T = any> = () => Promise<{ default: T }>;
type ImportedModule<T = any> = Promise<{ default: T }>;

// 무거운 라이브러리들의 동적 임포트
export const dynamicImports = {
  // AI 관련 라이브러리들
  openai: (): ImportedModule => import('openai'),
  googleGenerativeAI: (): ImportedModule => import('@google/generative-ai'),
  
  // 차트 라이브러리
  recharts: (): ImportedModule => import('recharts'),
  
  // 폼 라이브러리
  reactHookForm: (): ImportedModule => import('react-hook-form'),
  
  // 애니메이션 라이브러리
  framerMotion: (): ImportedModule => import('framer-motion'),
  
  // 날짜 라이브러리
  dateFns: (): ImportedModule => import('date-fns'),
  
  // 마크다운 라이브러리
  reactMarkdown: (): ImportedModule => import('react-markdown'),
  
  // 이미지 처리
  imageCompression: (): ImportedModule => import('browser-image-compression')
} as const;

// 컴포넌트 동적 임포트
export const dynamicComponents = {
  // 관리자 컴포넌트들
  admin: {
    usageStatsCharts: () => import('@/components/admin/UsageStatsCharts'),
    realTimeMonitoring: () => import('@/components/admin/RealTimeMonitoringDashboard'),
    tarotGuidelines: () => import('@/components/admin/TarotGuidelineManagement'),
    aiProviders: () => import('@/components/admin/AIProviderManagement'),
    blogManagement: () => import('@/components/admin/BlogManagement'),
    userManagement: () => import('@/components/admin/UserManagement'),
    aiPromptConfig: () => import('@/components/admin/AIPromptConfigForm'),
    dreamConfig: () => import('@/components/admin/DreamInterpretationConfigForm')
  },
  
  // 사용자 컴포넌트들
  user: {
    // tarotReading: () => import('@/components/TarotReading'), // TODO: 구현 필요
    // dreamInterpretation: () => import('@/components/DreamInterpretation'), // TODO: 구현 필요
    // blogPost: () => import('@/components/BlogPost'), // TODO: 구현 필요
    // profileSettings: () => import('@/components/ProfileSettings') // TODO: 구현 필요
  },
  
  // UI 컴포넌트들
  ui: {
    // calendar: () => import('@/components/ui/calendar'), // TODO: 구현 필요
    // colorPicker: () => import('@/components/ui/color-picker'), // TODO: 구현 필요
    // fileUpload: () => import('@/components/ui/file-upload'), // TODO: 구현 필요
    // richTextEditor: () => import('@/components/ui/rich-text-editor') // TODO: 구현 필요
  }
} as const;

// 동적 임포트 헬퍼 함수들
export class DynamicImportManager {
  private static cache = new Map<string, any>();
  private static loadingPromises = new Map<string, Promise<any>>();

  // 캐시된 임포트
  static async importWithCache<T = any>(
    key: string, 
    importFn: ImportFunction<T>
  ): Promise<T> {
    // 이미 캐시된 경우 반환
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    // 이미 로딩 중인 경우 기존 Promise 반환
    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key);
    }

    // 새로운 임포트 시작
    const importPromise = importFn().then(module => {
      const result = module.default;
      this.cache.set(key, result);
      this.loadingPromises.delete(key);
      return result;
    }).catch(error => {
      this.loadingPromises.delete(key);
      throw error;
    });

    this.loadingPromises.set(key, importPromise);
    return importPromise;
  }

  // 프리로딩 (사용자가 필요하기 전에 미리 로드)
  static preload<T = any>(key: string, importFn: ImportFunction<T>): void {
    if (!this.cache.has(key) && !this.loadingPromises.has(key)) {
      this.importWithCache(key, importFn).catch(error => {
        console.warn(`Failed to preload ${key}:`, error);
      });
    }
  }

  // 캐시 클리어
  static clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
      this.loadingPromises.delete(key);
    } else {
      this.cache.clear();
      this.loadingPromises.clear();
    }
  }

  // 메모리 사용량 체크
  static getCacheStats() {
    return {
      cachedModules: this.cache.size,
      loadingModules: this.loadingPromises.size,
      totalMemoryUsage: this.estimateMemoryUsage()
    };
  }

  private static estimateMemoryUsage(): string {
    const size = JSON.stringify([...this.cache.keys()]).length;
    return `${(size / 1024).toFixed(2)} KB`;
  }
}

// 라우트 기반 동적 임포트
export const routeBasedImports = {
  '/admin': [
    () => dynamicComponents.admin.usageStatsCharts(),
    () => dynamicComponents.admin.realTimeMonitoring()
  ],
  '/admin/ai-config': [
    () => dynamicComponents.admin.aiPromptConfig(),
    () => dynamicComponents.admin.dreamConfig()
  ],
  // '/tarot': [
  //   () => dynamicComponents.user.tarotReading()
  // ],
  // '/dream': [
  //   () => dynamicComponents.user.dreamInterpretation()
  // ],
  // '/blog': [
  //   () => dynamicComponents.user.blogPost()
  // ]
} as const;

// 인터랙션 기반 프리로딩
export function setupInteractionPreloading(): void {
  // 마우스 호버시 프리로딩
  document.addEventListener('mouseover', (event) => {
    const target = event.target as HTMLElement;
    const preloadKey = target.dataset.preload;
    
    if (preloadKey && dynamicComponents.admin[preloadKey as keyof typeof dynamicComponents.admin]) {
      const importFn = dynamicComponents.admin[preloadKey as keyof typeof dynamicComponents.admin];
      DynamicImportManager.preload(preloadKey, importFn);
    }
  });

  // 터치 시작시 프리로딩 (모바일)
  document.addEventListener('touchstart', (event) => {
    const target = event.target as HTMLElement;
    const preloadKey = target.dataset.preload;
    
    // TODO: 사용자 컴포넌트 구현 후 활성화
    // if (preloadKey && dynamicComponents.user[preloadKey as keyof typeof dynamicComponents.user]) {
    //   const importFn = dynamicComponents.user[preloadKey as keyof typeof dynamicComponents.user];
    //   DynamicImportManager.preload(preloadKey, importFn);
    // }
  });
}

// 중요한 컴포넌트들 프리로딩
export async function preloadCriticalComponents(): Promise<void> {
  const criticalComponents = [
    { key: 'usageStats', fn: dynamicComponents.admin.usageStatsCharts },
    { key: 'realTimeMonitoring', fn: dynamicComponents.admin.realTimeMonitoring }
  ];

  const preloadPromises = criticalComponents.map(({ key, fn }) =>
    DynamicImportManager.preload(key, fn)
  );

  try {
    await Promise.allSettled(preloadPromises);
    console.log('Critical components preloaded');
  } catch (error) {
    console.warn('Some critical components failed to preload:', error);
  }
}

// 번들 크기 분석을 위한 유틸리티
export function analyzeBundleSize(): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('Bundle Analysis:', {
      cachedModules: DynamicImportManager.getCacheStats(),
      performanceMetrics: {
        navigation: performance.getEntriesByType('navigation')[0],
        resources: performance.getEntriesByType('resource').length
      }
    });
  }
}

// 라이브러리별 최적 로딩 전략
export const loadingStrategies = {
  // 즉시 필요한 라이브러리들
  critical: ['react', 'react-dom', 'next'],
  
  // 사용자 인터랙션 후 로딩
  interaction: ['framer-motion', 'react-hook-form'],
  
  // 특정 페이지에만 필요한 라이브러리들
  pageSpecific: {
    admin: ['recharts', 'date-fns'],
    tarot: ['openai', '@google/generative-ai'],
    blog: ['react-markdown', 'remark-gfm']
  },
  
  // 백그라운드에서 프리로딩할 라이브러리들
  background: ['browser-image-compression']
} as const;

export default DynamicImportManager;