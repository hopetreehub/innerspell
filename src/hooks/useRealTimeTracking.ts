'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

interface TrackingEvent {
  type: 'tarot_reading' | 'dream_interpretation' | 'page_view' | 'error' | 'user_action';
  userId?: string;
  sessionId?: string;
  details?: Record<string, any>;
}

export function useRealTimeTracking() {
  const { user } = useAuth();
  const sessionId = useRef<string>();
  const lastHeartbeat = useRef<Date>(new Date());

  // 세션 ID 생성
  useEffect(() => {
    if (!sessionId.current) {
      sessionId.current = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
  }, []);

  // 하트비트 - 5초마다 활성 상태 전송
  useEffect(() => {
    const heartbeatInterval = setInterval(() => {
      if (user && sessionId.current) {
        trackEvent({
          type: 'user_action',
          userId: user.uid,
          sessionId: sessionId.current,
          details: {
            page: window.location.pathname,
            action: 'heartbeat',
            timestamp: new Date().toISOString()
          }
        });
        lastHeartbeat.current = new Date();
      }
    }, 5000);

    return () => clearInterval(heartbeatInterval);
  }, [user]);

  // 페이지 이동 추적
  useEffect(() => {
    const handleRouteChange = () => {
      if (user && sessionId.current) {
        trackEvent({
          type: 'page_view',
          userId: user.uid,
          sessionId: sessionId.current,
          details: {
            page: window.location.pathname,
            referrer: document.referrer,
            timestamp: new Date().toISOString()
          }
        });
      }
    };

    // 페이지 로드시 추적
    handleRouteChange();

    // popstate 이벤트 리스너 (뒤로가기/앞으로가기)
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [user]);

  // 오류 추적
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      trackEvent({
        type: 'error',
        userId: user?.uid,
        sessionId: sessionId.current,
        details: {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack,
          timestamp: new Date().toISOString()
        }
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackEvent({
        type: 'error',
        userId: user?.uid,
        sessionId: sessionId.current,
        details: {
          message: 'Unhandled Promise Rejection',
          reason: event.reason,
          timestamp: new Date().toISOString()
        }
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [user]);

  // 이벤트 전송 함수
  const trackEvent = async (event: TrackingEvent) => {
    try {
      await fetch('/api/admin/live-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.warn('실시간 추적 이벤트 전송 실패:', error);
    }
  };

  // 타로 리딩 추적
  const trackTarotReading = (details: Record<string, any>) => {
    trackEvent({
      type: 'tarot_reading',
      userId: user?.uid,
      sessionId: sessionId.current,
      details: {
        ...details,
        timestamp: new Date().toISOString()
      }
    });
  };

  // 꿈해몽 추적
  const trackDreamInterpretation = (details: Record<string, any>) => {
    trackEvent({
      type: 'dream_interpretation',
      userId: user?.uid,
      sessionId: sessionId.current,
      details: {
        ...details,
        timestamp: new Date().toISOString()
      }
    });
  };

  // 사용자 액션 추적
  const trackUserAction = (action: string, details: Record<string, any> = {}) => {
    trackEvent({
      type: 'user_action',
      userId: user?.uid,
      sessionId: sessionId.current,
      details: {
        action,
        ...details,
        timestamp: new Date().toISOString()
      }
    });
  };

  return {
    sessionId: sessionId.current,
    trackTarotReading,
    trackDreamInterpretation,
    trackUserAction,
    trackEvent
  };
}