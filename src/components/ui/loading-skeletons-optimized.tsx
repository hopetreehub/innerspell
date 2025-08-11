/**
 * Optimized loading skeleton components with improved animations and performance
 */

import { memo } from 'react';

// 차트 스켈레톤 - 차트 로딩 시 표시
export const ChartSkeleton = memo(() => {
  return (
    <div className="animate-pulse">
      <div className="h-[300px] bg-gray-200 dark:bg-gray-700 rounded-lg relative overflow-hidden">
        {/* 차트 그리드 라인 효과 */}
        <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 gap-1 p-4">
          {[...Array(72)].map((_, i) => (
            <div 
              key={i} 
              className="bg-gray-300 dark:bg-gray-600 opacity-20"
              style={{ animationDelay: `${i * 10}ms` }}
            />
          ))}
        </div>
        {/* 축 레이블 */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-between px-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-3 w-8 bg-gray-300 dark:bg-gray-600 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
});
ChartSkeleton.displayName = 'ChartSkeleton';

// 통계 카드 스켈레톤
export const StatsCardSkeleton = memo(() => {
  return (
    <div className="animate-pulse bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
        <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20 mb-1" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32" />
    </div>
  );
});
StatsCardSkeleton.displayName = 'StatsCardSkeleton';

// 대시보드 스켈레톤 최적화 버전
export const DashboardSkeletonOptimized = memo(() => {
  return (
    <div className="space-y-6">
      {/* 헤더 스켈레톤 */}
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-64 mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96" />
      </div>

      {/* 통계 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-48 mb-4" />
          <ChartSkeleton />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-48 mb-4" />
          <ChartSkeleton />
        </div>
      </div>
    </div>
  );
});
DashboardSkeletonOptimized.displayName = 'DashboardSkeletonOptimized';

// 실시간 모니터링 스켈레톤
export const RealTimeMonitoringSkeleton = memo(() => {
  return (
    <div className="space-y-6">
      {/* 헤더 및 제어 버튼 */}
      <div className="flex items-center justify-between">
        <div className="animate-pulse flex items-center space-x-4">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-48" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full px-3 py-1 w-32" />
        </div>
        <div className="animate-pulse flex items-center space-x-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20" />
          ))}
        </div>
      </div>

      {/* 메트릭 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* 활동 로그 및 세션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="animate-pulse mb-4">
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48" />
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse border rounded-lg p-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="animate-pulse mb-4">
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48" />
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-start space-x-3 pb-3 border-b last:border-0">
                <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
RealTimeMonitoringSkeleton.displayName = 'RealTimeMonitoringSkeleton';

// 탭 콘텐츠 스켈레톤
export const TabContentSkeleton = memo(() => {
  return (
    <div className="animate-pulse bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="space-y-6">
        <div>
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-48 mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
              <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-5/6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
TabContentSkeleton.displayName = 'TabContentSkeleton';

// 로딩 시머 효과
export const ShimmerEffect = memo(() => {
  return (
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]">
      <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
});
ShimmerEffect.displayName = 'ShimmerEffect';

// 개선된 카드 스켈레톤
export const CardSkeletonOptimized = memo(() => {
  return (
    <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
        <div className="space-y-3">
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full" />
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-5/6" />
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-4/6" />
        </div>
      </div>
      <ShimmerEffect />
    </div>
  );
});
CardSkeletonOptimized.displayName = 'CardSkeletonOptimized';

// 성능 지표 스켈레톤
export const PerformanceIndicatorSkeleton = memo(() => {
  return (
    <div className="animate-pulse space-y-2">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12" />
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2" />
    </div>
  );
});
PerformanceIndicatorSkeleton.displayName = 'PerformanceIndicatorSkeleton';

// CSS 애니메이션 스타일 (tailwind.config.js에 추가 필요)
// animation: {
//   shimmer: 'shimmer 2s infinite',
// },
// keyframes: {
//   shimmer: {
//     '100%': {
//       transform: 'translateX(100%)',
//     },
//   },
// }