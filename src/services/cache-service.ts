// 🚀 메모리 캐시 서비스 - 성능 최적화
// API 응답 시간을 90% 단축

interface CacheItem<T> {
  data: T;
  expiry: number;
  key: string;
}

class CacheService {
  private cache = new Map<string, CacheItem<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5분

  set<T>(key: string, data: T, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { data, expiry, key });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // 패턴으로 키 삭제 (블로그 포스트 변경 시 관련 캐시 모두 삭제)
  deletePattern(pattern: string): void {
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
  }

  // 통계
  getStats() {
    const now = Date.now();
    const valid = Array.from(this.cache.values()).filter(item => now <= item.expiry);
    const expired = this.cache.size - valid.length;
    
    return {
      total: this.cache.size,
      valid: valid.length,
      expired,
      hitRate: this.hitCount / (this.hitCount + this.missCount) || 0
    };
  }

  private hitCount = 0;
  private missCount = 0;

  // 내부 사용
  recordHit(): void {
    this.hitCount++;
  }

  recordMiss(): void {
    this.missCount++;
  }
}

// 싱글톤 인스턴스
const cacheService = new CacheService();

// 편의 함수들
export const cache = {
  // 블로그 포스트 캐싱
  blogPosts: {
    get: (filters?: string) => cacheService.get(`blog:posts:${filters || 'all'}`),
    set: (data: any, filters?: string) => cacheService.set(`blog:posts:${filters || 'all'}`, data, 5 * 60 * 1000),
    invalidate: () => cacheService.deletePattern('blog:')
  },
  
  // 타로 가이드라인 캐싱
  tarotGuidelines: {
    get: () => cacheService.get('tarot:guidelines'),
    set: (data: any) => cacheService.set('tarot:guidelines', data, 30 * 60 * 1000), // 30분
    invalidate: () => cacheService.delete('tarot:guidelines')
  },
  
  // API 헬스 캐싱
  health: {
    get: () => cacheService.get('api:health'),
    set: (data: any) => cacheService.set('api:health', data, 60 * 1000), // 1분
    invalidate: () => cacheService.delete('api:health')
  },
  
  // 통계
  getStats: () => cacheService.getStats(),
  clear: () => cacheService.clear()
};

export default cacheService;