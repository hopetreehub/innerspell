// 데이터 캐싱 서비스 - 메모리 기반 캐시 구현
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class DataCache {
  private cache: Map<string, CacheItem<any>>;
  private defaultTTL: number;
  private maxSize: number;
  private cleanupInterval: NodeJS.Timeout | null;

  constructor(defaultTTL = 60000, maxSize = 100) { // 기본 TTL: 1분
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
    this.maxSize = maxSize;
    this.cleanupInterval = null;
    this.startCleanup();
  }

  // 캐시에 데이터 저장
  set<T>(key: string, data: T, ttl?: number): void {
    // 캐시 크기 제한 확인
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }

  // 캐시에서 데이터 가져오기
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // TTL 확인
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  // 캐시에 데이터가 있는지 확인
  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) return false;
    
    // TTL 확인
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  // 특정 키 삭제
  delete(key: string): void {
    this.cache.delete(key);
  }

  // 패턴에 맞는 키들 삭제
  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    Array.from(this.cache.keys())
      .filter(key => regex.test(key))
      .forEach(key => this.cache.delete(key));
  }

  // 전체 캐시 비우기
  clear(): void {
    this.cache.clear();
  }

  // 캐시 크기 반환
  size(): number {
    return this.cache.size;
  }

  // 가장 오래된 항목 제거
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  // 주기적으로 만료된 항목 정리
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const keysToDelete: string[] = [];

      for (const [key, item] of this.cache.entries()) {
        if (now - item.timestamp > item.ttl) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach(key => this.cache.delete(key));
    }, 30000); // 30초마다 정리
  }

  // 캐시 서비스 종료
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}

// 싱글톤 인스턴스
let cacheInstance: DataCache | null = null;

// 캐시 인스턴스 가져오기
export function getCache(): DataCache {
  if (!cacheInstance) {
    cacheInstance = new DataCache();
  }
  return cacheInstance;
}

// 캐시 래퍼 함수 - 자동 캐싱 처리
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cache = getCache();
  
  // 캐시에서 먼저 확인
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }
  
  // 캐시에 없으면 데이터 가져오기
  try {
    const data = await fetcher();
    cache.set(key, data, ttl);
    return data;
  } catch (error) {
    // 에러 발생 시 캐시하지 않음
    throw error;
  }
}

// 캐시 무효화 함수
export function invalidateCache(pattern?: string): void {
  const cache = getCache();
  
  if (pattern) {
    cache.deletePattern(pattern);
  } else {
    cache.clear();
  }
}

// 특정 캐시 삭제
export function deleteCacheItem(key: string): void {
  const cache = getCache();
  cache.delete(key);
}

// 캐시 통계 정보
export function getCacheStats(): { size: number; maxSize: number } {
  const cache = getCache();
  return {
    size: cache.size(),
    maxSize: 100 // 기본 최대 크기
  };
}

// 사용량 통계 캐시 키 생성기
export function getUsageStatsCacheKey(dateRange: string): string {
  return `usage-stats:${dateRange}`;
}

// 서비스 사용량 캐시 키 생성기
export function getServiceUsageCacheKey(): string {
  return 'service-usage-breakdown';
}

// 환경 정보 캐시 키 생성기
export function getEnvironmentInfoCacheKey(): string {
  return 'environment-info';
}

// 성능 메트릭 캐시 키 생성기
export function getPerformanceMetricsCacheKey(): string {
  return 'performance-metrics';
}

// 실시간 통계 캐시 키 생성기
export function getRealTimeStatsCacheKey(): string {
  return 'realtime-stats';
}

// 활성 세션 캐시 키 생성기
export function getActiveSessionsCacheKey(): string {
  return 'active-sessions';
}

// 활동 로그 캐시 키 생성기
export function getActivityLogsCacheKey(limit: number): string {
  return `activity-logs:${limit}`;
}

// 시스템 알림 캐시 키 생성기
export function getSystemAlertsCacheKey(): string {
  return 'system-alerts';
}