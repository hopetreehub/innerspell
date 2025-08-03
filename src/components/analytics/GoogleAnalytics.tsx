'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface GoogleAnalyticsProps {
  GA_MEASUREMENT_ID: string;
}

// Google Analytics 4 이벤트 타입
export interface GAEvent {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

// 커스텀 이벤트 정의
export interface CustomEvents {
  // 타로 관련 이벤트
  tarot_reading_started: {
    spread_type: string;
    question_type: string;
  };
  tarot_reading_completed: {
    spread_type: string;
    interpretation_length: number;
    satisfaction_rating?: number;
  };
  tarot_card_viewed: {
    card_name: string;
    card_meaning: string;
    source: 'reading' | 'encyclopedia';
  };
  
  // 사용자 행동 이벤트
  user_registration: {
    method: 'email' | 'google';
  };
  user_login: {
    method: 'email' | 'google';
  };
  
  // 컨텐츠 이벤트
  blog_post_read: {
    post_title: string;
    reading_time: number;
    scroll_depth: number;
  };
  
  // 에러 이벤트
  error_occurred: {
    error_type: string;
    error_message: string;
    page_url: string;
  };
  
  // 성능 이벤트
  page_performance: {
    page_load_time: number;
    largest_contentful_paint: number;
    first_contentful_paint: number;
  };
}

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date | any,
      config?: any
    ) => void;
    dataLayer: any[];
  }
}

export default function GoogleAnalytics({ GA_MEASUREMENT_ID }: GoogleAnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 페이지 변경 추적
  useEffect(() => {
    if (pathname && typeof window !== 'undefined' && window.gtag) {
      const url = pathname + (searchParams ? `?${searchParams.toString()}` : '');
      
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_location: window.location.origin + url,
        page_title: document.title,
        custom_map: {
          custom_dimension_1: 'user_type',
          custom_dimension_2: 'subscription_status',
        },
      });
      
      // 페이지뷰 이벤트
      window.gtag('event', 'page_view', {
        page_location: window.location.origin + url,
        page_title: document.title,
      });
    }
  }, [pathname, searchParams, GA_MEASUREMENT_ID]);

  // 초기 설정
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 개인정보 보호 설정 - gtag consent API 사용
      (window as any).gtag('consent', 'default', {
        analytics_storage: 'granted',
        ad_storage: 'denied',
        personalization_storage: 'denied',
        functionality_storage: 'granted',
        security_storage: 'granted',
      });

      // 사용자 속성 설정
      window.gtag('set', {
        custom_dimension_1: 'anonymous', // 사용자 타입
        custom_dimension_2: 'free', // 구독 상태
      });
    }
  }, []);

  if (!GA_MEASUREMENT_ID || process.env.NODE_ENV !== 'production') {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_location: window.location.href,
              page_title: document.title,
              send_page_view: false, // 수동으로 페이지뷰 전송
              anonymize_ip: true,
              allow_google_signals: false,
              cookie_flags: 'SameSite=Strict;Secure',
            });
          `,
        }}
      />
    </>
  );
}

// GA4 이벤트 추적 함수들
export const analytics = {
  // 기본 이벤트 전송
  event: (eventName: string, parameters?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, {
        timestamp_micros: Date.now() * 1000,
        ...parameters,
      });
    }
  },

  // 타로 리딩 시작
  trackTarotReadingStarted: (params: CustomEvents['tarot_reading_started']) => {
    analytics.event('tarot_reading_started', {
      event_category: 'tarot',
      event_label: params.spread_type,
      spread_type: params.spread_type,
      question_type: params.question_type,
    });
  },

  // 타로 리딩 완료
  trackTarotReadingCompleted: (params: CustomEvents['tarot_reading_completed']) => {
    analytics.event('tarot_reading_completed', {
      event_category: 'tarot',
      event_label: params.spread_type,
      value: params.interpretation_length,
      spread_type: params.spread_type,
      interpretation_length: params.interpretation_length,
      satisfaction_rating: params.satisfaction_rating,
    });
  },

  // 타로 카드 조회
  trackTarotCardViewed: (params: CustomEvents['tarot_card_viewed']) => {
    analytics.event('tarot_card_viewed', {
      event_category: 'content',
      event_label: params.card_name,
      card_name: params.card_name,
      card_meaning: params.card_meaning,
      source: params.source,
    });
  },

  // 사용자 등록
  trackUserRegistration: (params: CustomEvents['user_registration']) => {
    analytics.event('sign_up', {
      method: params.method,
    });
  },

  // 사용자 로그인
  trackUserLogin: (params: CustomEvents['user_login']) => {
    analytics.event('login', {
      method: params.method,
    });
  },

  // 블로그 포스트 읽기
  trackBlogPostRead: (params: CustomEvents['blog_post_read']) => {
    analytics.event('blog_post_read', {
      event_category: 'content',
      event_label: params.post_title,
      value: params.reading_time,
      post_title: params.post_title,
      reading_time: params.reading_time,
      scroll_depth: params.scroll_depth,
    });
  },

  // 에러 추적
  trackError: (params: CustomEvents['error_occurred']) => {
    analytics.event('exception', {
      description: params.error_message,
      fatal: false,
      error_type: params.error_type,
      page_url: params.page_url,
    });
  },

  // 성능 추적
  trackPerformance: (params: CustomEvents['page_performance']) => {
    analytics.event('timing_complete', {
      name: 'page_load',
      value: params.page_load_time,
    });
    
    analytics.event('web_vitals', {
      name: 'LCP',
      value: params.largest_contentful_paint,
      metric_id: 'LCP',
    });
    
    analytics.event('web_vitals', {
      name: 'FCP',
      value: params.first_contentful_paint,
      metric_id: 'FCP',
    });
  },

  // 사용자 속성 업데이트
  setUserProperties: (properties: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('set', 'user_properties', properties);
    }
  },

  // 맞춤 차원 설정
  setCustomDimensions: (dimensions: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('set', dimensions);
    }
  },

  // 전환 추적
  trackConversion: (conversionId: string, conversionLabel?: string, value?: number) => {
    analytics.event('conversion', {
      send_to: `${conversionId}/${conversionLabel}`,
      value: value,
      currency: 'KRW',
    });
  },

  // 스크롤 깊이 추적
  trackScrollDepth: (depth: number) => {
    analytics.event('scroll', {
      percent_scrolled: depth,
    });
  },

  // 파일 다운로드 추적
  trackFileDownload: (fileName: string, fileType: string) => {
    analytics.event('file_download', {
      event_category: 'download',
      event_label: fileName,
      file_name: fileName,
      file_type: fileType,
    });
  },

  // 외부 링크 클릭 추적
  trackOutboundLink: (url: string, linkText: string) => {
    analytics.event('click', {
      event_category: 'outbound',
      event_label: url,
      link_url: url,
      link_text: linkText,
    });
  },
};