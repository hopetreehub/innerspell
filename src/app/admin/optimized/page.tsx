'use client';

import React, { Suspense, lazy } from 'react';
import { AdminAuthWrapper } from '@/components/admin/AdminAuthWrapper';
import { DashboardSkeleton } from '@/components/ui/loading-skeletons';
import { ErrorBoundary } from 'react-error-boundary';
import { LoadingError } from '@/components/ui/error-states';

// Lazy load components
const AdminDashboardStats = lazy(() => import('@/components/admin/AdminDashboardStats').then(module => ({
  default: module.AdminDashboardStats
})));

const AdminTabs = lazy(() => import('@/components/admin/AdminTabs'));

// 탭별 컴포넌트 최적화된 버전으로 교체
const UsageStatsChartsOptimized = lazy(() => import('@/components/admin/UsageStatsChartsOptimized'));
const RealTimeMonitoringDashboardOptimized = lazy(() => import('@/components/admin/RealTimeMonitoringDashboardOptimized'));

// Error fallback component
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <LoadingError 
      resource="관리자 대시보드" 
      onRetry={resetErrorBoundary}
    />
  );
}

export default function AdminOptimizedPage() {
  return (
    <AdminAuthWrapper>
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="space-y-6">
          {/* 페이지 헤더 */}
          <div>
            <h1 className="text-3xl font-bold">관리자 대시보드 (최적화)</h1>
            <p className="text-muted-foreground mt-2">
              InnerSpell AI 타로 서비스의 성능 최적화된 관리 시스템
            </p>
          </div>

          {/* 대시보드 통계 */}
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense fallback={<DashboardSkeleton />}>
              <AdminDashboardStats />
            </Suspense>
          </ErrorBoundary>

          {/* 관리자 탭 */}
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense fallback={<DashboardSkeleton />}>
              <AdminTabs 
                customComponents={{
                  UsageStats: UsageStatsChartsOptimized,
                  RealTimeMonitoring: RealTimeMonitoringDashboardOptimized
                }}
              />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </AdminAuthWrapper>
  );
}