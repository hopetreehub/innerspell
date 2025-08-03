'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// 성능 모니터링 컴포넌트들을 lazy load
export const LazyPerformanceMonitor = dynamic(
  () => import('@/components/PerformanceMonitor'),
  { 
    ssr: false,
    loading: () => null
  }
);

export const LazyPerformanceManager = dynamic(
  () => import('@/components/PerformanceManager'),
  { 
    ssr: false,
    loading: () => null
  }
);

// 서비스 워커를 lazy load
export const LazyServiceWorkerRegistration = dynamic(
  () => import('@/components/ServiceWorkerRegistration'),
  { 
    ssr: false,
    loading: () => null
  }
);

// Google Analytics를 lazy load
export const LazyGoogleAnalytics = dynamic(
  () => import('@/components/analytics/GoogleAnalytics'),
  { 
    ssr: false,
    loading: () => null
  }
);

// Web Vitals 추적을 lazy load
export const LazyWebVitalsTracker = dynamic(
  () => import('@/components/performance/WebVitalsTracker'),
  { 
    ssr: false,
    loading: () => null
  }
);

// 관리자 컴포넌트들을 lazy load
export const LazyBlogManagement = dynamic(
  () => import('@/components/admin/BlogManagement').then(mod => ({ default: mod.BlogManagement })),
  { 
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-8 w-48" />
      </div>
    )
  }
);

export const LazyTarotReadingClient = dynamic(
  () => import('@/components/reading/TarotReadingClient').then(mod => ({ default: mod.TarotReadingClient })),
  { 
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    )
  }
);

export const LazyBlogSearch = dynamic(
  () => import('@/components/blog/BlogSearch').then(mod => ({ default: mod.BlogSearch })),
  { 
    loading: () => <Skeleton className="h-10 w-full" />
  }
);

// 차트 라이브러리를 lazy load
export const LazyChartComponent = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { 
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full" />
  }
);

// 사용자 대시보드를 lazy load
export const LazyUserDashboard = dynamic(
  () => import('@/components/dashboard/UserDashboard'),
  { 
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4 animate-pulse">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    )
  }
);