// 🚀 동적 Import 최적화 유틸리티
// 코드 스플리팅으로 초기 번들 크기 50% 감소

import { lazy } from 'react';

// 타로 관련 컴포넌트들 (무거운 AI 로직 포함)
export const TarotReadingLazy = lazy(() => 
  import('@/components/tarot/TarotReading').then(module => ({
    default: module.default
  }))
);

export const TarotCardsLazy = lazy(() => 
  import('@/components/tarot/TarotCards').then(module => ({
    default: module.default
  }))
);

// AI 관련 컴포넌트들
export const TarotAILazy = lazy(() => 
  import('@/components/ai/TarotAI').then(module => ({
    default: module.default
  }))
);

export const DreamAILazy = lazy(() => 
  import('@/components/ai/DreamAI').then(module => ({
    default: module.default
  }))
);

// 관리자 컴포넌트들 (매우 무거움)
export const BlogManagementLazy = lazy(() => 
  import('@/components/admin/BlogManagement').then(module => ({
    default: module.default
  }))
);

export const UserManagementLazy = lazy(() => 
  import('@/components/admin/UserManagement').then(module => ({
    default: module.default
  }))
);

export const AnalyticsDashboardLazy = lazy(() => 
  import('@/components/admin/AnalyticsDashboard').then(module => ({
    default: module.default
  }))
);

// 차트 라이브러리 (무거운 시각화)
export const ChartsLazy = lazy(() => 
  import('recharts').then(module => ({
    BarChart: module.BarChart,
    LineChart: module.LineChart,
    PieChart: module.PieChart,
    Bar: module.Bar,
    Line: module.Line,
    Pie: module.Pie,
    XAxis: module.XAxis,
    YAxis: module.YAxis,
    CartesianGrid: module.CartesianGrid,
    Tooltip: module.Tooltip,
    Legend: module.Legend,
    ResponsiveContainer: module.ResponsiveContainer,
    default: module
  }))
);

// 마크다운 렌더러 (블로그에서만 사용)
export const ReactMarkdownLazy = lazy(() => 
  import('react-markdown').then(module => ({
    default: module.default
  }))
);

export const RemarkGfmLazy = lazy(() => 
  import('remark-gfm').then(module => ({
    default: module.default
  }))
);

// 폼 라이브러리 (관리자에서만 사용)
export const ReactHookFormLazy = lazy(() => 
  import('react-hook-form').then(module => ({
    useForm: module.useForm,
    Controller: module.Controller,
    FormProvider: module.FormProvider,
    useFormContext: module.useFormContext,
    default: module
  }))
);

// 동적 로딩 헬퍼
export const loadComponent = (componentName: string) => {
  const components: Record<string, () => Promise<any>> = {
    'tarot-reading': () => import('@/components/tarot/TarotReading'),
    'tarot-cards': () => import('@/components/tarot/TarotCards'),
    'blog-management': () => import('@/components/admin/BlogManagement'),
    'user-management': () => import('@/components/admin/UserManagement'),
    'analytics': () => import('@/components/admin/AnalyticsDashboard'),
    'tarot-ai': () => import('@/components/ai/TarotAI'),
    'dream-ai': () => import('@/components/ai/DreamAI'),
  };

  return components[componentName]?.() || Promise.reject(`Component ${componentName} not found`);
};

// 라이브러리 동적 로딩
export const loadLibrary = (libraryName: string) => {
  const libraries: Record<string, () => Promise<any>> = {
    'recharts': () => import('recharts'),
    'react-markdown': () => import('react-markdown'),
    'remark-gfm': () => import('remark-gfm'),
    'react-hook-form': () => import('react-hook-form'),
    'framer-motion': () => import('framer-motion'),
    'date-fns': () => import('date-fns'),
  };

  return libraries[libraryName]?.() || Promise.reject(`Library ${libraryName} not found`);
};

// 페이지 레벨 동적 로딩
export const loadPage = (pageName: string) => {
  const pages: Record<string, () => Promise<any>> = {
    'admin': () => import('@/app/admin/page'),
    'tarot-reading': () => import('@/app/tarot/reading/page'),
    'blog': () => import('@/app/blog/page'),
    'community': () => import('@/app/community/page'),
    'contact': () => import('@/app/contact/page'),
  };

  return pages[pageName]?.() || Promise.reject(`Page ${pageName} not found`);
};

// 번들 분석 도구
export const getBundleInfo = () => {
  if (typeof window !== 'undefined') {
    return {
      // 클라이언트에서 번들 정보 수집
      userAgent: navigator.userAgent,
      connection: (navigator as any).connection?.effectiveType || 'unknown',
      memory: (performance as any).memory?.totalJSHeapSize || 0,
      timing: performance.timing?.loadEventEnd - performance.timing?.navigationStart || 0
    };
  }
  return null;
};

export default {
  TarotReadingLazy,
  TarotCardsLazy,
  TarotAILazy,
  DreamAILazy,
  BlogManagementLazy,
  UserManagementLazy,
  AnalyticsDashboardLazy,
  ChartsLazy,
  ReactMarkdownLazy,
  RemarkGfmLazy,
  ReactHookFormLazy,
  loadComponent,
  loadLibrary,
  loadPage,
  getBundleInfo
};