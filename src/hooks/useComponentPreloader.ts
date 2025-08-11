'use client';

import { useCallback, useRef, useState } from 'react';

interface PreloadOptions {
  delay?: number;
  priority?: 'high' | 'low';
}

interface ComponentModule {
  default: React.ComponentType<any>;
}

/**
 * 컴포넌트 프리로딩을 위한 훅
 * 사용자 상호작용 전에 미리 컴포넌트를 로드하여 체감 성능을 향상시킵니다.
 */
export function useComponentPreloader() {
  const preloadedComponents = useRef<Map<string, Promise<ComponentModule>>>(new Map());
  const [loadingStatus, setLoadingStatus] = useState<Map<string, 'loading' | 'loaded' | 'error'>>(new Map());

  const preloadComponent = useCallback(async (
    componentId: string,
    importFunction: () => Promise<ComponentModule>,
    options: PreloadOptions = {}
  ) => {
    // 이미 로드되었거나 로딩 중인 경우 건너뛰기
    if (preloadedComponents.current.has(componentId)) {
      return preloadedComponents.current.get(componentId);
    }

    const { delay = 0, priority = 'low' } = options;

    // 우선순위에 따른 지연 시간 조정
    const actualDelay = priority === 'high' ? Math.min(delay, 100) : delay;

    const loadComponent = async () => {
      if (actualDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, actualDelay));
      }

      setLoadingStatus(prev => new Map(prev).set(componentId, 'loading'));

      try {
        const importedModule = await importFunction();
        setLoadingStatus(prev => new Map(prev).set(componentId, 'loaded'));
        return importedModule;
      } catch (error) {
        console.warn(`Failed to preload component ${componentId}:`, error);
        setLoadingStatus(prev => new Map(prev).set(componentId, 'error'));
        throw error;
      }
    };

    const promise = loadComponent();
    preloadedComponents.current.set(componentId, promise);
    return promise;
  }, []);

  const preloadMultiple = useCallback(async (
    components: Array<{
      id: string;
      import: () => Promise<ComponentModule>;
      options?: PreloadOptions;
    }>
  ) => {
    const promises = components.map(({ id, import: importFn, options }) =>
      preloadComponent(id, importFn, options)
    );

    // 우선순위가 높은 것부터 처리
    const sortedPromises = promises.sort((a, b) => {
      // 임시로 모든 것을 동시에 처리
      return 0;
    });

    try {
      await Promise.allSettled(sortedPromises);
    } catch (error) {
      console.warn('Some components failed to preload:', error);
    }
  }, [preloadComponent]);

  const isComponentLoaded = useCallback((componentId: string) => {
    return loadingStatus.get(componentId) === 'loaded';
  }, [loadingStatus]);

  const isComponentLoading = useCallback((componentId: string) => {
    return loadingStatus.get(componentId) === 'loading';
  }, [loadingStatus]);

  const getLoadingStatus = useCallback((componentId: string) => {
    return loadingStatus.get(componentId) || 'not-started';
  }, [loadingStatus]);

  return {
    preloadComponent,
    preloadMultiple,
    isComponentLoaded,
    isComponentLoading,
    getLoadingStatus,
    loadingStatus: Object.fromEntries(loadingStatus)
  };
}