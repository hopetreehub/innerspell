// 성능 모니터링 및 로깅 유틸리티

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: number;
  userId?: string;
  metadata?: Record<string, any>;
}

class MonitoringService {
  private metrics: PerformanceMetric[] = [];
  private errors: ErrorReport[] = [];
  private isProduction = process.env.NODE_ENV === 'production';

  // 성능 메트릭 기록
  recordMetric(name: string, value: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);

    // 개발 환경에서는 콘솔에 출력
    if (!this.isProduction) {
      console.log(`[Metric] ${name}: ${value}ms`, metadata);
    }

    // 프로덕션에서는 Firebase Analytics나 다른 서비스로 전송
    if (this.isProduction && typeof window !== 'undefined') {
      this.sendMetricToAnalytics(metric);
    }

    // 메모리 관리: 최근 100개만 유지
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  // 에러 리포팅
  reportError(error: Error, metadata?: Record<string, any>) {
    const errorReport: ErrorReport = {
      message: error.message,
      stack: error.stack,
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
      timestamp: Date.now(),
      metadata,
    };

    this.errors.push(errorReport);

    // 개발 환경에서는 콘솔에 출력
    if (!this.isProduction) {
      console.error('[Error Report]', errorReport);
    }

    // 프로덕션에서는 에러 리포팅 서비스로 전송
    if (this.isProduction) {
      this.sendErrorToReporting(errorReport);
    }

    // 메모리 관리: 최근 50개만 유지
    if (this.errors.length > 50) {
      this.errors = this.errors.slice(-50);
    }
  }

  // 함수 실행 시간 측정
  async measureAsync<T>(name: string, fn: () => Promise<T>, metadata?: Record<string, any>): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await fn();
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration, { ...metadata, success: true });
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration, { ...metadata, success: false });
      this.reportError(error as Error, { operation: name, ...metadata });
      throw error;
    }
  }

  // 동기 함수 실행 시간 측정
  measure<T>(name: string, fn: () => T, metadata?: Record<string, any>): T {
    const startTime = performance.now();
    
    try {
      const result = fn();
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration, { ...metadata, success: true });
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration, { ...metadata, success: false });
      this.reportError(error as Error, { operation: name, ...metadata });
      throw error;
    }
  }

  // Web Vitals 측정 (클라이언트 사이드)
  measureWebVitals() {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.recordMetric('LCP', lastEntry.startTime, { type: 'web-vital' });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        this.recordMetric('FID', entry.processingStart - entry.startTime, { type: 'web-vital' });
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      this.recordMetric('CLS', clsValue, { type: 'web-vital' });
    }).observe({ entryTypes: ['layout-shift'] });
  }

  // Firebase Analytics로 메트릭 전송 (프로덕션)
  private sendMetricToAnalytics(metric: PerformanceMetric) {
    // Firebase Analytics 구현
    // gtag('event', 'performance_metric', {
    //   metric_name: metric.name,
    //   metric_value: metric.value,
    //   custom_parameters: metric.metadata
    // });
  }

  // 에러 리포팅 서비스로 전송 (프로덕션)
  private sendErrorToReporting(errorReport: ErrorReport) {
    // Sentry, LogRocket, 또는 Firebase Crashlytics 구현
    // Sentry.captureException(new Error(errorReport.message), {
    //   extra: errorReport.metadata,
    //   tags: {
    //     url: errorReport.url,
    //     timestamp: errorReport.timestamp
    //   }
    // });
  }

  // 현재 메트릭 요약 반환
  getMetricsSummary() {
    const summary: Record<string, { count: number; avg: number; min: number; max: number }> = {};

    this.metrics.forEach(metric => {
      if (!summary[metric.name]) {
        summary[metric.name] = { count: 0, avg: 0, min: Infinity, max: -Infinity };
      }

      const s = summary[metric.name];
      s.count++;
      s.min = Math.min(s.min, metric.value);
      s.max = Math.max(s.max, metric.value);
      s.avg = (s.avg * (s.count - 1) + metric.value) / s.count;
    });

    return summary;
  }
}

// 싱글톤 인스턴스
export const monitoring = new MonitoringService();

// React Hook for client-side monitoring
export function useMonitoring() {
  return {
    recordMetric: monitoring.recordMetric.bind(monitoring),
    reportError: monitoring.reportError.bind(monitoring),
    measureAsync: monitoring.measureAsync.bind(monitoring),
    measure: monitoring.measure.bind(monitoring),
  };
}

// HOC for component performance monitoring
import React from 'react';

export function withMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  return function MonitoredComponent(props: P) {
    const startTime = performance.now();

    React.useEffect(() => {
      const renderTime = performance.now() - startTime;
      monitoring.recordMetric(`component_render_${componentName}`, renderTime, {
        component: componentName,
      });
    }, []);

    return React.createElement(WrappedComponent, props);
  };
}