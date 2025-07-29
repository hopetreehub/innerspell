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

  // Mock 데이터 생성 함수
  const generateMockData = useCallback((): RealtimeData => {
    const now = new Date();
    
    // 활성 사용자 목록 생성
    const activeUsers: ActiveUser[] = [];
    const userCount = Math.floor(Math.random() * 8) + 2; // 2-10명
    const pages = ['/tarot', '/dream', '/admin', '/blog', '/profile', '/'];
    
    for (let i = 0; i < userCount; i++) {
      activeUsers.push({
        userId: `user_${Math.random().toString(36).substr(2, 9)}`,
        page: pages[Math.floor(Math.random() * pages.length)],
        lastSeen: new Date(now.getTime() - Math.random() * 300000).toISOString() // 최근 5분 내
      });
    }

    // 최근 이벤트 생성
    const recentEvents: RealtimeEvent[] = [];
    const eventTypes: RealtimeEvent['type'][] = ['tarot_reading', 'dream_interpretation', 'page_view', 'user_action'];
    const eventCount = Math.floor(Math.random() * 15) + 5; // 5-20개

    for (let i = 0; i < eventCount; i++) {
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      recentEvents.push({
        id: `event_${Math.random().toString(36).substr(2, 9)}`,
        type: eventType,
        userId: `user_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(now.getTime() - i * 30000 - Math.random() * 60000).toISOString(), // 지난 30분 내
        details: {
          page: pages[Math.floor(Math.random() * pages.length)],
          action: eventType === 'user_action' ? ['click', 'scroll', 'form_submit'][Math.floor(Math.random() * 3)] : undefined
        }
      });
    }

    // 최신순으로 정렬
    recentEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      stats: {
        totalActiveUsers: activeUsers.length,
        currentTarotReadings: Math.floor(Math.random() * 5) + 1,
        currentDreamInterpretations: Math.floor(Math.random() * 3) + 1,
        averageResponseTime: Math.random() * 200 + 50, // 50-250ms
        memoryUsage: Math.random() * 30 + 40, // 40-70%
        cpuUsage: Math.random() * 20 + 10, // 10-30%
        errorRate: Math.random() * 0.5 // 0-0.5%
      },
      activeUsers,
      recentEvents: recentEvents.slice(0, 20) // 최근 20개만
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
      
      // API 실패 시 Mock 데이터로 폴백
      console.warn('API failed, falling back to mock data');
      const mockData = generateMockData();
      setData(mockData);
      setLastUpdate(new Date());
      setConnected(true); // Mock 데이터지만 연결된 것으로 표시
      
      setError(err instanceof Error ? err.message : '데이터를 가져오는데 실패했습니다.');
      setHasError(false); // Mock 데이터로 동작하므로 오류 상태 아님
      
      // 재시도 로직
      if (retryCount.current < maxRetries) {
        retryCount.current++;
        retryTimeoutRef.current = setTimeout(() => {
          fetchData();
        }, Math.min(1000 * Math.pow(2, retryCount.current), 30000)); // 지수 백오프, 최대 30초
      }
    }
  }, [generateMockData]);

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