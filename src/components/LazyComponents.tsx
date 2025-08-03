'use client';

import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { useComponentLazyLoading } from '@/hooks/useLazyLoading';

// 로딩 컴포넌트들
const LoadingSpinner = ({ message = '로딩 중...' }: { message?: string }) => (
  <div className="flex items-center justify-center py-8">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  </div>
);

const ChartLoading = () => (
  <div className="w-full h-64 bg-muted/20 rounded-lg animate-pulse flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 bg-muted/40 rounded-lg mx-auto mb-2"></div>
      <p className="text-sm text-muted-foreground">차트 로딩 중...</p>
    </div>
  </div>
);

// 지연 로딩할 컴포넌트들 정의
const LazyUsageStatsCharts = lazy(() => 
  import('@/components/admin/UsageStatsCharts').then(module => ({
    default: module.UsageStatsCharts
  }))
);

const LazyRealTimeMonitoringDashboard = lazy(() =>
  import('@/components/admin/RealTimeMonitoringDashboard').then(module => ({
    default: module.RealTimeMonitoringDashboard
  }))
);

const LazyTarotGuidelineManagement = lazy(() =>
  import('@/components/admin/TarotGuidelineManagement').then(module => ({
    default: module.TarotGuidelineManagement
  }))
);

const LazyAIProviderManagement = lazy(() =>
  import('@/components/admin/AIProviderManagement').then(module => ({
    default: module.AIProviderManagement
  }))
);

const LazyBlogManagement = lazy(() =>
  import('@/components/admin/BlogManagement').then(module => ({
    default: module.BlogManagement
  }))
);

const LazyUserManagement = lazy(() =>
  import('@/components/admin/UserManagement').then(module => ({
    default: module.UserManagement
  }))
);

// AI 관련 무거운 컴포넌트들
const LazyAIPromptConfigForm = lazy(() =>
  import('@/components/admin/AIPromptConfigForm').then(module => ({
    default: module.AIPromptConfigForm
  }))
);

const LazyDreamInterpretationConfigForm = lazy(() =>
  import('@/components/admin/DreamInterpretationConfigForm').then(module => ({
    default: module.DreamInterpretationConfigForm
  }))
);

// 조건부 렌더링을 위한 래퍼 컴포넌트
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
}

function LazyWrapper({ 
  children, 
  fallback = <LoadingSpinner />,
  rootMargin = '100px',
  threshold = 0.1 
}: LazyWrapperProps) {
  const { ref, shouldLoad } = useComponentLazyLoading({
    rootMargin,
    threshold
  });

  return (
    <div ref={ref}>
      {shouldLoad ? children : fallback}
    </div>
  );
}

// 관리자 페이지용 지연 로딩 컴포넌트들
export function LazyAdminUsageStats() {
  return (
    <LazyWrapper fallback={<ChartLoading />}>
      <Suspense fallback={<ChartLoading />}>
        <LazyUsageStatsCharts />
      </Suspense>
    </LazyWrapper>
  );
}

export function LazyAdminRealTimeMonitoring() {
  return (
    <LazyWrapper fallback={<LoadingSpinner message="실시간 모니터링 로딩 중..." />}>
      <Suspense fallback={<LoadingSpinner message="실시간 모니터링 로딩 중..." />}>
        <LazyRealTimeMonitoringDashboard />
      </Suspense>
    </LazyWrapper>
  );
}

export function LazyAdminTarotGuidelines() {
  return (
    <LazyWrapper fallback={<LoadingSpinner message="타로 지침 관리 로딩 중..." />}>
      <Suspense fallback={<LoadingSpinner message="타로 지침 관리 로딩 중..." />}>
        <LazyTarotGuidelineManagement />
      </Suspense>
    </LazyWrapper>
  );
}

export function LazyAdminAIProviders() {
  return (
    <LazyWrapper fallback={<LoadingSpinner message="AI 공급자 관리 로딩 중..." />}>
      <Suspense fallback={<LoadingSpinner message="AI 공급자 관리 로딩 중..." />}>
        <LazyAIProviderManagement />
      </Suspense>
    </LazyWrapper>
  );
}

export function LazyAdminBlogManagement() {
  return (
    <LazyWrapper fallback={<LoadingSpinner message="블로그 관리 로딩 중..." />}>
      <Suspense fallback={<LoadingSpinner message="블로그 관리 로딩 중..." />}>
        <LazyBlogManagement />
      </Suspense>
    </LazyWrapper>
  );
}

export function LazyAdminUserManagement() {
  return (
    <LazyWrapper fallback={<LoadingSpinner message="사용자 관리 로딩 중..." />}>
      <Suspense fallback={<LoadingSpinner message="사용자 관리 로딩 중..." />}>
        <LazyUserManagement />
      </Suspense>
    </LazyWrapper>
  );
}

// AI 설정 관련 무거운 컴포넌트들
export function LazyAdminAIPromptConfig() {
  return (
    <LazyWrapper fallback={<LoadingSpinner message="AI 프롬프트 설정 로딩 중..." />}>
      <Suspense fallback={<LoadingSpinner message="AI 프롬프트 설정 로딩 중..." />}>
        <LazyAIPromptConfigForm />
      </Suspense>
    </LazyWrapper>
  );
}

export function LazyAdminDreamConfig() {
  return (
    <LazyWrapper fallback={<LoadingSpinner message="꿈해몽 AI 설정 로딩 중..." />}>
      <Suspense fallback={<LoadingSpinner message="꿈해몽 AI 설정 로딩 중..." />}>
        <LazyDreamInterpretationConfigForm />
      </Suspense>
    </LazyWrapper>
  );
}

// 클라이언트 사이드 컴포넌트들
const LazyTarotReading = lazy(() =>
  import('@/components/reading/TarotReadingClient').then(module => ({
    default: module.TarotReadingClient
  })).catch(() => ({
    default: () => <div>타로 리딩을 불러올 수 없습니다.</div>
  }))
);

const LazyDreamInterpretation = lazy(() =>
  import('@/components/dream/DreamInterpretationClient').catch(() => ({
    default: () => <div>꿈해몽을 불러올 수 없습니다.</div>
  }))
);

// 사용자 페이지용 지연 로딩 컴포넌트들
export function LazyTarotReadingPage() {
  return (
    <LazyWrapper fallback={<LoadingSpinner message="타로 리딩 준비 중..." />}>
      <Suspense fallback={<LoadingSpinner message="타로 리딩 준비 중..." />}>
        <LazyTarotReading />
      </Suspense>
    </LazyWrapper>
  );
}

export function LazyDreamInterpretationPage() {
  return (
    <LazyWrapper fallback={<LoadingSpinner message="꿈해몽 준비 중..." />}>
      <Suspense fallback={<LoadingSpinner message="꿈해몽 준비 중..." />}>
        <LazyDreamInterpretation />
      </Suspense>
    </LazyWrapper>
  );
}

// 차트 라이브러리 지연 로딩
const LazyRecharts = lazy(() => 
  import('recharts').then(module => ({ 
    default: () => <div>Chart loaded</div> // Placeholder component
  }))
);

export function LazyChart({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<ChartLoading />}>
      <LazyRecharts />
      {children}
    </Suspense>
  );
}

// 에러 바운더리와 함께하는 안전한 지연 로딩
interface SafeLazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

export function SafeLazyComponent({ 
  children, 
  fallback = <LoadingSpinner />,
  errorFallback = <div className="text-center text-red-500">컴포넌트를 로드할 수 없습니다.</div>
}: SafeLazyComponentProps) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}