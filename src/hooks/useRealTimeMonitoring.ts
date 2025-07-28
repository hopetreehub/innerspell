'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface ActiveUser {
  lastSeen: string;
  userId: string;
  page: string;
}

interface RealTimeStats {
  totalActiveUsers: number;
  currentTarotReadings: number;
  currentDreamInterpretations: number;
  averageResponseTime: number;
  errorRate: number;
  pageViews: number;
  memoryUsage?: number;
  cpuUsage?: number;
}

interface RecentEvent {
  id: string;
  type: 'tarot_reading' | 'dream_interpretation' | 'page_view' | 'error' | 'user_action';
  userId: string;
  timestamp: string;
  details: Record<string, any>;
}

interface RealTimeData {
  activeUsers: ActiveUser[];
  stats: RealTimeStats;
  recentEvents: RecentEvent[];
}

interface MonitoringState {
  data: RealTimeData | null;
  connected: boolean;
  error: string | null;
  lastUpdate: Date | null;
}

export function useRealTimeMonitoring() {
  const [state, setState] = useState<MonitoringState>({
    data: null,
    connected: false,
    error: null,
    lastUpdate: null
  });

  const { getAuthToken } = useAuth();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        setState(prev => ({ ...prev, error: '인증 토큰이 없습니다.' }));
        return;
      }

      // 기존 연결 정리
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // SSE 연결 생성
      const eventSource = new EventSource(`/api/admin/live-stats`, {
        withCredentials: true
      });

      // 연결 헤더에 인증 토큰 추가를 위한 커스텀 fetch 방식
      const response = await fetch('/api/admin/live-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('응답 본문이 없습니다.');
      }

      // ReadableStream을 사용한 SSE 처리
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      setState(prev => ({ ...prev, connected: true, error: null }));
      reconnectAttempts.current = 0;

      const processStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              console.log('SSE 스트림 종료');
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  handleSSEMessage(data);
                } catch (parseError) {
                  console.warn('SSE 데이터 파싱 오류:', parseError);
                }
              }
            }
          }
        } catch (streamError) {
          console.error('SSE 스트림 처리 오류:', streamError);
          handleConnectionError('스트림 처리 중 오류가 발생했습니다.');
        } finally {
          reader.releaseLock();
        }
      };

      processStream();

    } catch (error) {
      console.error('SSE 연결 오류:', error);
      handleConnectionError(error instanceof Error ? error.message : '연결 오류');
    }
  };

  const handleSSEMessage = (message: any) => {
    try {
      setState(prev => ({
        ...prev,
        data: message.data,
        lastUpdate: new Date(),
        error: null
      }));

      if (message.type === 'error') {
        console.warn('서버에서 오류 메시지:', message.data);
      }
    } catch (error) {
      console.error('SSE 메시지 처리 오류:', error);
    }
  };

  const handleConnectionError = (errorMessage: string) => {
    setState(prev => ({
      ...prev,
      connected: false,
      error: errorMessage
    }));

    // 자동 재연결 로직
    if (reconnectAttempts.current < maxReconnectAttempts) {
      reconnectAttempts.current++;
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
      
      console.log(`${delay}ms 후 재연결 시도 (${reconnectAttempts.current}/${maxReconnectAttempts})`);
      
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, delay);
    } else {
      setState(prev => ({
        ...prev,
        error: '최대 재연결 시도 횟수를 초과했습니다. 새로고침해 주세요.'
      }));
    }
  };

  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setState(prev => ({ ...prev, connected: false }));
  };

  const reconnect = () => {
    disconnect();
    reconnectAttempts.current = 0;
    connect();
  };

  // 컴포넌트 마운트 시 연결
  useEffect(() => {
    connect();

    // 언마운트 시 정리
    return () => {
      disconnect();
    };
  }, []);

  // 브라우저 가시성 변경 처리
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // 페이지가 숨겨졌을 때는 연결 유지
      } else {
        // 페이지가 다시 보일 때 연결 상태 확인
        if (!state.connected) {
          reconnect();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [state.connected]);

  return {
    ...state,
    reconnect,
    disconnect,
    isConnected: state.connected,
    hasError: !!state.error
  };
}