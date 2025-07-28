/**
 * 고급 캐싱 전략 및 최적화
 */

// 캐시 전략 타입 정의
export type CacheStrategy = 
  | 'cache-first'
  | 'network-first' 
  | 'stale-while-revalidate'
  | 'network-only'
  | 'cache-only';

// 리소스별 캐시 전략 설정
export const CACHE_STRATEGIES = {
  // 정적 리소스 - 캐시 우선
  static: {
    strategy: 'cache-first' as CacheStrategy,
    maxAge: 30 * 24 * 60 * 60, // 30일
    resources: [
      '/images/',
      '/icons/',
      '/_next/static/',
      '/fonts/',
      '.css',
      '.js'
    ]
  },
  
  // API 응답 - 네트워크 우선 + 백그라운드 동기화
  api: {
    strategy: 'network-first' as CacheStrategy,
    maxAge: 5 * 60, // 5분
    resources: [
      '/api/blog/',
      '/api/tarot/',
      '/api/dream/'
    ]
  },
  
  // 동적 콘텐츠 - Stale While Revalidate
  dynamic: {
    strategy: 'stale-while-revalidate' as CacheStrategy,
    maxAge: 60 * 60, // 1시간
    resources: [
      '/',
      '/blog',
      '/tarot',
      '/dream'
    ]
  },
  
  // 관리자 데이터 - 네트워크만
  admin: {
    strategy: 'network-only' as CacheStrategy,
    maxAge: 0,
    resources: [
      '/api/admin/',
      '/admin/'
    ]
  }
} as const;

// HTTP 캐시 헤더 설정
export const HTTP_CACHE_HEADERS = {
  // 정적 파일 - 장기 캐싱
  static: {
    'Cache-Control': 'public, max-age=31536000, immutable', // 1년
    'ETag': true,
    'Last-Modified': true
  },
  
  // 이미지 - 중기 캐싱
  images: {
    'Cache-Control': 'public, max-age=2592000, stale-while-revalidate=86400', // 30일 + 1일 stale
    'ETag': true,
    'Vary': 'Accept'
  },
  
  // API - 단기 캐싱 + 검증
  api: {
    'Cache-Control': 'public, max-age=300, stale-while-revalidate=60', // 5분 + 1분 stale
    'ETag': true,
    'Last-Modified': true,
    'Vary': 'Accept, Authorization'
  },
  
  // HTML 페이지 - 매우 단기 캐싱
  pages: {
    'Cache-Control': 'public, max-age=60, stale-while-revalidate=300', // 1분 + 5분 stale
    'ETag': true,
    'Vary': 'Accept-Encoding'
  },
  
  // 관리자 페이지 - 캐시 없음
  admin: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
} as const;

// 브라우저 캐시 관리 클래스
export class BrowserCacheManager {
  private static readonly CACHE_PREFIX = 'innerspell-cache-';
  private static readonly VERSION = 'v1';

  // 캐시 키 생성
  static generateCacheKey(url: string, version?: string): string {
    const baseKey = `${this.CACHE_PREFIX}${version || this.VERSION}`;
    const urlHash = this.simpleHash(url);
    return `${baseKey}-${urlHash}`;
  }

  // 간단한 해시 함수
  private static simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32비트 정수로 변환
    }
    return Math.abs(hash).toString(36);
  }

  // 메모리 기반 캐시 (LRU)
  private static memoryCache = new Map<string, {
    data: any;
    timestamp: number;
    maxAge: number;
  }>();
  
  private static readonly MAX_MEMORY_CACHE_SIZE = 50;

  // 메모리 캐시에서 데이터 가져오기
  static getFromMemoryCache<T = any>(key: string): T | null {
    const cached = this.memoryCache.get(key);
    
    if (!cached) return null;
    
    // 만료 확인
    if (Date.now() - cached.timestamp > cached.maxAge * 1000) {
      this.memoryCache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  // 메모리 캐시에 데이터 저장
  static setToMemoryCache<T = any>(
    key: string, 
    data: T, 
    maxAge: number = 300
  ): void {
    // 캐시 크기 제한
    if (this.memoryCache.size >= this.MAX_MEMORY_CACHE_SIZE) {
      const firstKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(firstKey);
    }

    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      maxAge
    });
  }

  // IndexedDB 기반 영구 캐시
  static async setToPersistentCache(
    key: string,
    data: any,
    maxAge: number = 3600
  ): Promise<void> {
    if (!('indexedDB' in window)) return;

    try {
      const db = await this.openCacheDB();
      const transaction = db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      
      await store.put({
        key,
        data,
        timestamp: Date.now(),
        maxAge: maxAge * 1000
      });
    } catch (error) {
      console.warn('Failed to save to persistent cache:', error);
    }
  }

  static async getFromPersistentCache<T = any>(key: string): Promise<T | null> {
    if (!('indexedDB' in window)) return null;

    try {
      const db = await this.openCacheDB();
      const transaction = db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const result = await store.get(key);

      if (!result) return null;

      // 만료 확인
      if (Date.now() - result.timestamp > result.maxAge) {
        // 만료된 데이터 삭제
        const deleteTransaction = db.transaction(['cache'], 'readwrite');
        const deleteStore = deleteTransaction.objectStore('cache');
        await deleteStore.delete(key);
        return null;
      }

      return result.data;
    } catch (error) {
      console.warn('Failed to get from persistent cache:', error);
      return null;
    }
  }

  private static async openCacheDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('InnerSpellCache', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
      };
    });
  }

  // 캐시 정리
  static async clearExpiredCache(): Promise<void> {
    // 메모리 캐시 정리
    const now = Date.now();
    for (const [key, cached] of this.memoryCache.entries()) {
      if (now - cached.timestamp > cached.maxAge * 1000) {
        this.memoryCache.delete(key);
      }
    }

    // IndexedDB 캐시 정리
    if ('indexedDB' in window) {
      try {
        const db = await this.openCacheDB();
        const transaction = db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        const cursor = await store.openCursor();

        if (cursor) {
          do {
            const cached = cursor.value;
            if (now - cached.timestamp > cached.maxAge) {
              await cursor.delete();
            }
          } while (cursor.continue());
        }
      } catch (error) {
        console.warn('Failed to clear expired cache:', error);
      }
    }
  }

  // 캐시 통계
  static getCacheStats() {
    return {
      memoryCache: {
        size: this.memoryCache.size,
        maxSize: this.MAX_MEMORY_CACHE_SIZE
      },
      cacheHitRate: this.calculateHitRate()
    };
  }

  private static cacheHits = 0;
  private static cacheMisses = 0;

  private static calculateHitRate(): number {
    const total = this.cacheHits + this.cacheMisses;
    return total > 0 ? (this.cacheHits / total) * 100 : 0;
  }

  static recordCacheHit(): void {
    this.cacheHits++;
  }

  static recordCacheMiss(): void {
    this.cacheMisses++;
  }
}

// 네트워크 우선 캐시 함수
export async function fetchWithCache<T = any>(
  url: string,
  options: RequestInit = {},
  cacheMaxAge: number = 300
): Promise<T> {
  const cacheKey = BrowserCacheManager.generateCacheKey(url);
  
  // 1. 메모리 캐시 확인
  const memoryCached = BrowserCacheManager.getFromMemoryCache<T>(cacheKey);
  if (memoryCached) {
    BrowserCacheManager.recordCacheHit();
    return memoryCached;
  }

  try {
    // 2. 네트워크 요청
    const response = await fetch(url, {
      ...options,
      headers: {
        'Cache-Control': 'no-cache',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // 3. 캐시에 저장
    BrowserCacheManager.setToMemoryCache(cacheKey, data, cacheMaxAge);
    BrowserCacheManager.setToPersistentCache(cacheKey, data, cacheMaxAge);
    
    BrowserCacheManager.recordCacheMiss();
    return data;
  } catch (error) {
    // 4. 네트워크 실패 시 영구 캐시에서 시도
    const persistentCached = await BrowserCacheManager.getFromPersistentCache<T>(cacheKey);
    if (persistentCached) {
      console.warn('Using stale cache due to network error:', error);
      BrowserCacheManager.recordCacheHit();
      return persistentCached;
    }
    
    throw error;
  }
}

// 캐시 정리 스케줄러
export function startCacheCleanupScheduler(): void {
  // 5분마다 만료된 캐시 정리
  setInterval(() => {
    BrowserCacheManager.clearExpiredCache();
  }, 5 * 60 * 1000);

  // 페이지 언로드 시 정리
  window.addEventListener('beforeunload', () => {
    BrowserCacheManager.clearExpiredCache();
  });
}

// 개발 모드에서 캐시 상태 모니터링
export function enableCacheMonitoring(): void {
  if (process.env.NODE_ENV === 'development') {
    setInterval(() => {
      console.log('Cache Stats:', BrowserCacheManager.getCacheStats());
    }, 30000); // 30초마다
  }
}