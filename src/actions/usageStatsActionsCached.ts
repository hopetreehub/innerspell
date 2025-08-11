'use server';

import { 
  getUsageStats as originalGetUsageStats,
  getServiceUsageBreakdown as originalGetServiceUsageBreakdown,
  getEnvironmentInfo as originalGetEnvironmentInfo,
  getAdminPerformanceMetrics as originalGetAdminPerformanceMetrics,
  getRealTimeStats as originalGetRealTimeStats,
  getActiveSessions as originalGetActiveSessions,
  getRecentActivityLogs as originalGetRecentActivityLogs,
  getSystemAlerts as originalGetSystemAlerts
} from './usageStatsActions';

import {
  withCache,
  getUsageStatsCacheKey,
  getServiceUsageCacheKey,
  getEnvironmentInfoCacheKey,
  getPerformanceMetricsCacheKey,
  getRealTimeStatsCacheKey,
  getActiveSessionsCacheKey,
  getActivityLogsCacheKey,
  getSystemAlertsCacheKey,
  invalidateCache
} from '@/lib/cache/dataCache';

// 캐시된 사용량 통계 가져오기 (TTL: 5분)
export async function getUsageStats(dateRange: 'daily' | 'weekly' | 'monthly') {
  const cacheKey = getUsageStatsCacheKey(dateRange);
  return withCache(
    cacheKey,
    () => originalGetUsageStats(dateRange),
    300000 // 5분
  );
}

// 캐시된 서비스 사용량 분석 (TTL: 10분)
export async function getServiceUsageBreakdown() {
  const cacheKey = getServiceUsageCacheKey();
  return withCache(
    cacheKey,
    () => originalGetServiceUsageBreakdown(),
    600000 // 10분
  );
}

// 캐시된 환경 정보 (TTL: 30분)
export async function getEnvironmentInfo() {
  const cacheKey = getEnvironmentInfoCacheKey();
  return withCache(
    cacheKey,
    () => originalGetEnvironmentInfo(),
    1800000 // 30분
  );
}

// 캐시된 성능 메트릭 (TTL: 2분)
export async function getAdminPerformanceMetrics() {
  const cacheKey = getPerformanceMetricsCacheKey();
  return withCache(
    cacheKey,
    () => originalGetAdminPerformanceMetrics(),
    120000 // 2분
  );
}

// 캐시된 실시간 통계 (TTL: 10초)
export async function getRealTimeStats() {
  const cacheKey = getRealTimeStatsCacheKey();
  return withCache(
    cacheKey,
    () => originalGetRealTimeStats(),
    10000 // 10초
  );
}

// 캐시된 활성 세션 (TTL: 5초)
export async function getActiveSessions() {
  const cacheKey = getActiveSessionsCacheKey();
  return withCache(
    cacheKey,
    () => originalGetActiveSessions(),
    5000 // 5초
  );
}

// 캐시된 활동 로그 (TTL: 30초)
export async function getRecentActivityLogs(limit = 10) {
  const cacheKey = getActivityLogsCacheKey(limit);
  return withCache(
    cacheKey,
    () => originalGetRecentActivityLogs(limit),
    30000 // 30초
  );
}

// 캐시된 시스템 알림 (TTL: 1분)
export async function getSystemAlerts() {
  const cacheKey = getSystemAlertsCacheKey();
  return withCache(
    cacheKey,
    () => originalGetSystemAlerts(),
    60000 // 1분
  );
}

// 사용량 통계 캐시 무효화
export function invalidateUsageStatsCache(dateRange?: string) {
  if (dateRange) {
    invalidateCache(`usage-stats:${dateRange}`);
  } else {
    invalidateCache('usage-stats:.*');
  }
}

// 실시간 데이터 캐시 무효화
export function invalidateRealTimeCache() {
  invalidateCache('realtime-stats');
  invalidateCache('active-sessions');
  invalidateCache('activity-logs:.*');
  invalidateCache('system-alerts');
}

// 전체 통계 캐시 무효화
export function invalidateAllStatsCache() {
  invalidateCache('.*'); // 모든 캐시 삭제
}