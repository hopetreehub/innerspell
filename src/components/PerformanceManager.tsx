'use client';

import { useEffect } from 'react';
import { 
  initializeFontOptimization,
  applyFontFallbackStrategy 
} from '@/lib/performance/fontOptimization';
import { 
  startCacheCleanupScheduler,
  enableCacheMonitoring 
} from '@/lib/performance/caching';
import { preloadCriticalComponents } from '@/lib/dynamicImports';

/**
 * 성능 최적화 관리 컴포넌트
 * 폰트 로딩, 캐싱, 컴포넌트 프리로딩 등을 관리
 */
export default function PerformanceManager() {
  useEffect(() => {
    // 성능 최적화 초기화
    const initializePerformance = async () => {
      try {
        // 1. 폰트 최적화 초기화
        await initializeFontOptimization();
        
        // 2. 폰트 대체 전략 적용
        applyFontFallbackStrategy();
        
        // 3. 캐시 정리 스케줄러 시작
        startCacheCleanupScheduler();
        
        // 4. 개발 모드에서 캐시 모니터링 활성화
        enableCacheMonitoring();
        
        // 5. 중요한 컴포넌트들 프리로딩
        await preloadCriticalComponents();
        
        console.log('Performance optimization initialized successfully');
      } catch (error) {
        console.warn('Performance optimization initialization failed:', error);
      }
    };

    initializePerformance();
  }, []);

  // 이 컴포넌트는 UI를 렌더링하지 않음
  return null;
}