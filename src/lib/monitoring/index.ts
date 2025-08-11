/**
 * 모니터링 및 에러 추적 설정
 * Sentry를 사용한 에러 추적과 성능 모니터링
 */

interface ErrorContext {
  userId?: string;
  email?: string;
  action?: string;
  metadata?: Record<string, any>;
}

class MonitoringService {
  private initialized = false;

  init() {
    if (this.initialized || typeof window === 'undefined') return;
    
    // Production에서만 Sentry 초기화
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
      // Sentry는 별도로 설치 필요
      // npm install @sentry/nextjs
      console.log('Monitoring service initialized');
      this.initialized = true;
    }
  }

  // 에러 로깅
  logError(error: Error, context?: ErrorContext) {
    console.error('Error:', error.message, context);
    
    if (process.env.NODE_ENV === 'production') {
      // Sentry로 에러 전송
      // Sentry.captureException(error, { extra: context });
    }
  }

  // 사용자 행동 추적
  trackEvent(eventName: string, properties?: Record<string, any>) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Track Event:', eventName, properties);
    }
    
    // Google Analytics 이벤트 추적
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, properties);
    }
  }

  // 성능 측정
  measurePerformance(metricName: string, value: number) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance Metric:', metricName, value);
    }
    
    // Web Vitals 전송
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', metricName, {
        value: Math.round(value),
        metric_name: metricName,
        non_interaction: true,
      });
    }
  }

  // API 호출 추적
  async trackAPICall<T>(
    apiName: string,
    apiCall: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await apiCall();
      const duration = Date.now() - startTime;
      
      this.trackEvent('api_call_success', {
        api_name: apiName,
        duration,
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.trackEvent('api_call_error', {
        api_name: apiName,
        duration,
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });
      
      throw error;
    }
  }

  // 사용자 식별
  identifyUser(userId: string, traits?: Record<string, any>) {
    if (process.env.NODE_ENV === 'production') {
      // Sentry 사용자 컨텍스트 설정
      // Sentry.setUser({ id: userId, ...traits });
      
      // GA 사용자 ID 설정
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
          user_id: userId,
        });
      }
    }
  }

  // 페이지 뷰 추적
  trackPageView(url: string) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        page_path: url,
      });
    }
  }
}

export const monitoring = new MonitoringService();