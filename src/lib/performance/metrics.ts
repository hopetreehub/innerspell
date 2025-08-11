/**
 * Performance monitoring utilities
 */

// Core Web Vitals 측정
export interface PerformanceMetrics {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  navigationType: string;
  timestamp: number;
}

// Core Web Vitals 임계값
const THRESHOLDS = {
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
  FID: { good: 100, poor: 300 },   // First Input Delay
  CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
  TTFB: { good: 800, poor: 1800 }, // Time to First Byte
  INP: { good: 200, poor: 500 },   // Interaction to Next Paint
};

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

// Performance Observer를 사용한 메트릭 수집
export function observePerformanceMetrics(callback: (metric: PerformanceMetrics) => void) {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return;
  }

  try {
    // Core Web Vitals 측정
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const metric: PerformanceMetrics = {
          name: entry.name,
          value: entry.value || (entry as any).processingStart || 0,
          rating: getRating(entry.name, entry.value || 0),
          navigationType: (performance.navigation as any)?.type || 'navigate',
          timestamp: Date.now(),
        };
        callback(metric);
      }
    });

    // 다양한 성능 메트릭 관찰
    const entryTypes = ['largest-contentful-paint', 'first-input', 'layout-shift'];
    entryTypes.forEach(type => {
      try {
        observer.observe({ type, buffered: true });
      } catch (e) {
        console.warn(`Performance observer failed for ${type}:`, e);
      }
    });

    // Navigation timing 측정
    const navObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const navEntry = entry as PerformanceNavigationTiming;
        
        // TTFB (Time to First Byte)
        const ttfb = navEntry.responseStart - navEntry.requestStart;
        callback({
          name: 'TTFB',
          value: ttfb,
          rating: getRating('TTFB', ttfb),
          navigationType: navEntry.type,
          timestamp: Date.now(),
        });

        // FCP (First Contentful Paint)
        if (navEntry.loadEventEnd > 0) {
          const fcp = navEntry.domContentLoadedEventEnd - navEntry.fetchStart;
          callback({
            name: 'FCP',
            value: fcp,
            rating: getRating('FCP', fcp),
            navigationType: navEntry.type,
            timestamp: Date.now(),
          });
        }
      }
    });

    navObserver.observe({ type: 'navigation', buffered: true });

  } catch (error) {
    console.warn('Performance monitoring setup failed:', error);
  }
}

// 리소스 로딩 성능 측정
export function observeResourcePerformance(callback: (resource: any) => void) {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return;
  }

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const resource = entry as PerformanceResourceTiming;
      
      if (resource.transferSize > 100000) { // 100KB 이상의 리소스만
        callback({
          name: resource.name,
          type: resource.initiatorType,
          size: resource.transferSize,
          duration: resource.duration,
          timestamp: Date.now(),
        });
      }
    }
  });

  observer.observe({ type: 'resource', buffered: true });
}

// 메모리 사용량 모니터링
export function getMemoryInfo(): any {
  if (typeof window === 'undefined' || !(performance as any).memory) {
    return null;
  }

  const memory = (performance as any).memory;
  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
    usageRatio: memory.usedJSHeapSize / memory.jsHeapSizeLimit,
    timestamp: Date.now(),
  };
}

// 네트워크 정보
export function getNetworkInfo(): any {
  if (typeof window === 'undefined' || !(navigator as any).connection) {
    return null;
  }

  const connection = (navigator as any).connection;
  return {
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData,
    timestamp: Date.now(),
  };
}

// 사용자 지정 성능 마커
const customMarks = new Map<string, number>();

export function markPerformanceStart(name: string) {
  if (typeof window === 'undefined') return;
  
  const timestamp = performance.now();
  customMarks.set(name, timestamp);
  
  try {
    performance.mark(`${name}-start`);
  } catch (e) {
    console.warn('Performance mark failed:', e);
  }
}

export function markPerformanceEnd(name: string): number | null {
  if (typeof window === 'undefined') return null;
  
  const startTime = customMarks.get(name);
  if (!startTime) return null;
  
  const duration = performance.now() - startTime;
  customMarks.delete(name);
  
  try {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
  } catch (e) {
    console.warn('Performance measure failed:', e);
  }
  
  return duration;
}

// 성능 데이터를 서버로 전송
export async function reportPerformanceMetrics(metrics: PerformanceMetrics[]) {
  if (process.env.NODE_ENV !== 'production') return;
  
  try {
    // Google Analytics로 성능 데이터 전송
    if (typeof window !== 'undefined' && window.gtag) {
      metrics.forEach(metric => {
        window.gtag('event', 'web_vitals', {
          name: metric.name,
          value: Math.round(metric.value),
          metric_rating: metric.rating,
          navigation_type: metric.navigationType,
        });
      });
    }

    // 자체 서버로도 전송
    await fetch('/api/analytics/performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metrics,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: Date.now(),
      }),
    });
  } catch (error) {
    console.warn('Failed to report performance metrics:', error);
  }
}

// 초기화 함수
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;
  
  const metrics: PerformanceMetrics[] = [];
  
  // 메트릭 수집
  observePerformanceMetrics((metric) => {
    metrics.push(metric);
    
    // 실시간으로 중요한 메트릭 로깅
    if (metric.rating === 'poor') {
      console.warn(`Poor performance detected: ${metric.name} = ${metric.value}ms`);
    }
  });
  
  // 페이지 언로드 시 메트릭 전송
  window.addEventListener('beforeunload', () => {
    if (metrics.length > 0) {
      reportPerformanceMetrics(metrics);
    }
  });
  
  // 주기적으로 메모리 사용량 체크
  setInterval(() => {
    const memoryInfo = getMemoryInfo();
    if (memoryInfo && memoryInfo.usageRatio > 0.8) {
      console.warn('High memory usage detected:', memoryInfo);
    }
  }, 30000); // 30초마다
}