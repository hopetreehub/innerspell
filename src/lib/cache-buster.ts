/**
 * Emergency Cache Invalidation Utilities
 * For fixing persistent login issues due to browser/CDN cache
 */

export class CacheBuster {
  private static instance: CacheBuster;
  private cacheBustId: string;

  constructor() {
    this.cacheBustId = this.generateCacheBustId();
  }

  static getInstance(): CacheBuster {
    if (!CacheBuster.instance) {
      CacheBuster.instance = new CacheBuster();
    }
    return CacheBuster.instance;
  }

  private generateCacheBustId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * EMERGENCY: Force complete cache invalidation
   */
  async emergencyInvalidateAll(): Promise<void> {
    console.log('🚨 EMERGENCY: Performing complete cache invalidation');
    
    // 1. Clear all browser caches
    await this.clearBrowserCaches();
    
    // 2. Clear localStorage auth data
    this.clearAuthLocalStorage();
    
    // 3. Trigger server-side cache bust
    await this.triggerServerCacheBust();
    
    // 4. Force page reload with cache busting
    this.forceReloadWithCacheBust();
  }

  /**
   * Clear all browser caches including Service Worker caches
   */
  async clearBrowserCaches(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      // Clear all Cache API caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => {
            console.log(`🗑️ Clearing cache: ${cacheName}`);
            return caches.delete(cacheName);
          })
        );
      }

      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear specific localStorage items but keep user preferences
      const keysToRemove = [
        'emailForSignIn',
        'user-logged-out',
        'auth-state-changed',
        'firebase:authUser:',
        'firebase:host:'
      ];
      
      keysToRemove.forEach(key => {
        if (key.endsWith(':')) {
          // Remove all keys that start with this prefix
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const storageKey = localStorage.key(i);
            if (storageKey && storageKey.startsWith(key)) {
              localStorage.removeItem(storageKey);
            }
          }
        } else {
          localStorage.removeItem(key);
        }
      });

      console.log('✅ Browser caches cleared');
    } catch (error) {
      console.error('❌ Error clearing browser caches:', error);
    }
  }

  /**
   * Clear authentication-related localStorage data
   */
  clearAuthLocalStorage(): void {
    if (typeof window === 'undefined') return;

    const authKeys = [
      'emailForSignIn',
      'user-logged-out', 
      'auth-state-changed',
      'cache-bust-timestamp'
    ];

    authKeys.forEach(key => {
      localStorage.removeItem(key);
    });

    // Clear all Firebase-related localStorage
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('firebase:') || key.includes('firebaseui'))) {
        localStorage.removeItem(key);
      }
    }

    console.log('✅ Auth localStorage cleared');
  }

  /**
   * Trigger server-side cache busting
   */
  async triggerServerCacheBust(): Promise<void> {
    try {
      const response = await fetch('/api/cache-bust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({ action: 'emergency-invalidate' })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Server cache bust triggered:', data);
      } else {
        console.warn('⚠️ Server cache bust failed:', response.status);
      }
    } catch (error) {
      console.error('❌ Server cache bust error:', error);
    }
  }

  /**
   * Force page reload with cache busting parameters
   */
  forceReloadWithCacheBust(): void {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    url.searchParams.set('cache_bust', this.generateCacheBustId());
    url.searchParams.set('force_reload', '1');
    url.searchParams.set('_t', Date.now().toString());
    
    console.log('🔄 Force reloading with cache bust:', url.toString());
    window.location.href = url.toString();
  }

  /**
   * Add cache-busting parameters to URLs
   */
  addCacheBustToUrl(url: string): string {
    const urlObj = new URL(url, window.location.origin);
    urlObj.searchParams.set('cb', this.cacheBustId);
    urlObj.searchParams.set('_t', Date.now().toString());
    return urlObj.toString();
  }

  /**
   * Create cache-busting fetch wrapper
   */
  async cacheBustedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const cacheBustedUrl = this.addCacheBustToUrl(url);
    
    const defaultHeaders = {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };

    const mergedOptions: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    };

    return fetch(cacheBustedUrl, mergedOptions);
  }

  /**
   * Force authentication state refresh with cache busting
   */
  async refreshAuthWithCacheBust(): Promise<void> {
    console.log('🔄 Refreshing auth state with cache busting');
    
    try {
      // Clear auth caches first
      await this.clearBrowserCaches();
      
      // Force Firebase auth state refresh
      if (typeof window !== 'undefined' && window.location) {
        const url = new URL(window.location.href);
        url.searchParams.set('auth_refresh', Date.now().toString());
        url.searchParams.set('cache_bust', this.generateCacheBustId());
        
        // Use replace to avoid adding to history
        window.location.replace(url.toString());
      }
    } catch (error) {
      console.error('❌ Auth refresh with cache bust failed:', error);
    }
  }
}

// Singleton instance
export const cacheBuster = CacheBuster.getInstance();

// Utility functions for common use cases
export const emergencyInvalidateCache = () => cacheBuster.emergencyInvalidateAll();
export const cacheBustedFetch = (url: string, options?: RequestInit) => 
  cacheBuster.cacheBustedFetch(url, options);
export const refreshAuthWithCacheBust = () => cacheBuster.refreshAuthWithCacheBust();
export const addCacheBustToUrl = (url: string) => cacheBuster.addCacheBustToUrl(url);