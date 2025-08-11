'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface RealtimeStats {
  totalActiveUsers: number;
  currentTarotReadings: number;
  currentDreamInterpretations: number;
  averageResponseTime: number;
  memoryUsage?: number;
  cpuUsage?: number;
  errorRate?: number;
}

export interface ActiveUser {
  userId: string;
  page: string;
  lastSeen: string;
}

export interface RealtimeEvent {
  id: string;
  type: 'tarot_reading' | 'dream_interpretation' | 'page_view' | 'error' | 'user_action';
  userId: string;
  timestamp: string;
  details: {
    page?: string;
    action?: string;
    error?: string;
  };
}

export interface RealtimeData {
  stats: RealtimeStats;
  activeUsers: ActiveUser[];
  recentEvents: RealtimeEvent[];
}

export interface UseRealTimeMonitoringReturn {
  data: RealtimeData | null;
  connected: boolean;
  error: string | null;
  lastUpdate: Date | null;
  reconnect: () => void;
  hasError: boolean;
}

export function useRealTimeMonitoring(): UseRealTimeMonitoringReturn {
  const [data, setData] = useState<RealtimeData | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [hasError, setHasError] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCount = useRef(0);
  const maxRetries = 5;

  // 실제 Firebase 데이터를 기반으로 한 기본 데이터 생성
  const generateFallbackData = useCallback((): RealtimeData => {
    console.log('🔄 Real-time monitoring: Using fallback with basic Firebase data');
    
    // API 실패 시 기본값으로 제공할 안전한 데이터
    return {
      stats: {
        totalActiveUsers: 0,
        currentTarotReadings: 0, 
        currentDreamInterpretations: 0,
        averageResponseTime: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        errorRate: 0
      },
      activeUsers: [],
      recentEvents: []
    };
  }, []);

  // 데이터 페치 함수
  const fetchData = useCallback(async () => {
    try {
      // 실제 API 엔드포인트 호출
      const response = await fetch('/api/admin/realtime', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const apiData = await response.json();
      
      // API 응답을 우리 인터페이스에 맞게 변환
      const transformedData: RealtimeData = {
        stats: {
          totalActiveUsers: apiData.stats.totalActiveUsers,
          currentTarotReadings: apiData.stats.currentTarotReadings,
          currentDreamInterpretations: apiData.stats.currentDreamInterpretations,
          averageResponseTime: apiData.stats.averageResponseTime,
          memoryUsage: apiData.stats.memoryUsage,
          cpuUsage: apiData.stats.cpuUsage,
          errorRate: apiData.stats.errorRate
        },
        activeUsers: apiData.activeUsers.map((user: any) => ({
          userId: user.userId,
          page: user.page,
          lastSeen: user.lastSeen
        })),
        recentEvents: apiData.recentEvents.map((event: any) => ({
          id: event.id,
          type: event.type,
          userId: event.userId,
          timestamp: event.timestamp,
          details: event.details
        }))
      };
      
      setData(transformedData);
      setLastUpdate(new Date());
      setConnected(true);
      setError(null);
      setHasError(false);
      retryCount.current = 0;
      
    } catch (err) {
      console.error('Real-time data fetch error:', err);
      
      // API 실패 시 기본 빈 데이터로 폴백 (Mock 데이터 제거)
      console.warn('API failed, using fallback data with zeros');
      const fallbackData = generateFallbackData();
      setData(fallbackData);
      setLastUpdate(new Date());
      setConnected(false); // 실제 연결 실패 상태 표시
      
      setError(err instanceof Error ? err.message : '실시간 데이터 연결에 실패했습니다.');
      setHasError(true); // 실제 오류 상태 표시
      
      // 재시도 로직
      if (retryCount.current < maxRetries) {
        retryCount.current++;
        retryTimeoutRef.current = setTimeout(() => {
          fetchData();
        }, Math.min(1000 * Math.pow(2, retryCount.current), 30000)); // 지수 백오프, 최대 30초
      }
    }
  }, [generateFallbackData]);

  // 연결 함수
  const connect = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // 초기 데이터 로드
    fetchData();
    
    // 5초마다 데이터 업데이트 (실제로는 SSE나 WebSocket 사용)
    intervalRef.current = setInterval(fetchData, 5000);
  }, [fetchData]);

  // 재연결 함수
  const reconnect = useCallback(() => {
    retryCount.current = 0;
    setError(null);
    setHasError(false);
    connect();
  }, [connect]);

  // 컴포넌트 마운트 시 연결 시작
  useEffect(() => {
    connect();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [connect]);

  // 페이지 가시성 변경 시 연결 관리
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // 페이지가 숨겨지면 연결 일시 중지
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setConnected(false);
      } else {
        // 페이지가 다시 보이면 연결 재시작
        connect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [connect]);

  return {
    data,
    connected,
    error,
    lastUpdate,
    reconnect,
    hasError
  };
}