'use client';

// 브라우저 캐시 관리 유틸리티
class BrowserCache {
  private dbName = 'innerspell-cache';
  private version = 1;
  private db: IDBDatabase | null = null;

  private async openDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('IndexedDB not available'));
        return;
      }

      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // AI 공급자 설정 스토어
        if (!db.objectStoreNames.contains('ai-providers')) {
          const aiStore = db.createObjectStore('ai-providers', { keyPath: 'key' });
          aiStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // 타로 지침 스토어
        if (!db.objectStoreNames.contains('tarot-guidelines')) {
          const tarotStore = db.createObjectStore('tarot-guidelines', { keyPath: 'key' });
          tarotStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async set(storeName: string, key: string, data: any, ttl: number = 3600000): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const item = {
        key,
        data,
        timestamp: Date.now(),
        ttl
      };

      await new Promise<void>((resolve, reject) => {
        const request = store.put(item);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn('[BrowserCache] Failed to set cache:', error);
      // 폴백: 세션 스토리지 사용
      this.setSessionStorage(key, data, ttl);
    }
  }

  async get(storeName: string, key: string): Promise<any | null> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);

      const item = await new Promise<any>((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      if (!item) return null;

      // TTL 확인
      const now = Date.now();
      if (now - item.timestamp > item.ttl) {
        // 만료된 데이터 삭제
        await this.delete(storeName, key);
        return null;
      }

      return item.data;
    } catch (error) {
      console.warn('[BrowserCache] Failed to get cache:', error);
      // 폴백: 세션 스토리지 사용
      return this.getSessionStorage(key);
    }
  }

  async delete(storeName: string, key: string): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      await new Promise<void>((resolve, reject) => {
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn('[BrowserCache] Failed to delete cache:', error);
      // 폴백: 세션 스토리지 사용
      this.deleteSessionStorage(key);
    }
  }

  async clear(storeName: string): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      await new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn('[BrowserCache] Failed to clear cache:', error);
    }
  }

  // 세션 스토리지 폴백 메서드들
  private setSessionStorage(key: string, data: any, ttl: number): void {
    if (typeof window === 'undefined') return;
    
    const item = {
      data,
      timestamp: Date.now(),
      ttl
    };
    
    try {
      sessionStorage.setItem(`cache_${key}`, JSON.stringify(item));
    } catch (error) {
      console.warn('[BrowserCache] Session storage failed:', error);
    }
  }

  private getSessionStorage(key: string): any | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = sessionStorage.getItem(`cache_${key}`);
      if (!stored) return null;

      const item = JSON.parse(stored);
      const now = Date.now();
      
      if (now - item.timestamp > item.ttl) {
        sessionStorage.removeItem(`cache_${key}`);
        return null;
      }

      return item.data;
    } catch (error) {
      console.warn('[BrowserCache] Session storage get failed:', error);
      return null;
    }
  }

  private deleteSessionStorage(key: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      sessionStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn('[BrowserCache] Session storage delete failed:', error);
    }
  }
}

// 싱글톤 인스턴스
export const browserCache = new BrowserCache();

// 편의 함수들
export const cacheAIProviders = (data: any) => 
  browserCache.set('ai-providers', 'all-providers', data, 3600000); // 1시간

export const getCachedAIProviders = () => 
  browserCache.get('ai-providers', 'all-providers');

export const cacheTarotGuidelines = (data: any) => 
  browserCache.set('tarot-guidelines', 'all-guidelines', data, 7200000); // 2시간

export const getCachedTarotGuidelines = () => 
  browserCache.get('tarot-guidelines', 'all-guidelines');

export const clearAllCache = async () => {
  await browserCache.clear('ai-providers');
  await browserCache.clear('tarot-guidelines');
  
  // 세션 스토리지도 클리어
  if (typeof window !== 'undefined') {
    try {
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('cache_')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('[BrowserCache] Failed to clear session storage:', error);
    }
  }
};