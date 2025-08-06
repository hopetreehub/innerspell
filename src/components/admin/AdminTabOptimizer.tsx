'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useComponentPreloader } from '@/hooks/useComponentPreloader';

interface AdminTabOptimizerContextType {
  preloadTab: (tabId: string) => Promise<void>;
  isTabReady: (tabId: string) => boolean;
  preloadedTabs: string[];
}

const AdminTabOptimizerContext = createContext<AdminTabOptimizerContextType | null>(null);

export function useAdminTabOptimizer() {
  const context = useContext(AdminTabOptimizerContext);
  if (!context) {
    throw new Error('useAdminTabOptimizer must be used within AdminTabOptimizerProvider');
  }
  return context;
}

interface AdminTabOptimizerProviderProps {
  children: React.ReactNode;
}

export function AdminTabOptimizerProvider({ children }: AdminTabOptimizerProviderProps) {
  const { preloadComponent, isComponentLoaded, preloadMultiple } = useComponentPreloader();
  const [preloadedTabs, setPreloadedTabs] = useState<string[]>(['stats', 'live-monitoring']);

  // 탭별 컴포넌트 매핑
  const tabComponentMap = {
    'ai-providers': () => import('@/components/admin/AIProviderManagement'),
    'tarot-instructions': () => import('@/components/admin/TarotGuidelineManagement'),
    'tarot-ai-config': () => import('@/components/admin/AIPromptConfigForm'),
    'dream-ai-config': () => import('@/components/admin/DreamInterpretationConfigForm'),
    'blog-management': () => import('@/components/admin/BlogManagement'),
    'notifications': () => import('@/components/ui/push-notification-toggle'),
    'user-management': () => import('@/components/admin/UserManagement'),
    'system-management': () => import('@/components/admin/SystemManagement'),
  };

  const preloadTab = async (tabId: string) => {
    if (preloadedTabs.includes(tabId)) return;
    
    const importFunction = tabComponentMap[tabId as keyof typeof tabComponentMap];
    if (!importFunction) return;

    try {
      await preloadComponent(tabId, importFunction, { priority: 'high' });
      setPreloadedTabs(prev => [...prev, tabId]);
    } catch (error) {
      console.warn(`Failed to preload tab ${tabId}:`, error);
    }
  };

  const isTabReady = (tabId: string) => {
    return preloadedTabs.includes(tabId) || isComponentLoaded(tabId);
  };

  // 자동 프리로딩 전략
  useEffect(() => {
    const preloadStrategy = async () => {
      // 1단계: 사용자가 페이지에 머물면 바로 주요 탭들 프리로드
      setTimeout(() => {
        preloadMultiple([
          {
            id: 'ai-providers',
            import: () => import('@/components/admin/AIProviderManagement') as Promise<{ default: React.ComponentType<any> }>,
            options: { delay: 0, priority: 'high' }
          },
          {
            id: 'tarot-instructions',
            import: () => import('@/components/admin/TarotGuidelineManagement') as Promise<{ default: React.ComponentType<any> }>,
            options: { delay: 200, priority: 'high' }
          }
        ]);
      }, 500);

      // 2단계: 추가 탭들 프리로드
      setTimeout(() => {
        preloadMultiple([
          {
            id: 'user-management',
            import: () => import('@/components/admin/UserManagement') as Promise<{ default: React.ComponentType<any> }>,
            options: { delay: 0, priority: 'low' }
          },
          {
            id: 'blog-management',
            import: () => import('@/components/admin/BlogManagement') as Promise<{ default: React.ComponentType<any> }>,
            options: { delay: 300, priority: 'low' }
          },
          {
            id: 'tarot-ai-config',
            import: () => import('@/components/admin/AIPromptConfigForm'),
            options: { delay: 600, priority: 'low' }
          }
        ]);
      }, 2000);

      // 3단계: 나머지 탭들 프리로드
      setTimeout(() => {
        preloadMultiple([
          {
            id: 'dream-ai-config',
            import: () => import('@/components/admin/DreamInterpretationConfigForm'),
            options: { delay: 0, priority: 'low' }
          },
          {
            id: 'notifications',
            import: () => import('@/components/ui/push-notification-toggle'),
            options: { delay: 200, priority: 'low' }
          },
          {
            id: 'system-management',
            import: () => import('@/components/admin/SystemManagement'),
            options: { delay: 400, priority: 'low' }
          }
        ]);
      }, 4000);
    };

    preloadStrategy();
  }, [preloadComponent, preloadMultiple]);

  // 브라우저 유휴 시간을 이용한 프리로딩
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const requestIdleCallback = window.requestIdleCallback || ((cb: IdleRequestCallback) => {
      const start = Date.now();
      return setTimeout(() => {
        cb({
          didTimeout: false,
          timeRemaining() {
            return Math.max(0, 50 - (Date.now() - start));
          }
        });
      }, 1);
    });

    const idlePreload = () => {
      requestIdleCallback((deadline) => {
        // 브라우저가 유휴 상태일 때만 프리로드
        if (deadline.timeRemaining() > 10) {
          Object.keys(tabComponentMap).forEach(tabId => {
            if (!preloadedTabs.includes(tabId)) {
              preloadTab(tabId);
            }
          });
        }
      });
    };

    // 페이지 로드 후 5초 뒤에 유휴시간 프리로드 시작
    const timer = setTimeout(idlePreload, 5000);
    return () => clearTimeout(timer);
  }, [preloadTab, preloadedTabs]);

  const value = {
    preloadTab,
    isTabReady,
    preloadedTabs
  };

  return (
    <AdminTabOptimizerContext.Provider value={value}>
      {children}
    </AdminTabOptimizerContext.Provider>
  );
}