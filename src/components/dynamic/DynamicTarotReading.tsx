'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// 타로 리딩 컴포넌트 지연 로딩
export const DynamicTarotReadingClient = dynamic(
  () => import('@/components/reading/TarotReadingClient').then(mod => mod.TarotReadingClient),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    ),
    ssr: false
  }
);

// 꿈해몽 컴포넌트 지연 로딩
export const DynamicDreamInterpretation = dynamic(
  () => import('@/components/dream/DreamInterpretationClient').then(mod => mod.DreamInterpretationClient),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    ),
    ssr: true
  }
);

// 관리자 대시보드 지연 로딩
export const DynamicAdminDashboard = dynamic(
  () => import('@/components/admin/AdminDashboard'),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    ),
    ssr: false
  }
);

// 블로그 에디터 지연 로딩 (무거운 MDX 에디터)
export const DynamicMDXEditor = dynamic(
  () => import('@/components/admin/MDXEditor').then(mod => mod.MDXEditor),
  {
    loading: () => (
      <div className="border rounded-md p-4">
        <div className="animate-pulse">
          <div className="h-10 bg-muted rounded mb-4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    ),
    ssr: false
  }
);

// 차트 컴포넌트들 지연 로딩
export const DynamicUsageStatsCharts = dynamic(
  () => import('@/components/admin/UsageStatsCharts').then(mod => mod.UsageStatsCharts),
  {
    loading: () => (
      <div className="grid gap-4">
        <div className="h-64 bg-muted animate-pulse rounded"></div>
        <div className="h-64 bg-muted animate-pulse rounded"></div>
      </div>
    ),
    ssr: false
  }
);

// 실시간 모니터링 대시보드 지연 로딩
export const DynamicRealTimeMonitoring = dynamic(
  () => import('@/components/admin/RealTimeMonitoringDashboard').then(mod => mod.RealTimeMonitoringDashboard),
  {
    loading: () => (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded"></div>
        <div className="h-64 bg-muted animate-pulse rounded"></div>
      </div>
    ),
    ssr: false
  }
);